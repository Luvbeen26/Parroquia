import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LucideAngularModule,FileText } from 'lucide-angular';

@Component({
  selector: 'app-stat-card',
  imports: [MatIconModule,LucideAngularModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css'
})
export class StatCard {
  readonly FileText = FileText;


  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() icon: string = '$';
}
