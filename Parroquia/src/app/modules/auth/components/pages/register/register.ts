import { Component, effect, signal } from '@angular/core';
import { AuthSideDecoration } from '../../auth-side-decoration/auth-side-decoration';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

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
  text_codebtn = signal<string>("Enviar Codigo");
  cooldown = signal<number>(0);
  code_disabled: boolean = false;

  show_pass: boolean = false;
  show_confirm_pass: boolean = false;
  
  register_form: FormGroup;
  correo: FormControl;
  contrasena: FormControl;
  confirm_pswd: FormControl;
  nombres: FormControl;
  apellidos: FormControl;
  codigo: FormControl;

  constructor(private authservice: Auth, private router: Router, private toast: ToastrService) {
    this.nombres = new FormControl("", Validators.required);
    this.apellidos = new FormControl("", Validators.required);
    
    this.correo = new FormControl("", [
      Validators.required,
      Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
    ]);

    this.contrasena = new FormControl("", [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(25),
      Validators.pattern('(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,25}')
    ]);

    this.confirm_pswd = new FormControl("", Validators.required);
    
    this.codigo = new FormControl("", [
      Validators.required,
      Validators.maxLength(6)
    ]);

    this.register_form = new FormGroup({
      nombres: this.nombres,
      apellidos: this.apellidos,
      correo: this.correo,
      contrasena: this.contrasena,
      confirm_pswd: this.confirm_pswd,
      codigo: this.codigo
    }, { validators: this.passwordMatch });

    const codigoCtrl = this.register_form.get('codigo')!;
    codigoCtrl.disable();

    this.register_form.get('correo')!.valueChanges.subscribe(() => {
      const correoCtrl = this.register_form.get('correo')!;
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
  
  passwordMatch(control: AbstractControl): ValidationErrors | null {
    const grupo = control as FormGroup;
    const password = grupo.get('contrasena')?.value;
    const confirm_password = grupo.get('confirm_pswd')?.value;

    return password == confirm_password ? null : { notmatch: true };
  }

  Send_code() {
    const correo = this.register_form.get("correo")?.value;
    this.code_disabled = true;
    this.cooldown.set(30);
    
    this.authservice.send_code(correo).subscribe({
      next: (res) => {
        this.toast.success("Codigo Enviado Exitosamente");
        this.start_cooldown();
      },
      error: (err) => {
        this.code_disabled = false;
        this.cooldown.set(0);
        this.toast.error(err.error.detail, "Error");
      }
    });
  }

  start_cooldown() {
    const intervalo = setInterval(() => {
      const current = this.cooldown();
      if (current <= 0) {
        clearInterval(intervalo);
        return;
      }
      this.cooldown.set(current - 1);
    }, 1000);
  }

  Submit() {
    if (this.register_form.valid) {
      const { nombres, apellidos, correo, contrasena, confirm_pswd, codigo } = this.register_form.value;

      this.authservice.register(nombres, apellidos, correo, contrasena, confirm_pswd, codigo.toString()).subscribe({
        next: (res) => {
          this.router.navigate(["/"]);
          this.toast.success("Cuenta Registrada", "Bienvenido");
        },
        error: (err) => {
          this.toast.error(err.error.detail, "Error");
        }
      });
    } else {
      this.register_form.markAllAsTouched();
    }
  }

  Visibility_Password(campo: "contra" | "confirm") {
    if (campo == "contra") {
      this.show_pass = !this.show_pass;
    } else {
      this.show_confirm_pass = !this.show_confirm_pass;
    }
  }
}