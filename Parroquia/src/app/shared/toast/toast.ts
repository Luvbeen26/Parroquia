import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';



@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class Toast {
  @Input() message = '';
  @Input() show = false;

  close() {
    this.show = false;
  }
}
