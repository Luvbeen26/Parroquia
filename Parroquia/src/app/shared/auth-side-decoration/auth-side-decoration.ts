import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-side-decoration',
  imports: [NgClass],
  templateUrl: './auth-side-decoration.html',
  styleUrl: './auth-side-decoration.css'
})
export class AuthSideDecoration {
  @Input() size: 'small' | 'big' = 'small';

}
