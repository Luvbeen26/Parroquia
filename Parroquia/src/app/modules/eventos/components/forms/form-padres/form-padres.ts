import { Component, inject } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Eventos } from '../../../../../services/eventos';

@Component({
  selector: 'app-form-padres',
  imports: [HeaderForm, ReactiveFormsModule],
  templateUrl: './form-padres.html',
  styleUrl: './form-padres.css'
})
export class FormPadres {
  eventService = inject(Eventos)
  form: FormGroup;

  constructor(private builder: FormBuilder) {
    this.form = this.builder.group({
      nombres_f: ['', Validators.required],
      ap_pat_f: ['', Validators.required],
      ap_mat_f: ['', Validators.required],
      nombres_m: ['', Validators.required],
      ap_pat_m: ['', Validators.required],
      ap_mat_m: ['', Validators.required],
      nombres_p: ['', Validators.required],
      ap_pat_p: ['', Validators.required],
      ap_mat_p: ['', Validators.required]
    });
  }

  ngOnInit() {
    const savedataParents = this.eventService.getParents_form('Parents')
    const savedataPadrino = this.eventService.getParents_form('Padrinos')

    if (savedataPadrino && savedataPadrino.length > 0) {
      const padrino = savedataPadrino[0];
      this.form.patchValue({
        nombres_p: padrino.nombres || '',
        ap_pat_p: padrino.apellido_pat || '',
        ap_mat_p: padrino.apellido_mat || ''
      });
    }

    if (savedataParents && savedataParents.length >= 2) {
      const padre = savedataParents[0];
      const madre = savedataParents[1];
      this.form.patchValue({
        nombres_f: padre.nombres || '',
        ap_pat_f: padre.apellido_pat || '',
        ap_mat_f: padre.apellido_mat || '',
        nombres_m: madre.nombres || '',
        ap_pat_m: madre.apellido_pat || '',
        ap_mat_m: madre.apellido_mat || '',
      });
    }
  }

  // Método público que el padre puede llamar
  saveParents() {
    const formValue = this.form.value;

    this.eventService.saveParentsForm(
      {
        nombres: formValue.nombres_f,
        apellido_pat: formValue.ap_pat_f,
        apellido_mat: formValue.ap_mat_f,
        id_rol: 2
      }, 'Parents', 0);

    this.eventService.saveParentsForm(
      {
        nombres: formValue.nombres_m,
        apellido_pat: formValue.ap_pat_m,
        apellido_mat: formValue.ap_mat_m,
        id_rol: 3
      }, 'Parents', 1);

    this.eventService.saveParentsForm(
      {
        nombres: formValue.nombres_p,
        apellido_pat: formValue.ap_pat_p,
        apellido_mat: formValue.ap_mat_p,
        id_rol: 4
      }, 'Padrinos', 0);
  }
}