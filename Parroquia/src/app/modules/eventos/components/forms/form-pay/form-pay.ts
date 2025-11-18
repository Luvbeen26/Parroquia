import { Component,EventEmitter,inject,Input,input, Output } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { Eventos } from '../../../../../services/eventos';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-pay',
  imports: [HeaderForm,ReactiveFormsModule],
  templateUrl: './form-pay.html',
  styleUrl: './form-pay.css'
})
export class FormPay {
  eventService=inject(Eventos)
  router=inject(Router)
  toast=inject(ToastrService)
  fb = inject(FormBuilder);
  precio=0
  @Output() steps=new EventEmitter<boolean>();

  @Input() id_event!:number
  formPago!: FormGroup;


  ngOnInit(){
    const tipo=this.eventService.getTipoEvento()
    this.precio = this.eventService.getPrice(tipo);
    console.log(this.precio);

    this.formPago = this.fb.group({
      numero: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      fecha: ['', Validators.required],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
    });
  }

  next(){
    if (this.formPago.invalid) {
      this.formPago.markAllAsTouched();
      return;
    }

    this.eventService.CreateEvent().subscribe({
      next: (response) =>{
        this.toast.success("Comprobante de pago, enviado a su correo","Evento Creado")
        this.router.navigate(["/"])
      },
      error: (err) => {
        this.toast.error(err.error.detail,"Error")
      }
    })

    
  }

  prev(){
    this.steps.emit(false);

  }

}
