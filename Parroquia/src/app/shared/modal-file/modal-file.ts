import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalContent } from '../../models/document';
import { MatIcon, MatIconModule,  } from '@angular/material/icon';

@Component({
  selector: 'app-modal-file',
  imports: [MatIcon],
  templateUrl: './modal-file.html',
  styleUrl: './modal-file.css'
})
export class ModalFile {
  @Input() content: ModalContent | null = null;
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.isOpen) return;
    if (event.key === 'Escape') this.close();
  }
}
