import { Component, input } from '@angular/core';
import { Imagen } from '../../models/publication';
import { ModalFile } from '../modal-file/modal-file';
import { ModalContent } from '../../models/document';

@Component({
  selector: 'app-publications',
  imports: [ModalFile],
  templateUrl: './publications.html',
  styleUrl: './publications.css'
})
export class Publications {
  titulo = input<string>();
  date = input<string>();
  image = input<Imagen[]>([]);
  contenido = input<string>();
  
  isModalOpen: boolean = false;
  modalContent: ModalContent | null = null;

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
}
