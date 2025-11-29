import { Component, inject } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Eventos } from '../../../../../services/eventos';
import { Subscription } from 'rxjs';
import { edadMinimaValidator } from '../../../../../core/validators/edad';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-form-bautizo',
  imports: [HeaderForm, ReactiveFormsModule],
  templateUrl: './form-bautizo.html',
  styleUrl: './form-bautizo.css'
})
export class FormBautizo {
  eventService = inject(Eventos);
  toast = inject(ToastrService);
  form!: FormGroup;
  private dataLoadedSubscription?: Subscription;

  constructor(private frm: FormBuilder) {}

  ngOnInit(): void {
    // Crear formulario con validador
    this.form = this.frm.group({
      nombres: ['', [Validators.required,Validators.maxLength(50)]],
      apellido_pat: ['',[ Validators.required,Validators.maxLength(50)]],
      apellido_mat: [''],
      genero: ['', Validators.required],
      fecha_nac: ['', [Validators.required, edadMinimaValidator(0)]], // ← AGREGADO
      edad: ['', Validators.required],
      tipo: ['', Validators.required]
    });

    this.form.get('fecha_nac')?.valueChanges.subscribe(fecha => {
      if (fecha) {
        // ← AGREGADO: Validar fecha futura
        const seleccionada = new Date(fecha);
        const hoy = new Date();
        const fechaMaxima = hoy.toISOString().split('T')[0];
        hoy.setHours(0, 0, 0, 0);

        if (seleccionada > hoy) {
          this.form.get("fecha_nac")?.setValue(fechaMaxima, { emitEvent: false });
        }
        const edad = this.calcularEdad(fecha);
        this.form.get('edad')?.setValue(edad, { emitEvent: false });
      }
    });

    this.dataLoadedSubscription = this.eventService.eventDataLoadedObservable.subscribe(
      (loaded) => {
        if (loaded) {
          this.loadFormData();
        }
      }
    );
    
    this.loadFormData();
  }

  ngOnDestroy(): void {
    this.dataLoadedSubscription?.unsubscribe();
  }

  loadFormData(){
    const celebrado = this.eventService.getCelebrado_form(0);
    const idTipoEvento = this.eventService.getTipoEvento();
    
    if (celebrado && celebrado.nombres) {
      this.form.patchValue({
        nombres: celebrado.nombres,
        apellido_pat: celebrado.apellido_pat,
        apellido_mat: celebrado.apellido_mat,
        genero: celebrado.genero,
        fecha_nac: celebrado.fecha_nac,
        edad: celebrado.edad,
        tipo: idTipoEvento.toString()
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
    edad = edad >= 0 ? edad : 0; // ← AGREGADO
    edad = edad <= 122 ? edad : 100; // ← AGREGADO
    return edad;
  }

  public saveData(): void {
    if (this.form.invalid) { // ← AGREGADO BLOQUE COMPLETO
      this.form.markAllAsTouched();
      
      const fechaNacControl = this.form.get('fecha_nac');
      if (fechaNacControl?.hasError('edadMinima')) {
        const error = fechaNacControl.getError('edadMinima');
        this.toast.warning(
          `La edad mínima es ${error.requiredAge} años. Edad actual: ${error.actualAge} años`,
          'Edad insuficiente'
        );
        return;
      }
      
      this.toast.warning('Complete correctamente todos los campos', 'Formulario incompleto');
      return;
    }

    if (this.form.valid) {
      const tipoCeremonia = this.form.value["tipo"];
      this.eventService.saveTipoEvento(tipoCeremonia);
      
      const celebradoData = {
        ...this.form.value  
      };
      
      this.eventService.saveCelebradoform(celebradoData, 0);
    }
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