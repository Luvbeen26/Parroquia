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
  @Input() formgroup!:FormGroup;
  @Output() steps=new EventEmitter<boolean>();

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
  }

  prev(){
    this.steps.emit(false);
  }


  ngOnInit(){
    if(this.formgroup){
      
    }
  }

}
