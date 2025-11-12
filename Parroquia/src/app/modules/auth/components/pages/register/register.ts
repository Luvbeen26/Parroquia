import { Component } from '@angular/core';
import { AuthSideDecoration } from '../../auth-side-decoration/auth-side-decoration';
import { Router } from '@angular/router';
import { ReactiveFormsModule,FormGroup,FormControl,Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { error } from 'console';
import { Auth } from '../../../../../services/auth';
import { ToastrService } from 'ngx-toastr';




@Component({
  selector: 'app-register',
  standalone: true,
  imports: [AuthSideDecoration, ReactiveFormsModule, HttpClientModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})

export class Register {
  sending_code:boolean=false
  text_codebtn:string="Enviar Codigo"

  show_pass:boolean=false;
  show_confirm_pass:boolean=false;
  
  register_form:FormGroup;
  correo:FormControl;
  contrasena:FormControl;
  confirm_pswd:FormControl;
  nombres:FormControl;
  apellidos:FormControl;
  codigo:FormControl;

  constructor(private authservice:Auth,private router:Router,private toast:ToastrService){
    this.nombres=new FormControl("",Validators.required);
    this.apellidos=new FormControl("",Validators.required);
    
    this.correo=new FormControl("",[
      Validators.required,
      Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
    ]);

    this.contrasena=new FormControl("",[
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(25),
      Validators.pattern('(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,25}')
    ]);

    this.confirm_pswd=new FormControl("",Validators.required);
    
    this.codigo=new FormControl("",
      [Validators.required,Validators.max(999999),Validators.min(100000)]);

    this.register_form=new FormGroup({
      nombres:this.nombres,
      apellidos:this.apellidos,
      correo:this.correo,
      contrasena:this.contrasena,
      confirm_pswd:this.confirm_pswd,
      codigo:this.codigo
    }, { validators: this.passwordMatch });

      const codigoCtrl = this.register_form.get('codigo')!;
      codigoCtrl.disable();

      this.register_form.get('correo')!.valueChanges.subscribe(() => {
        const correoCtrl = this.register_form.get('correo')!;
        correoCtrl.valid ? codigoCtrl.enable() : codigoCtrl.disable();
      }); 
   
  }
  
  passwordMatch(control:AbstractControl):ValidationErrors | null{
    const grupo = control as FormGroup;
    const password=grupo.get('contrasena')?.value;
    const confirm_password=grupo.get('confirm_pswd')?.value;

    return password == confirm_password ? null : { notmatch : true};

  }

 

  Send_code(){
    const correo=this.register_form.get("correo")?.value;
    this.sending_code=true;
    this.text_codebtn="Enviando codigo...";
    this.authservice.send_code(correo).subscribe({
      next: (res) =>{
        this.toast.success("Codigo Enviado")
      },
      error: (err) =>{
        this.toast.error(err.error.detail,"Error")        
      }
    });
    this.text_codebtn="Reenviar Codigo";
    
  }

  

  Submit(){
    if(this.register_form.valid){
      const {nombres,apellidos,correo,contrasena,confirm_pswd,codigo} = this.register_form.value;

      this.authservice.register(nombres,apellidos,correo,contrasena,confirm_pswd,codigo.toString()).subscribe({
          next: (res) =>{
            this.router.navigate(["/"]);
            this.toast.success("Cuenta Registrada", "Bienvenido")
          },
          error: (err) =>{
            this.toast.error(err.error.detail,"Error")        
          }
      });

    }else {
      this.register_form.markAllAsTouched();
    }
  }

  Visibility_Password(campo: "contra" | "confirm"){
    if(campo == "contra"){
      this.show_pass=!this.show_pass;
    }else{
      this.show_confirm_pass=!this.show_confirm_pass;
    }
    
  }
}
