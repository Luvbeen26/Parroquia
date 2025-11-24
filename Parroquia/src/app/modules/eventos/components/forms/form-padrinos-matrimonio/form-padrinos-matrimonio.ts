import { Component, inject } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { Eventos } from '../../../../../services/eventos';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-padrinos-matrimonio',
  imports: [HeaderForm, ReactiveFormsModule],
  templateUrl: './form-padrinos-matrimonio.html',
  styleUrl: './form-padrinos-matrimonio.css'
})
export class FormPadrinosMatrimonio {
  eventService = inject(Eventos)
  form!: FormGroup;
  showAdditional: boolean = false;

  constructor(private frm: FormBuilder) {
    this.form = frm.group({
      // Padrino 1 - Obligatorio
      nombres_padrino1: ['', Validators.required],
      ap_pat_padrino1: ['', Validators.required],
      ap_mat_padrino1: [''],
      
      // Madrina 1 - Obligatoria
      nombres_madrina1: ['', Validators.required],
      ap_pat_madrina1: ['', Validators.required],
      ap_mat_madrina1: [''],
      
      // Padrino 2 - Opcional
      nombres_padrino2: [''],
      ap_pat_padrino2: [''],
      ap_mat_padrino2: [''],
      
      // Madrina 2 - Opcional
      nombres_madrina2: [''],
      ap_pat_madrina2: [''],
      ap_mat_madrina2: [''],
    });

    // Escuchar cambios en los campos adicionales para agregar validaciones condicionales
    this.setupConditionalValidation();
  }


  ngOnInit(){
    const padrinos = this.eventService.getParents_form('Padrinos');


    if (padrinos[0]) {
      this.form.patchValue({
        nombres_padrino1: padrinos[0].nombres,
        ap_pat_padrino1: padrinos[0].apellido_pat,
        ap_mat_padrino1: padrinos[0].apellido_mat,
      });
    }

    // Rellenar madrina 1 (obligatoria)
    if (padrinos[1]) {
      this.form.patchValue({
        nombres_madrina1: padrinos[1].nombres,
        ap_pat_madrina1: padrinos[1].apellido_pat,
        ap_mat_madrina1: padrinos[1].apellido_mat,
      });
    }

    // Si hay padrinos adicionales, mostrar la sección y rellenarlos
    if (padrinos[2] || padrinos[3]) {
      this.showAdditional = true;
    }

    // Rellenar padrino 2 (opcional)
    if (padrinos[2]) {
      this.form.patchValue({
        nombres_padrino2: padrinos[2].nombres,
        ap_pat_padrino2: padrinos[2].apellido_pat,
        ap_mat_padrino2: padrinos[2].apellido_mat,
      });
    }

    // Rellenar madrina 2 (opcional)
    if (padrinos[3]) {
      this.form.patchValue({
        nombres_madrina2: padrinos[3].nombres,
        ap_pat_madrina2: padrinos[3].apellido_pat,
        ap_mat_madrina2: padrinos[3].apellido_mat,
      });
    }


  }

  setupConditionalValidation() {
    this.form.get('nombres_padrino2')?.valueChanges.subscribe(() => {
      this.updatePadrino2Validation();
    });
    
    this.form.get('ap_pat_padrino2')?.valueChanges.subscribe(() => {
      this.updatePadrino2Validation();
    });

    this.form.get('nombres_madrina2')?.valueChanges.subscribe(() => {
      this.updateMadrina2Validation();
    });
    
    this.form.get('ap_pat_madrina2')?.valueChanges.subscribe(() => {
      this.updateMadrina2Validation();
    });
  }

  updatePadrino2Validation() {
    const nombres = this.form.get('nombres_padrino2');
    const apPat = this.form.get('ap_pat_padrino2');


    if (nombres?.value || apPat?.value) {
      nombres?.setValidators([Validators.required]);
      apPat?.setValidators([Validators.required]);
    } else {
      nombres?.clearValidators();
      apPat?.clearValidators();
    }

    nombres?.updateValueAndValidity({ emitEvent: false });
    apPat?.updateValueAndValidity({ emitEvent: false });
  }

  updateMadrina2Validation() {
    const nombres = this.form.get('nombres_madrina2');
    const apPat = this.form.get('ap_pat_madrina2');

    // Si alguno de los campos tiene valor, ambos son obligatorios
    if (nombres?.value || apPat?.value) {
      nombres?.setValidators([Validators.required]);
      apPat?.setValidators([Validators.required]);
    } else {
      nombres?.clearValidators();
      apPat?.clearValidators();
    }

    nombres?.updateValueAndValidity({ emitEvent: false });
    apPat?.updateValueAndValidity({ emitEvent: false });
  }

  toggleAdditional() {
    this.showAdditional = !this.showAdditional;
    
    // Si se oculta, limpiar los campos opcionales y quitar validaciones
    if (!this.showAdditional) {
      const padrinos = this.eventService.getParents_form('Padrinos');
      padrinos.splice(2, 2);

      this.form.patchValue({
        nombres_padrino2: '',
        ap_pat_padrino2: '',
        ap_mat_padrino2: '',
        nombres_madrina2: '',
        ap_pat_madrina2: '',
        ap_mat_madrina2: '',
      });

      // Limpiar validaciones
      this.form.get('nombres_padrino2')?.clearValidators();
      this.form.get('ap_pat_padrino2')?.clearValidators();
      this.form.get('nombres_madrina2')?.clearValidators();
      this.form.get('ap_pat_madrina2')?.clearValidators();

      // Actualizar validez
      this.form.get('nombres_padrino2')?.updateValueAndValidity();
      this.form.get('ap_pat_padrino2')?.updateValueAndValidity();
      this.form.get('nombres_madrina2')?.updateValueAndValidity();
      this.form.get('ap_pat_madrina2')?.updateValueAndValidity();
    }
  }

  saveParents() {
    const formValue = this.form.value;
    
    // Padrino 1 - Siempre se guarda (obligatorio)
    this.eventService.saveParentsForm(
      {
        nombres: formValue.nombres_padrino1,
        apellido_pat: formValue.ap_pat_padrino1,
        apellido_mat: formValue.ap_mat_padrino1,
        id_rol: 4
      }, 'Padrinos', 0);

    // Madrina 1 - Siempre se guarda (obligatoria)
    this.eventService.saveParentsForm(
      {
        nombres: formValue.nombres_madrina1,
        apellido_pat: formValue.ap_pat_madrina1,
        apellido_mat: formValue.ap_mat_madrina1,
        id_rol: 5
      }, 'Padrinos', 1);
    
    // Padrino 2 - Solo se guarda si tiene datos completos
    if (formValue.nombres_padrino2 && formValue.ap_pat_padrino2) {
      this.eventService.saveParentsForm(
        {
          nombres: formValue.nombres_padrino2,
          apellido_pat: formValue.ap_pat_padrino2,
          apellido_mat: formValue.ap_mat_padrino2,
          id_rol: 4
        }, 'Padrinos', 2);
    }

    // Madrina 2 - Solo se guarda si tiene datos completos
    if (formValue.nombres_madrina2 && formValue.ap_pat_madrina2) {
      this.eventService.saveParentsForm(
        {
          nombres: formValue.nombres_madrina2,
          apellido_pat: formValue.ap_pat_madrina2,
          apellido_mat: formValue.ap_mat_madrina2,
          id_rol: 5
        }, 'Padrinos', 3);
    }
  }
}