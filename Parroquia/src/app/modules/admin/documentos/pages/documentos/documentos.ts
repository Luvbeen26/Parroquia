import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocumentoS } from '../../../../../services/documentos';
import { getDocs, ModalContent } from '../../../../../models/document';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ModalFile } from '../../../../../shared/modal-file/modal-file';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; 
import { Modalcomponent } from '../../../../../shared/modalcomponent/modalcomponent';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Code } from 'lucide-angular';


@Component({
  selector: 'app-documentos',
  imports: [MatIconModule,MatTooltipModule,CommonModule,ModalFile,Modalcomponent,ReactiveFormsModule],
  templateUrl: './documentos.html',
  styleUrl: './documentos.css'
})
export class Documentos {
  toast=inject(ToastrService)
  docService=inject(DocumentoS)
  private sanitizer = inject(DomSanitizer);
  estado="Pendiente"
  searchText = '';
  currentPage = 1;
  itemspage=10;
  totalPages = 1;
  pages: number[]=[];
  modalContent: ModalContent | null = null;
  isModalOpen: boolean = false;
  isModal2Open:boolean=false
  RechazarId: number | null =null;
  motivoRechazoControl = new FormControl('');
  

  private allDocsSubject = new BehaviorSubject<getDocs[]>([]);
  private docsSubject = new BehaviorSubject<getDocs[]>([]); 
  documentos$ = this.docsSubject.asObservable();

  ngOnInit(){
    this.GetDocs("Pendiente")
    console.log(this.docsSubject)
  }


  GetDocs(status:string){
    this.docService.getDocsByStatus(status).subscribe(res =>{
      const doc=res.map(d =>({
        id_documento:d.id_documento,
        evento:d.evento,
        tipo:d.tipo,
        participante:d.participante,
        motivo:d.motivo,
        documento:d.documento
      }))
      this.allDocsSubject.next(doc);
      this.calcuPaginacion(doc);
      this.updatePageData();
    })
    this.estado=status
  }

  calcuPaginacion(docs: getDocs[]) {
    const totalItems = docs.length;
    this.totalPages = Math.ceil(totalItems / this.itemspage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  updatePageData() {
    const allDocs = this.allDocsSubject.value;
    const startIndex = (this.currentPage - 1) * this.itemspage;
    const endIndex = startIndex + this.itemspage;
    const paginatedDocs = allDocs.slice(startIndex, endIndex);
    
    this.docsSubject.next(paginatedDocs);
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

  revisarDocumento(doc:string) {
    console.log(doc)

    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(doc);
    this.modalContent = {
      type:'pdf',
      src:safeUrl as any,
      title:"Documento"
    }
    this.isModalOpen=true;
    document.body.style.overflow = 'hidden';
    
  }

  AbrirRechazar(id:number){
    this.RechazarId=id
    this.isModal2Open=true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalContent = null;
    this.isModal2Open=false;
    this.RechazarId=null;
    document.body.style.overflow = 'auto';
    this.motivoRechazoControl.reset();
  }

  aceptarDocumento(id:number) {
    this.docService.accepttDoc(id).subscribe({
      next: res=> {
        this.toast.success("Documento Aceptado")
        this.GetDocs(this.estado)
        
      },
      error: err=> this.toast.error("Error al aceptar el documento")
    })
  }

  rechazarDocumento() {
    const motivo = this.motivoRechazoControl.value?.trim() || '';

    this.docService.rejectDoc(this.RechazarId!,motivo).subscribe({
      next: res=> {
        this.toast.success("Documento Rechazado")
        this.closeModal();
        this.GetDocs(this.estado)
        
      },
      error: err=> this.toast.error("Error al rechazar el documento")
    })
  }


}
