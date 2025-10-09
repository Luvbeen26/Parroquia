import { Component } from '@angular/core';
import { AuthSideDecoration } from '../../shared/auth-side-decoration/auth-side-decoration';

@Component({
  selector: 'app-login',
  imports: [AuthSideDecoration],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

}
