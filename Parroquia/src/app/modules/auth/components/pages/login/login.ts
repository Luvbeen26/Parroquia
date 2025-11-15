import { Component } from '@angular/core';
import { AuthSideDecoration } from '../../auth-side-decoration/auth-side-decoration';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../../../../services/auth';


@Component({
  selector: 'app-login',
  standalone:true,  
  imports: [AuthSideDecoration, RouterLink,ReactiveFormsModule,HttpClientModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  show_password:boolean=false;
  login_form:FormGroup;
  correo:FormControl;
  contrasena:FormControl;

  constructor(private authservice:Auth,private router:Router, private toast:ToastrService){
    this.correo=new FormControl("",Validators.required);
    
    this.contrasena=new FormControl("",Validators.required);

    this.login_form=new FormGroup({
      correo:this.correo,
      contrasena:this.contrasena
    });
  }

  Submit(){
    if(this.login_form.valid){
      const {correo,contrasena} = this.login_form.value; //extrae los valores haciendo desestructuracion
      this.authservice.login(correo,contrasena).subscribe({ 
        next: (res) =>{

          this.toast.success("Inicio de Sesion Exitoso", "Bienvenido")
          
          if(!this.authservice.get_userRol())
            this.router.navigate(["/"]);
          else
            this.router.navigate(["admin"])
          
        },
        error: (err) =>{
          this.toast.error(err.error.detail,"Error")
        }
      });
    }else{
      this.login_form.markAllAsTouched();
    }

  }

  Visibility_Password(){
    this.show_password=!this.show_password;
  }
}
