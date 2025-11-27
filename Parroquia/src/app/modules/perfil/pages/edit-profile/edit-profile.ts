import { Component, inject, Input } from '@angular/core';
import { Profile } from '../../../../services/profile';
import { Userbase } from '../../../../models/user';
import { ToastrService } from 'ngx-toastr';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css'
})
export class EditProfile {
  profileService = inject(Profile);
  toast = inject(ToastrService);
  router = inject(Router);
  
  private _user_data: Userbase | null = null;
  
  @Input() 
  set user_data(value: Userbase | null) {
    
    this._user_data = value;
    
    if (value) {
      this.personal_form.patchValue({
        nombre: value.nombres,
        apellidos: value.apellidos
      });
    
    }
  }
  
  get user_data(): Userbase | null {
    return this._user_data;
  }

  personal_form: FormGroup;
  nombre: FormControl;
  apellidos: FormControl;

  password_form: FormGroup;
  contrasena_actual: FormControl;
  contrasena_nueva: FormControl;
  confirmar_contrasena: FormControl;

  constructor() {
    this.nombre = new FormControl('', [Validators.required]);
    this.apellidos = new FormControl('', [Validators.required]);

    this.personal_form = new FormGroup({
      nombre: this.nombre,
      apellidos: this.apellidos,
    });

    this.contrasena_actual = new FormControl('', [Validators.required]);
    
    this.contrasena_nueva = new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(25),
      Validators.pattern('(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,25}')
    ]);
    
    this.confirmar_contrasena = new FormControl('', [Validators.required]);

    this.password_form = new FormGroup({
      contrasena_actual: this.contrasena_actual,
      contrasena_nueva: this.contrasena_nueva,
      confirmar_contrasena: this.confirmar_contrasena
    }, { validators: this.passwordMatch });
  }

  passwordMatch(control: AbstractControl): ValidationErrors | null {
    const grupo = control as FormGroup;
    const nueva = grupo.get('contrasena_nueva')?.value;
    const confirmar = grupo.get('confirmar_contrasena')?.value;

    return nueva === confirmar ? null : { notmatch: true };
  }

  ChangePersonalInfo() {
    if (!this._user_data) {
      this.toast.warning("Datos de usuario no disponibles");
      return;
    }

    const ap = this.personal_form.get("apellidos")?.value?.trim();
    const nombre = this.personal_form.get("nombre")?.value?.trim();

    if (this._user_data.apellidos.trim() === ap && 
        this._user_data.nombres.trim() === nombre) {
      this.toast.info("Sus datos siguen manteniéndose iguales");
      return;
    }
    
    if (this.personal_form.invalid) {
      this.personal_form.markAllAsTouched();
      this.toast.warning("Complete correctamente todos los campos");
      return;
    }

    this.profileService.ChangePersonalInfo(nombre, ap).subscribe({
      next: res => {
        this.toast.success("Datos Cambiados Correctamente");
        window.location.reload();
      },
      error: err => {
        this.toast.error(err.error.detail, "Error");
      }
    });
  }

  ChangePassword(){
    if(this.password_form.invalid){
      this.password_form.markAllAsTouched();
      return;
    }
    const old=this.password_form.get("contrasena_actual")?.value;
    const nueva=this.password_form.get("contrasena_nueva")?.value;

    this.profileService.ChangePassword(old,nueva).subscribe({
      next: res=>{
        this.toast.success("La contraseña a sido cambiada")
        window.location.reload()
      },
      error: err=>{
        this.toast.error(err.error.detail,"Error")
      }
    })
  }
}