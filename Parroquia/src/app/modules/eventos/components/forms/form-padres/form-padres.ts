import { Component,EventEmitter,inject,Input,Output } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Eventos } from '../../../../../services/eventos';


@Component({
  selector: 'app-form-padres',
  imports: [HeaderForm,ReactiveFormsModule],
  templateUrl: './form-padres.html',
  styleUrl: './form-padres.css'
})
export class FormPadres {
  eventService=inject(Eventos)
  @Input() formgroup!: any;
  @Output() steps=new EventEmitter<boolean>();
  @Output() formdata=new EventEmitter<any>();

  form: FormGroup;

  constructor(private builder:FormBuilder){
    this.form=this.builder.group({
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

  next(){
    this.saveParents();
    this.steps.emit(true);
  }

  prev(){
    this.saveParents();
    this.steps.emit(false);
  }


  ngOnInit(){
    const savedataParents=this.eventService.getParents_form('Parents')
    const savedataPadrino=this.eventService.getParents_form('Padrinos')


    if (savedataPadrino && savedataPadrino.length > 0) {
      const padrino = savedataPadrino[0];
      this.form.patchValue({
        nombres_p: padrino.nombres || '',
        ap_pat_p: padrino.ap_pat || '',
        ap_mat_p: padrino.ap_mat || ''
      });
    }


    if (savedataParents && savedataParents.length >= 2) {
      const padre = savedataParents[0];
      const madre = savedataParents[1];
      this.form.patchValue({
        nombres_f: padre.nombres || '',
        ap_pat_f: padre.ap_pat || '',
        ap_mat_f: padre.ap_mat || '',
        nombres_m: madre.nombres || '',
        ap_pat_m: madre.ap_pat || '',
        ap_mat_m: madre.ap_mat || '',
      });
    }
  }

  saveParents(){
    const formValue = this.form.value;

    this.eventService.saveParentsForm(
      {
        nombres: formValue.nombres_f,
        ap_pat: formValue.ap_pat_f,
        ap_mat: formValue.ap_mat_f
      },'Parents',0);

    
    this.eventService.saveParentsForm(
      {
        nombres: formValue.nombres_m,
        ap_pat: formValue.ap_pat_m,
        ap_mat: formValue.ap_mat_m
      },'Parents',1);

    
    this.eventService.saveParentsForm(
      {
        nombres: formValue.nombres_p,
        ap_pat: formValue.ap_pat_p,
        ap_mat: formValue.ap_mat_p
      },'Padrinos',0);

  }
}
