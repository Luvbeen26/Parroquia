import { Component, inject, Input } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Eventos } from '../../../../../services/eventos';
import { Subscription } from 'rxjs';
import { edadMinimaValidator } from '../../../../../core/validators/edad';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-form-con-prim',
  imports: [HeaderForm, ReactiveFormsModule, MatIconModule],
  templateUrl: './form-con-prim.html',
  styleUrl: './form-con-prim.css'
})
export class FormConPrim {
  eventService = inject(Eventos);
  toast = inject(ToastrService);
  private dataLoadedSubscription?: Subscription;
  @Input() id_event!: number;
  
  eventName!: string;
  form!: FormGroup;
  icon!: string;
  edadMinima!: number;

  constructor(private frm: FormBuilder) {}

  ngOnInit() {
    this.eventName = this.id_event == 3 ? "Comulgante" : this.id_event == 7 ? "Confirmado": "Quinceañera";
    this.icon = this.id_event == 3 ? "../icons/sacramentos/cross.svg" : this.id_event == 7 ? "../icons/sacramentos/confirmacion.svg": "../icons/sacramentos/party.svg";
    this.edadMinima = this.id_event == 3 ? 7 : this.id_event == 5 ? 14 : 12;

    // Crear el formulario con el validador correcto
    this.form = this.frm.group({
      nombres: ['', Validators.required],
      apellido_pat: ['', Validators.required],
      apellido_mat: ['', Validators.required],
      genero: ['', Validators.required],
      fecha_nac: ['', [Validators.required, edadMinimaValidator(this.edadMinima)]],
      edad: ['', Validators.required]
    });

    this.form.get('fecha_nac')?.valueChanges.subscribe(fecha => {
      if (fecha) {
        const edad = this.calcularEdad(fecha);
        const seleccionada=new Date(fecha)
        const hoy=new Date()
        const fechaMaxima = hoy.toISOString().split('T')[0];

        hoy.setHours(0,0,0,0);

        if(seleccionada >hoy){
          this.form.get("fecha_nac")?.setValue(fechaMaxima, { emitEvent : false})
        }
        this.form.get('edad')?.setValue(edad, { emitEvent: false });  
        
        
      }
    });

    // Suscribirse a datos cargados
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

  loadFormData() {
    const savedata = this.eventService.getCelebrado_form(0);

    if (savedata && savedata.nombres) {
      this.form.patchValue(savedata);
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
    edad=edad>=0 ? edad : 0;
    edad=edad<=122 ? edad:100;
    return edad;
  }

  saveData() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      
      // Verificar específicamente el error de edad mínima
      const fechaNacControl = this.form.get('fecha_nac');
      if (fechaNacControl?.hasError('edadMinima')) {
        const error = fechaNacControl.getError('edadMinima');
        this.toast.warning(
          `La edad mínima para ${this.eventName} es ${error.requiredAge} años. Edad actual: ${error.actualAge} años`,
          'Edad insuficiente'
        );
        return;
      }
      
      this.toast.warning('Complete correctamente todos los campos', 'Formulario incompleto');
      return;
    }

    this.eventService.saveTipoEvento(this.id_event);
    const celebradoData = {
      nombres: this.form.value.nombres,
      apellido_pat: this.form.value.apellido_pat,
      apellido_mat: this.form.value.apellido_mat,
      genero: this.form.value.genero,
      fecha_nac: this.form.value.fecha_nac,
      edad: this.form.value.edad,
      id_rol: 0
    };
    this.eventService.saveCelebradoform(celebradoData, 0);
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