import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Publications as PublicS } from '../../../../../services/publications';



interface ImagePreview {
  file?: File;
  url: string;
  id: number;
  serverId?:number;
  toDelete?: boolean; 

}

@Component({
  selector: 'app-create-publicacion',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './create-publicacion.html',
  styleUrl: './create-publicacion.css'
})
export class CreatePublicacion {
  private fb = inject(FormBuilder);
  private toast = inject(ToastrService);
  private router = inject(Router);
  private publiService = inject(PublicS);
  private route=inject(ActivatedRoute)
  id!:number
  Titulo:string="Nueva Publicación"

  publicacionForm: FormGroup;
  imagePreviews = signal<ImagePreview[]>([]);
  imagesToDelete = signal<number[]>([]);
  publicando = signal(false);
  maxImages = 4;

  constructor() {
    this.publicacionForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
      contenido: ['', [Validators.maxLength(250)]]
    });
  }

  ngOnInit(){
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if(this.id){
      this.Titulo="Editar Publicación"
      this.getInforPublic()
    }
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const currentImages = this.imagePreviews().length;
    const availableSlots = this.maxImages - currentImages;

    if (files.length > availableSlots) {
      this.toast.warning(`Solo puedes agregar ${availableSlots} imagen(es) más`);
      return;
    }

    // Valida tipo y tamaño
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        this.toast.error(`${file.name} no es una imagen válida`);
        return false;
      }
      if (!isValidSize) {
        this.toast.error(`${file.name} excede el tamaño máximo de 5MB`);
        return false;
      }
      return true;
    });

    // Crea previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ImagePreview = {
          file: file,
          url: e.target?.result as string,
          id: Date.now() + Math.random(),
          serverId:undefined,
        };
        this.imagePreviews.update(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });


    input.value = '';
  }

  removeImage(id: number, serverId?: number): void {
    if (serverId) {
      this.imagesToDelete.update(prev => [...prev, serverId]);
    }
    this.imagePreviews.update(prev => prev.filter(img => img.id !== id));
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('imageInput') as HTMLInputElement;
    fileInput?.click();
  }

  onSubmit(): void {
    if (this.publicacionForm.invalid) {
      this.publicacionForm.markAllAsTouched();
      return;
    }

    this.publicando.set(true);
    if(this.id){
      this.editarPublicacion()
    }else{
      this.createPublicacion()
    }
  }

  createPublicacion() {
    const titulo = this.publicacionForm.get('titulo')?.value;
    const contenido = this.publicacionForm.get('contenido')?.value;
    
    const images: File[] = this.imagePreviews()
      .filter(img => img.file) 
      .map(img => img.file!);

    this.publiService.create_publications(titulo, contenido, images).subscribe({
      next: (res) => {
        this.toast.success('Publicación creada con éxito');
        this.router.navigate(['/admin/publicaciones']);
      },
      error: (err) => {
        this.toast.error('Error al crear la publicación');
        this.publicando.set(false);
      }
    });
  }

  editarPublicacion() {
    const titulo = this.publicacionForm.get('titulo')?.value;
    const contenido = this.publicacionForm.get('contenido')?.value;
    
    const newImages: File[] = this.imagePreviews()
      .filter(img => img.file)
      .map(img => img.file!);

    const imagesToDelete = this.imagesToDelete();

    this.publiService.edit_Publications(
      this.id,
      titulo,
      contenido,
      newImages,
      imagesToDelete // 👈 NUEVO parámetro
    ).subscribe({
      next: (res) => {
        this.toast.success('Publicación editada con éxito');
        this.router.navigate(['/admin/publicaciones']);
      },
      error: (err) => {
        console.error('Error:', err);
        this.toast.error('Error al editar la publicación');
        this.publicando.set(false);
      }
    });
  }


  get canAddMoreImages(): boolean {
    return this.imagePreviews().length < this.maxImages;
  }

  getInforPublic() {
  this.publiService.get_publicationbyid(this.id).subscribe({
    next: res => {

      this.publicacionForm.setValue({
        titulo: res.titulo,
        contenido: res.contenido
      });

      this.imagePreviews.set([]);

      if (res.imagenes) {
        const previews = res.imagenes.map(img => ({
          file: undefined,
          url: img.ruta,             // ahora sí viene completa del backend
          id: img.id,
          serverId: img.id
        }));

          this.imagePreviews.set(previews);
        }
      },
      error: () => {
        this.toast.error("Error al cargar los datos de la publicación");
      }
    });
  }

}
