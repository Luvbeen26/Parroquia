import { Component, effect, inject, signal } from '@angular/core';
import { AuthSideDecoration } from '../../auth-side-decoration/auth-side-decoration';
import { Form, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router } from '@angular/router';


import { Auth } from '../../../../../services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-restore-password',
  imports: [AuthSideDecoration,ReactiveFormsModule],
  templateUrl:'./restore-password.html',
  styleUrl: './restore-password.css'
})
export class RestorePassword {
  text_codebtn = signal<string>("Enviar Codigo");
  cooldown = signal<number>(0);
  show_pass:boolean=false;
  restore_form:FormGroup;
  correo:FormControl;
  contrasena:FormControl;
  code:FormControl;

  code_disabled: boolean = false;

  constructor(private authservice:Auth,private router:Router,private toast:ToastrService){
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
    
    this.code = new FormControl("",[Validators.required,Validators.maxLength(6)]);

    this.restore_form=new FormGroup({
      correo:this.correo,
      contrasena:this.contrasena,
      code:this.code
    });

    const codigoCtrl = this.restore_form.get('code')!;
    codigoCtrl.disable();

    this.restore_form.get('correo')!.valueChanges.subscribe(() => {
        const correoCtrl = this.restore_form.get('correo')!;
        correoCtrl.valid ? codigoCtrl.enable() : codigoCtrl.disable();
      }); 
      

    effect(() => {
      const currentCooldown = this.cooldown();
      if (currentCooldown > 0) {
        this.text_codebtn.set(`Reenviar en ${currentCooldown} seg`);
      } else if (currentCooldown === 0 && this.code_disabled) {
        this.text_codebtn.set("Reenviar Codigo");
        this.code_disabled = false;
      }
    });

  }

  
  Send_code(){
    const correo=this.restore_form.get("correo")?.value;
    this.code_disabled = true;  
    this.cooldown.set(30);
    this.authservice.send_code(correo).subscribe({
      next: (res) =>{
        this.toast.success("Codigo Enviado Exitosamente")
        this.start_cooldown(); 

      },
      error: (err) =>{
        this.code_disabled = false;
        this.cooldown.set(0);
        this.toast.error(err.error.detail,"Error")        
      }
    });
  }

  start_cooldown(){
    const intervalo=setInterval(() => {
      const current = this.cooldown();
      if(current <= 0){
        clearInterval(intervalo);
        return;
      }
      this.cooldown.set(current - 1);
    }, 1000);
  }

  Change_password(){
    const email=this.restore_form.get("correo")?.value
    const password=this.restore_form.get("contrasena")?.value
    const code=this.restore_form.get("code")?.value

    const body={correo:email,contra:password, code:code}

    this.authservice.restore_password(email,password,code).subscribe({
      next: res =>{
        this.toast.success("Contaseña Cambiada");
        this.router.navigate(["/auth/login"])
      },
      error: err=>{        
          this.toast.error(err.error.detail,"Error")}
  })

  }


  Visibility_Password(){
    this.show_pass=!this.show_pass;
  }
}
