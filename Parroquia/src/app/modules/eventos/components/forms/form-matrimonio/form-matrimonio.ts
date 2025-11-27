import { Component, inject } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Eventos } from '../../../../../services/eventos';
import { Celebrate } from '../../../../../models/event';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-matrimonio',
  imports: [HeaderForm,ReactiveFormsModule],
  templateUrl: './form-matrimonio.html',
  styleUrl: './form-matrimonio.css'
})
export class FormMatrimonio {
  eventService = inject(Eventos)
  private dataLoadedSubscription?: Subscription;

  form!: FormGroup;

  constructor(private frm: FormBuilder) {
    this.form = frm.group({
      nombres_novio: ['', Validators.required],
      ap_pat_novio: ['', Validators.required],
      ap_mat_novio: [''],
      fecha_nac_novio: ['', Validators.required],
      edad_novio: [''],
      nombres_novia: ['', Validators.required],
      ap_pat_novia: ['', Validators.required],
      ap_mat_novia: [''],
      fecha_nac_novia: ['', Validators.required],
      edad_novia: [''],
    });

    this.form.get('fecha_nac_novio')?.valueChanges.subscribe(fecha => {
      if (fecha) {
        const edad = this.calcularEdad(fecha);
        this.form.get('edad_novio')?.setValue(edad, { emitEvent: false });
      }
    });

    this.form.get('fecha_nac_novia')?.valueChanges.subscribe(fecha => {
      if (fecha) {
        const edad = this.calcularEdad(fecha);
        this.form.get('edad_novia')?.setValue(edad, { emitEvent: false });
      }
    });
  }

  ngOnInit(){
    this.dataLoadedSubscription = this.eventService.eventDataLoadedObservable.subscribe(
      (loaded) => {
        if (loaded) {
          this.loadFormData();
        }
      }
    );
    
    // También intentar cargar inmediatamente por si ya están disponibles
    if (this.eventService.isInEditMode()) {
      this.loadFormData();
    }


    
  }

  loadFormData(){
    const novio = this.eventService.getCelebrado_form(0);
    
    const novia = this.eventService.getCelebrado_form(1);
    if (novio) {
      this.form.patchValue({
        nombres_novio: novio.nombres,
        ap_pat_novio: novio.apellido_pat,
        ap_mat_novio: novio.apellido_mat,
        fecha_nac_novio: novio.fecha_nac,
        edad_novio: novio.edad
      });
    }

    if (novia) {
      this.form.patchValue({
        nombres_novia: novia.nombres,
        ap_pat_novia: novia.apellido_pat,
        ap_mat_novia: novia.apellido_mat,
        fecha_nac_novia: novia.fecha_nac,
        edad_novia: novia.edad
      });
    }
  }

  getFormErrors() {
    const errors: any = {};
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  private calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  saveData() {
    if (this.form.valid) {
      this.eventService.saveTipoEvento(4)
      

      const novio={
        nombres:this.form.value.nombres_novio,
        apellido_pat:this.form.value.ap_pat_novio,
        apellido_mat:this.form.value.ap_mat_novio,
        fecha_nac:this.form.value.fecha_nac_novio,
        genero: "M",
        edad:this.form.value.edad_novio
      }

      const novia={
        nombres:this.form.value.nombres_novia,
        apellido_pat:this.form.value.ap_pat_novia,
        apellido_mat:this.form.value.ap_mat_novia,
        fecha_nac:this.form.value.fecha_nac_novia,
        genero: "F",
        edad:this.form.value.edad_novia
      }

      this.eventService.saveCelebradoform(novio, 0)
      this.eventService.saveCelebradoform(novia, 1)
    }
  }

  ngOnDestroy() {
    this.dataLoadedSubscription?.unsubscribe();
  }
}
