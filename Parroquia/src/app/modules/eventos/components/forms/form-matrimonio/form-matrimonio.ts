import { Component, inject } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Eventos } from '../../../../../services/eventos';
import { Subscription } from 'rxjs';
import { edadMinimaValidator } from '../../../../../core/validators/edad';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-form-matrimonio',
  imports: [HeaderForm, ReactiveFormsModule],
  templateUrl: './form-matrimonio.html',
  styleUrl: './form-matrimonio.css'
})
export class FormMatrimonio {
  eventService = inject(Eventos);
  toast = inject(ToastrService);
  private dataLoadedSubscription?: Subscription;
  edadMinima = 18;

  form!: FormGroup;

  constructor(private frm: FormBuilder) {
    this.form = frm.group({
      nombres_novio: ['', Validators.required],
      ap_pat_novio: ['', Validators.required],
      ap_mat_novio: [''],
      fecha_nac_novio: ['', [Validators.required, edadMinimaValidator(this.edadMinima)]],
      edad_novio: [''],
      nombres_novia: ['', Validators.required],
      ap_pat_novia: ['', Validators.required],
      ap_mat_novia: [''],
      fecha_nac_novia: ['', [Validators.required, edadMinimaValidator(this.edadMinima)]],
      edad_novia: [''],
    });

    this.form.get('fecha_nac_novio')?.valueChanges.subscribe(fecha => {
      if (fecha) {
        const seleccionada = new Date(fecha);
        const hoy = new Date();
        const fechaMaxima = hoy.toISOString().split('T')[0];
        hoy.setHours(0, 0, 0, 0);

        if (seleccionada > hoy) {
          this.form.get("fecha_nac_novio")?.setValue(fechaMaxima, { emitEvent: false });  
        }

        const edad = this.calcularEdad(fecha);
        this.form.get('edad_novio')?.setValue(edad, { emitEvent: false });
      }
    });

    this.form.get('fecha_nac_novia')?.valueChanges.subscribe(fecha => {
      if (fecha) {
        const seleccionada = new Date(fecha);
        const hoy = new Date();
        const fechaMaxima = hoy.toISOString().split('T')[0];
        hoy.setHours(0, 0, 0, 0);

        if (seleccionada > hoy) {
          this.form.get("fecha_nac_novia")?.setValue(fechaMaxima, { emitEvent: false });
          this.toast.info('La fecha de nacimiento no puede ser futura. Se ajustó a hoy.', 'Fecha ajustada');
        }

        const edad = this.calcularEdad(fecha);
        this.form.get('edad_novia')?.setValue(edad, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.dataLoadedSubscription = this.eventService.eventDataLoadedObservable.subscribe(
      (loaded) => {
        if (loaded) {
          this.loadFormData();
        }
      }
    );
    
    this.loadFormData();
  }

  loadFormData() {
    const novio = this.eventService.getCelebrado_form(0);
    const novia = this.eventService.getCelebrado_form(1);
    
    if (novio && novio.nombres) {
      this.form.patchValue({
        nombres_novio: novio.nombres,
        ap_pat_novio: novio.apellido_pat,
        ap_mat_novio: novio.apellido_mat,
        fecha_nac_novio: novio.fecha_nac,
        edad_novio: novio.edad
      });
    }

    if (novia && novia.nombres) {
      this.form.patchValue({
        nombres_novia: novia.nombres,
        ap_pat_novia: novia.apellido_pat,
        ap_mat_novia: novia.apellido_mat,
        fecha_nac_novia: novia.fecha_nac,
        edad_novia: novia.edad
      });
    }
  }

  private calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    edad = edad >= 0 ? edad : 0;
    edad = edad <= 122 ? edad : 100;
    return edad;
  }

  saveData() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      
      const fechaNacNovioControl = this.form.get('fecha_nac_novio');
      const fechaNacNoviaControl = this.form.get('fecha_nac_novia');
      
      if (fechaNacNovioControl?.hasError('edadMinima')) {
        const error = fechaNacNovioControl.getError('edadMinima');
        this.toast.warning(
          `La edad mínima del novio para contraer matrimonio es ${error.requiredAge} años. Edad actual: ${error.actualAge} años`,
          'Edad insuficiente'
        );
        return;
      }

      if (fechaNacNoviaControl?.hasError('edadMinima')) {
        const error = fechaNacNoviaControl.getError('edadMinima');
        this.toast.warning(
          `La edad mínima de la novia para contraer matrimonio es ${error.requiredAge} años. Edad actual: ${error.actualAge} años`,
          'Edad insuficiente'
        );
        return;
      }
      
      this.toast.warning('Complete correctamente todos los campos', 'Formulario incompleto');
      return;
    }

    if (this.form.valid) {
      this.eventService.saveTipoEvento(4);

      const novio = {
        nombres: this.form.value.nombres_novio,
        apellido_pat: this.form.value.ap_pat_novio,
        apellido_mat: this.form.value.ap_mat_novio,
        fecha_nac: this.form.value.fecha_nac_novio,
        genero: "M",
        edad: this.form.value.edad_novio,
        id_rol: 0
      };

      const novia = {
        nombres: this.form.value.nombres_novia,
        apellido_pat: this.form.value.ap_pat_novia,
        apellido_mat: this.form.value.ap_mat_novia,
        fecha_nac: this.form.value.fecha_nac_novia,
        genero: "F",
        edad: this.form.value.edad_novia,
        id_rol: 0
      };

      this.eventService.saveCelebradoform(novio, 0);
      this.eventService.saveCelebradoform(novia, 1);
    }
  }

  ngOnDestroy() {
    this.dataLoadedSubscription?.unsubscribe();
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