import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-finanzas',
  imports: [CommonModule,MatIconModule,MatTooltipModule],
  templateUrl: './finanzas.html',
  styleUrl: './finanzas.css'
})
export class Finanzas {
  
}
