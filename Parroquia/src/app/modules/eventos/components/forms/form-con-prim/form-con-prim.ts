import { Component, inject, Input } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Eventos } from '../../../../../services/eventos';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-con-prim',
  imports: [HeaderForm, ReactiveFormsModule, MatIconModule],
  templateUrl: './form-con-prim.html',
  styleUrl: './form-con-prim.css'
})
export class FormConPrim {
  eventService = inject(Eventos)
  private dataLoadedSubscription?: Subscription;
  @Input() id_event!: number;
  
  eventName!: string;
  form: FormGroup;
  icon!: string

  constructor(private frm: FormBuilder) {
    this.form = frm.group({
      nombres: ['', Validators.required],
      apellido_pat: ['', Validators.required],
      apellido_mat: ['', Validators.required],
      genero: ['', Validators.required],
      fecha_nac: ['', Validators.required],
      edad: ['', Validators.required]
    });
    this.form.get('fecha_nac')?.valueChanges.subscribe(fecha => {
      if (fecha) {
        const edad = this.calcularEdad(fecha);
        this.form.get('edad')?.setValue(edad, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.eventName = this.id_event == 3 ? "Comulgante" : "Confirmado";
    this.icon = this.id_event == 3 ? "../icons/sacramentos/cross.svg" : "../icons/sacramentos/confirmacion.svg";

    this.dataLoadedSubscription = this.eventService.eventDataLoadedObservable.subscribe(
      (loaded) => {
        if (loaded) {
          this.loadFormData();
        }
      }
    );
    
    if (this.eventService.isInEditMode()) {
      this.loadFormData();
    }
  }

  loadFormData(){
    const savedata = this.eventService.getCelebrado_form()

    if (savedata) {
      this.form.patchValue(savedata)
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
    return edad;
  }


  saveData() {
    if (this.form.valid) {
      this.eventService.saveTipoEvento(this.id_event)
      const celebradoData = {
        ...this.form.value
      };
      this.eventService.saveCelebradoform(celebradoData, 0)
    }
  }
}