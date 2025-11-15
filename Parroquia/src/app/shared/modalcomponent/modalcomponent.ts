import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modalcomponent',
  imports: [CommonModule],
  templateUrl: './modalcomponent.html',
  styleUrl: './modalcomponent.css'
})
export class Modalcomponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Modal';
  @Input() showFooter: boolean = true;
  @Input() showConfirmButton: boolean = false;
  @Input() confirmText: string = 'Confirmar';
  
  
  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirmClick = new EventEmitter<void>();

  closeModal() {
    this.onClose.emit();
  }

  onConfirm() {
    this.onConfirmClick.emit();
  }
}
