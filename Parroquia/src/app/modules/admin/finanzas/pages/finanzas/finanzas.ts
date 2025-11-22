import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Modalcomponent } from '../../../../../shared/modalcomponent/modalcomponent';
import { Finanzas as FinanzaService } from '../../../../../services/finanzas';
import { BehaviorSubject } from 'rxjs';
import { GetAllFinanzas } from '../../../../../models/finanzas';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ModalFile } from '../../../../../shared/modal-file/modal-file';
import { ModalContent } from '../../../../../models/document';
import { DomSanitizer } from '@angular/platform-browser';



@Component({
  selector: 'app-finanzas',
  imports: [CommonModule,MatIconModule,MatTooltipModule,Modalcomponent,ReactiveFormsModule,ModalFile],
  templateUrl: './finanzas.html',
  styleUrl: './finanzas.css'
})
export class Finanzas {
  toast=inject(ToastrService)
  finanzaService=inject(FinanzaService)
  private sanitizer = inject(DomSanitizer);
  allfinanzasSubject = new BehaviorSubject<GetAllFinanzas[]>([]);
  finanzasList=new BehaviorSubject<GetAllFinanzas[]>([])
  finanzas$=this.finanzasList.asObservable();

  currentPage = 1;
  itemspage=10;
  totalPages = 1;
  pages: number[]=[];

  // Modal
  isModalOpen = false;
  isModalOpen2 = false;
  evidenciaUrl: string | null = null;
  title=""
  modalOperation=""
  id_transaccion=0
  modalContent:ModalContent | null =null

  formFinanzas!:FormGroup
  selectedFileName: string | null = null;
  selectedFile: File | null = null;
  private fecha_inicio:string | null =null
  private fecha_final:string | null =null
  private idcategoria:number | null =null

  constructor(private fb:FormBuilder){
    this.formFinanzas=fb.group({
      monto: ['',Validators.required],
      id_categoria:['',Validators.required],
      descripcion:[''],
      image:['']
    })

    this.setupConditionalValidation()
  }
  
  setupConditionalValidation() {
    this.formFinanzas.get('id_categoria')?.valueChanges.subscribe(categoriaId => {
      const imageControl = this.formFinanzas.get('image');
      
      if (categoriaId >= 1 && categoriaId <= 4) {
        imageControl?.setValidators([Validators.required]);
      } else {
        imageControl?.clearValidators();
      }
      
      imageControl?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.GetFinanzas();
    console.log(this.finanzasList)
  }

  GetFinanzas(){
      this.finanzaService.GetAllTransaccion(this.fecha_inicio,this.fecha_final,this.idcategoria).subscribe(res =>{
        const finanzas=res.map(f=>({
          id_transaccion:f.id_transaccion,
          monto:f.monto,
          fecha:f.fecha,
          descripcion:f.descripcion,
          id_categoria:f.id_categoria,
          categoria:f.categoria,
          tipo_categoria:f.tipo_categoria,
          evidencia:f.evidencia
        }));
        this.allfinanzasSubject.next(finanzas)
        
        
        this.calcuPaginacion(finanzas);
        this.updatePageData();
      },

    )
  }

  calcuPaginacion(fin: GetAllFinanzas[]) {
    const totalItems = fin.length;
    this.totalPages = Math.ceil(totalItems / this.itemspage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  updatePageData() {
    const allfinanzas = this.allfinanzasSubject.value;
    const startIndex = (this.currentPage - 1) * this.itemspage;
    const endIndex = startIndex + this.itemspage;
    const paginatedfin = allfinanzas.slice(startIndex, endIndex);
    
    this.finanzasList.next(paginatedfin);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePageData();
    }
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePageData();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePageData();
    }
  }


  aplicarFiltros(event:Event,id:number) {
    const valor=(event.target as HTMLInputElement).value
    if(id === 1)
      this.fecha_inicio=valor || null;
    if(id === 2)
      this.fecha_final=valor || null;
      console.log(this.fecha_final)
    if(id === 3){
      console.log(valor)
      this.idcategoria = valor ? parseInt(valor) : null;
    }
    this.GetFinanzas();

  }

  limpiarFiltros() {
    this.fecha_final=null;
    this.fecha_inicio=null;
    this.idcategoria=null;
    const inputs = document.querySelectorAll('.filter-input') as NodeListOf<HTMLInputElement>;
    inputs.forEach(input => input.value = '');
    this.GetFinanzas()
  }

  verEvidencia(doc: string) {

    const extension = doc.split('.').pop()?.toLowerCase();
    const tipo=extension == 'pdf' ? 'pdf' : 'image';
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(doc);
    this.modalContent = {
      type:tipo,
      src:safeUrl as any,
      title:"Evidencia"
    }
    this.isModalOpen2=true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen = false;
    this.evidenciaUrl = null;
    this.title="";
    this.selectedFile = null;
    this.selectedFileName = null;
    this.modalContent = null;
    this.isModalOpen2=false;
    document.body.style.overflow = 'auto';
    this.formFinanzas.reset();
  }

  abrirModalNuevoGasto() {
    this.modalOperation="Add"
    this.isModalOpen=true
    document.body.style.overflow = 'hidden';
    this.title="Agregar un Registro"
  }

  AddRegistro(){
    if(this.formFinanzas.invalid){
      this.formFinanzas.markAllAsTouched()
      return 
    }
      const monto=this.formFinanzas.get('monto')?.value
      const descripcion=this.formFinanzas.get('descripcion')?.value
      const id_categoria=this.formFinanzas.get('id_categoria')?.value
      const image = this.selectedFile;

      this.finanzaService.RegTransaccion(monto,descripcion,id_categoria,image).subscribe({
        next: res=>{
          this.toast.success("Registro realizado exitosamente")
          this.GetFinanzas()
          this.closeModal()
        },
        error: err => this.toast.error("Erro al realizar un registro")
      })
    
    
  }

  editarModal(id: number, monto: number, descripcion: string, id_categoria: number, evidencia: string | null) {
    this.id_transaccion = id;
    this.modalOperation = "Edit";
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
    this.title = "Editar un Registro";
    
    this.selectedFile = null;
    
    this.formFinanzas.patchValue({
      monto: monto,
      descripcion: descripcion,
      id_categoria: id_categoria
    });
    
    if (evidencia) {
      this.selectedFileName = evidencia.split('/').pop() || 'Archivo existente';
      this.formFinanzas.patchValue({ image: 'existing_file' });
    } else {
      this.selectedFileName = null;
    }
  }

  editarRegistro(){
    if(this.formFinanzas.invalid){
      this.formFinanzas.markAllAsTouched()
      return 
    }
    const monto=this.formFinanzas.get('monto')?.value
    const descripcion=this.formFinanzas.get('descripcion')?.value
    const id_categoria=this.formFinanzas.get('id_categoria')?.value
    const image=this.selectedFile
    this.finanzaService.UpdTransaccion(this.id_transaccion,monto,id_categoria,descripcion,image).subscribe({
      next: res=>{
        this.toast.success("Registro realizado exitosamente")
        this.GetFinanzas()
        this.closeModal()
      },
      error: err => {this.toast.error("Error al editar un registro") 
        console.log(err)}
    })
  
  }

  delRegistro(id: number) {
    this.finanzaService.DelTransaccion(id).subscribe({
      next:res=>{
        this.toast.success("Registro Eliminado Correctamente")
        this.GetFinanzas();
      },
      error: err=>{this.toast.error("Error al eliminar un registro",err);
        this.GetFinanzas();
      }
    })
    
  }

  cambiarPagina(page: number) {
    this.currentPage = page;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        this.toast.error('El archivo no debe superar 5MB');
        input.value = '';
        return;
      }
      
      this.selectedFile = file;
      this.selectedFileName = file.name;
      
      // ← ESTO ES LO QUE FALTABA: actualizar el FormControl
      this.formFinanzas.patchValue({
        image: file
      });
      
      // Marcar el campo como touched para que se valide
      this.formFinanzas.get('image')?.markAsTouched();
      
    } else {
      this.selectedFile = null;
      this.selectedFileName = null;
      this.formFinanzas.patchValue({
        image: null
      });
    }
  }
}
