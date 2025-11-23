import { Component, input, output } from '@angular/core';
import { Imagen } from '../../models/publication';
import { ModalFile } from '../modal-file/modal-file';
import { ModalContent } from '../../models/document';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-publications',
  imports: [ModalFile,MatIconModule],
  templateUrl: './publications.html',
  styleUrl: './publications.css'
})
export class Publications {
  id_publicacion=input<number>()
  titulo = input<string>();
  date = input<string>();
  image = input<Imagen[]>([]);
  contenido = input<string>();
  adminOption=input<boolean>(false);
  eliminar=output<number>();

  isModalOpen: boolean = false;
  modalContent: ModalContent | null = null;

  isMenuOpen: boolean = false;

  openImage(index: number) {
    const images = this.image();
    if (images && images[index]) {
      this.modalContent = {
        type: 'image',
        src: images[index].ruta,
        alt: this.titulo() || 'Imagen de publicación',
        title: this.titulo()
      };
      this.isModalOpen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalContent = null;
    document.body.style.overflow = 'auto';
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  delete(){
    this.eliminar.emit(this.id_publicacion()!)
  }
}
