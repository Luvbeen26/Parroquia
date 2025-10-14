import { Component } from '@angular/core';
import { AuthSideDecoration } from '../../auth-side-decoration/auth-side-decoration';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { HttpClientModule } from '@angular/common/http';



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

  constructor(private authservice:Auth,private router:Router){
    this.correo=new FormControl("",[
      Validators.required,
      Validators.email
    ]);
    this.contrasena=new FormControl("",[
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(21),
      Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&/#\-])[A-Za-z\\d@$!%*?&/#\\-]{8,}$')
    ]);

    this.login_form=new FormGroup({
      correo:this.correo,
      contrasena:this.contrasena
    });
  }

  Submit(){
    if(this.login_form.valid){
      const {correo,contrasena} = this.login_form.value; //extrae los valores haciendo desestructuracion
      //subscribe permite escuchar la respuesta de la peticion
      this.authservice.login(correo,contrasena).subscribe({ 
        next: (res) =>{
          this.router.navigate(["/"],{queryParams : {user_id:res.id}});
        },
        error: (err) =>{
          console.log("Error al iniciar sesion");
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
