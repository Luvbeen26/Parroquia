import { Component, inject } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Eventos } from '../../../../../services/eventos';

@Component({
  selector: 'app-form-bautizo',
  imports: [HeaderForm, ReactiveFormsModule],
  templateUrl: './form-bautizo.html',
  styleUrl: './form-bautizo.css'
})
export class FormBautizo {
  eventService = inject(Eventos)
  form!: FormGroup;

  constructor(private frm: FormBuilder) {
    this.form = frm.group({
      nombres: ['', Validators.required],
      apellido_pat: ['', Validators.required],
      apellido_mat: [''],
      genero: ['', Validators.required],
      fecha_nac: ['', Validators.required],
      edad: ['', Validators.required],
      tipo: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    const savedata = this.eventService.getCelebrado_form()
    if (savedata) {
      this.form.patchValue(savedata)

      const tipo = this.eventService.getTipoEvento()
      this.form.patchValue({
        tipo: tipo
      });
    }
  }

  public saveData(): void {
    if (this.form.valid) {
      const tipoCeremonia = this.form.value["tipo"];
      
      this.eventService.saveTipoEvento(tipoCeremonia);
      
      const celebradoData = {
        ...this.form.value  // ✅ Como lo tenías antes, incluye TODO el form
      };
      
      this.eventService.saveCelebradoform(celebradoData, 0);
    }
  }
}