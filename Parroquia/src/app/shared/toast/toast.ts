import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';



@Component({
  selector: 'app-toast',
  imports: [CommonModule,NgClass],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class Toast {
  @Input() message: string = '';
  @Input() type: 'success' | 'danger' | 'warning' | 'info' = 'success';
  @Output() closed = new EventEmitter<void>();
  
  show: boolean = false;

  ngOnInit() {
    setTimeout(() => {
      this.show = true;
    }, 10);
  }

  close() {
    this.show = false;
    setTimeout(() => {
      this.closed.emit();
    }, 400);
  }
}
