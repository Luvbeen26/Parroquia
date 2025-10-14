import { Component } from '@angular/core';
import { AuthSideDecoration } from '../../auth-side-decoration/auth-side-decoration';
import { Form, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-restore-password',
  imports: [AuthSideDecoration,ReactiveFormsModule],
  templateUrl: './restore-password.html',
  styleUrl: './restore-password.css'
})
export class RestorePassword {
  show_pass:boolean=false;

  restore_form:FormGroup;

  correo:FormControl;
  contrasena:FormControl;
  code:FormControl;

  constructor(private authservice:Auth,private router:Router){
    this.correo=new FormControl("",[
      Validators.required,Validators.email
    ]);

    this.contrasena=new FormControl("",[
      Validators.required,Validators.minLength(8),Validators.maxLength(21),
      Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&/#\-])[A-Za-z\\d@$!%*?&/#\\-]{8,}$')
    ]);
    
    this.code = new FormControl("",[Validators.required,Validators.min(100000),Validators.max(999999)]);

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
      this.restore_form.statusChanges.subscribe(status => {
        console.log("Estado del formulario:", status);
    });
  }

  Send_code(){
    const correo=this.restore_form.get("correo")?.value;
    this.authservice.send_code(correo).subscribe({
      next: (res) =>{
        console.log(res);
      },
      error: (err) =>{
        console.log(err);
      }
    });
    console.log(correo);
  }


  Submit(){

  }


  Visibility_Password(){
    this.show_pass=!this.show_pass;
  }
}
