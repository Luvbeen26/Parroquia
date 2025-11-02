import { Component,Input, Output,EventEmitter } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';




@Component({
  selector: 'app-form-bautizo',
  imports: [HeaderForm,ReactiveFormsModule],
  templateUrl: './form-bautizo.html',
  styleUrl: './form-bautizo.css'
})
export class FormBautizo {
  @Input() formgroup!: any;
  @Output() formdata=new EventEmitter<any>();
  @Output() steps=new EventEmitter<boolean>();
  

  form:FormGroup;

 

  constructor(private frm:FormBuilder){
    this.form=frm.group({
      nombres: ['',Validators.required],
      ap_pat:['',Validators.required],
      ap_mat:['',Validators.required],
      genero:['',Validators.required],
      fecha_nac:['',Validators.required],
      edad:['',Validators.required],
      tipo:['',Validators.required]
    })
  }


  ngOnInit(){
    if(this.formgroup && this.formgroup.length > 0){
      
      this.form.setValue({
        nombres: this.formgroup[0].nombres,
        ap_pat:this.formgroup[0].ap_pat,
        ap_mat:this.formgroup[0].ap_mat,
        genero:this.formgroup[0].genero,
        fecha_nac:this.formgroup[0].fecha_nac,
        edad:this.formgroup[0].edad,
        tipo:this.formgroup[0].tipo
      })
    }
    
  }

  next(){
    this.steps.emit(true);
    console.log(this.form.value)
    this.formdata.emit(this.form.value)
  }
}
