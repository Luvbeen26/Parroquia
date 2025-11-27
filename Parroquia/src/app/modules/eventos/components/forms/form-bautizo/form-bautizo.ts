import { Component, inject } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Eventos } from '../../../../../services/eventos';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-bautizo',
  imports: [HeaderForm, ReactiveFormsModule],
  templateUrl: './form-bautizo.html',
  styleUrl: './form-bautizo.css'
})
export class FormBautizo {
  eventService = inject(Eventos)
  form!: FormGroup;
  private dataLoadedSubscription?: Subscription;
  

  constructor(private frm: FormBuilder) {
    this.form = frm.group({
      nombres: ['', Validators.required],
      apellido_pat: ['', Validators.required],
      apellido_mat: [''],
      genero: ['', Validators.required],
      fecha_nac: ['', Validators.required],
      edad: ['', Validators.required],
      tipo: ['', Validators.required]
    });

    this.form.get('fecha_nac')?.valueChanges.subscribe(fecha => {
      if (fecha) {
        const edad = this.calcularEdad(fecha);
        this.form.get('edad')?.setValue(edad, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
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
    const celebrado = this.eventService.getCelebrado_form(0);
    const idTipoEvento = this.eventService.getTipoEvento();
    
    console.log('Celebrado:', celebrado);
    console.log('ID Tipo Evento:', idTipoEvento);
    
    if (celebrado) {
      // Cargar datos del celebrado
      this.form.patchValue({
        nombres: celebrado.nombres,
        apellido_pat: celebrado.apellido_pat,
        apellido_mat: celebrado.apellido_mat,
        genero: celebrado.genero,
        fecha_nac: celebrado.fecha_nac,
        edad: celebrado.edad,
        // IMPORTANTE: Convertir a string para que funcione con radio buttons
        tipo: idTipoEvento.toString()
      });
      
      console.log('Formulario después de patchValue:', this.form.value);
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

  public saveData(): void {
    if (this.form.valid) {
      const tipoCeremonia = this.form.value["tipo"];
      
      this.eventService.saveTipoEvento(tipoCeremonia);
      
      const celebradoData = {
        ...this.form.value  
      };
      
      this.eventService.saveCelebradoform(celebradoData, 0);
    }
  }
}