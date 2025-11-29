import { Component, inject } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { Eventos } from '../../../../../services/eventos';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-padres-matrimonio',
  imports: [HeaderForm,ReactiveFormsModule],
  templateUrl: './form-padres-matrimonio.html',
  styleUrl: './form-padres-matrimonio.css'
})
export class FormPadresMatrimonio {
  eventService = inject(Eventos)
  form!: FormGroup;

  constructor(private frm: FormBuilder) {
    this.form = frm.group({
      nombres_padre_novio: ['', Validators.required],
      ap_pat_padre_novio: ['', Validators.required],
      ap_mat_padre_novio: [''],
      nombres_madre_novio: ['', Validators.required],
      ap_pat_madre_novio: ['', Validators.required],
      ap_mat_madre_novio: [''],
      nombres_padre_novia: ['', Validators.required],
      ap_pat_padre_novia: ['', Validators.required],
      ap_mat_padre_novia: [''],
      nombres_madre_novia: ['', Validators.required],
      ap_pat_madre_novia: ['', Validators.required],
      ap_mat_madre_novia: [''],
    })
  }

  ngOnInit(){
    const parents = this.eventService.getParents_form('Parents');
    
    if (parents[0]) {
      this.form.patchValue({
        nombres_padre_novio: parents[0].nombres,
        ap_pat_padre_novio: parents[0].apellido_pat,
        ap_mat_padre_novio: parents[0].apellido_mat,
      });
    }

    if (parents[1]) {
      this.form.patchValue({
        nombres_madre_novio: parents[1].nombres,
        ap_pat_madre_novio: parents[1].apellido_pat,
        ap_mat_madre_novio: parents[1].apellido_mat,
      });
    }

    if (parents[2]) {
      this.form.patchValue({
        nombres_padre_novia: parents[2].nombres,
        ap_pat_padre_novia: parents[2].apellido_pat,
        ap_mat_padre_novia: parents[2].apellido_mat,
      });
    }

    if (parents[3]) {
      this.form.patchValue({
        nombres_madre_novia: parents[3].nombres,
        ap_pat_madre_novia: parents[3].apellido_pat,
        ap_mat_madre_novia: parents[3].apellido_mat,
      });
    }
  }

  saveParents() {
    const formValue = this.form.value;
    //PADRES DEL NOVIO
    this.eventService.saveParentsForm(
      {
        nombres: formValue.nombres_padre_novio,
        apellido_pat: formValue.ap_pat_padre_novio,
        apellido_mat: formValue.ap_mat_padre_novio,
        id_rol: 2
      }, 'Parents', 0);

    this.eventService.saveParentsForm(
      {
        nombres: formValue.nombres_madre_novio,
        apellido_pat: formValue.ap_pat_madre_novio,
        apellido_mat: formValue.ap_mat_madre_novio,
        id_rol: 3
      }, 'Parents', 1);
    
    this.eventService.saveParentsForm(
      {
        nombres: formValue.nombres_padre_novia,
        apellido_pat: formValue.ap_pat_padre_novia,
        apellido_mat: formValue.ap_mat_padre_novia,
        id_rol: 2
      }, 'Parents', 2);

    this.eventService.saveParentsForm(
      {
        nombres: formValue.nombres_madre_novia,
        apellido_pat: formValue.ap_pat_madre_novia,
        apellido_mat: formValue.ap_mat_madre_novia,
        id_rol: 3
      }, 'Parents', 3);
  }

  onlyLetters(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/[^a-zA-ZÀ-ÿ\u00f1\u00d1\s]/g, '');
    
    if (input.value !== sanitized) {
      input.value = sanitized;

      const controlName = input.getAttribute('formControlName');
      if (controlName) {
        this.form.get(controlName)?.setValue(sanitized, { emitEvent: false });
      }
    }
  }
}
