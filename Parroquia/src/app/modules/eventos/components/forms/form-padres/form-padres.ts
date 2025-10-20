import { Component,EventEmitter,Input,Output } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-padres',
  imports: [HeaderForm,ReactiveFormsModule],
  templateUrl: './form-padres.html',
  styleUrl: './form-padres.css'
})
export class FormPadres {
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
    this.steps.emit(true);
    this.formdata.emit(this.form.value);
  }

  prev(){
    this.steps.emit(false);
    this.formdata.emit(this.form.value);
  }


  ngOnInit(){
    if(this.formgroup && this.formgroup.length > 0){
      this.form.setValue({
        nombres_f: this.formgroup[0].nombres_f || '',
        ap_pat_f: this.formgroup[0].ap_pat_f || '',
        ap_mat_f: this.formgroup[0].ap_mat_f || '',
        nombres_m: this.formgroup[0].nombres_m || '',
        ap_pat_m:this.formgroup[0].ap_pat_m || '',
        ap_mat_m: this.formgroup[0].ap_mat_m || '',
        nombres_p:this.formgroup[0].nombres_p || '',
        ap_pat_p: this.formgroup[0].ap_pat_p || '',
        ap_mat_p: this.formgroup[0].ap_mat_p || ''
      })
    }
  }

}
