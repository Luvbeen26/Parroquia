import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormMatrimonio } from '../../../eventos/components/forms/form-matrimonio/form-matrimonio';
import { FormPadres } from '../../../eventos/components/forms/form-padres/form-padres';
import { FormBautizo } from '../../../eventos/components/forms/form-bautizo/form-bautizo';
import { FormConPrim } from '../../../eventos/components/forms/form-con-prim/form-con-prim';
import { FormPadresMatrimonio } from '../../../eventos/components/forms/form-padres-matrimonio/form-padres-matrimonio';
import { FormPadrinosMatrimonio } from '../../../eventos/components/forms/form-padrinos-matrimonio/form-padrinos-matrimonio';
import { FormDate } from '../../../eventos/components/forms/form-date/form-date';
import { MatIconModule } from '@angular/material/icon';
import { Eventos } from '../../../../services/eventos';
import { Auth } from '../../../../services/auth';
import { GetALLAEvent } from '../../../../models/event';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-event',
  imports: [FormMatrimonio,FormPadres,FormBautizo,FormConPrim,FormPadresMatrimonio,FormPadrinosMatrimonio,FormDate,
    MatIconModule
  ],
  templateUrl: './edit-event.html',
  styleUrl: './edit-event.css'
})
export class EditEvent {
  router=inject(Router)
  route=inject(ActivatedRoute)
  eventService=inject(Eventos)
  authService=inject(Auth)
  toast=inject(ToastrService)
  id_evento!:number
  id_tipo_evento!:number
  tipo!:string
  step = 0;
  Eventdata!:GetALLAEvent

  @ViewChild(FormBautizo) formBautizoRef!: FormBautizo;
  @ViewChild(FormConPrim) formConPrimRef!: FormConPrim;
  @ViewChild(FormPadres) formPadresRef!: FormPadres;
  @ViewChild(FormPadresMatrimonio) formPadresMatrimonioRef!: FormPadresMatrimonio;
  @ViewChild(FormPadrinosMatrimonio) formPadrinosMatrimonioRef!: FormPadrinosMatrimonio;
  @ViewChild(FormDate) formDateRef!: FormDate;
  @ViewChild(FormMatrimonio, { static: false }) formMatrimonioRef!: FormMatrimonio;

  //QUITAR POSIBILIDAD DE AÑADIR O QUITAR PADRINOS EN MATRIMONIO

  ngOnInit(){
    this.id_tipo_evento = Number(this.route.snapshot.paramMap.get('id_tipo'));
    this.id_evento = Number(this.route.snapshot.paramMap.get('id'));
    this.tipo = String(this.route.snapshot.paramMap.get('tipo'));
    
    //const id_user=this.authService.get_UserID();

    if(!(this.id_evento && this.id_tipo_evento && this.tipo)){
      this.router.navigate(["/profile"])
      return; // ¡Importante! Detener la ejecución
    }

    this.eventService.GetInfoEventForEdit(this.id_evento).subscribe({
      next: (res:GetALLAEvent) =>{
        this.eventService.loadEventForEdit(res)
      },
      error: err =>{
         if (err.status === 403) {
          this.toast.error('No tienes permisos para editar este evento');
          this.router.navigate(["/"]);
        } else if (err.status === 404) {
          this.toast.error('El evento no existe');
          this.router.navigate(["/profile"]);
        } else {
          this.toast.error('Error al cargar el evento');
          this.router.navigate(["/profile"]);
        }
      }
    })

  
  }

  nextStep() {
    if (!this.canGoNext()) {
      this.markCurrentFormAsTouched();
      return;
    }
    this.saveCurrentStep();
    
    if(this.tipo === "Date"){
      //this.editDate();
    }else if((this.id_tipo_evento === 4 && this.step === 2) || (this.id_tipo_evento !== 4 && this.step === 1)){
      //this.editParticipantes o celebrados 
    }
    else {
      this.step++;
      //setTimeout(() => this.cdr.detectChanges(), 100);
    }
  }

  prevStep() {
    if (this.step > 0) {
      this.saveCurrentStep();
      this.step--;
      //setTimeout(() => this.cdr.detectChanges(), 100);
    }
  }

  saveCurrentStep() {
    switch (this.tipo){
      case "Participantes":
        if (this.id_tipo_evento === 4) {
          switch (this.step) {
            case 0:
              this.formMatrimonioRef?.saveData();
              break;
            case 1:
              this.formPadresMatrimonioRef?.saveParents();
              break;
            case 2:
              this.formPadrinosMatrimonioRef?.saveParents();
              break;
          }
        } else {
          switch (this.step) {
            case 0:
              if (this.id_tipo_evento === 1) {
                this.formBautizoRef?.saveData();
              } else if (this.id_tipo_evento === 3 || this.id_tipo_evento === 7) {
                this.formConPrimRef?.saveData();
              }
              break;
            case 1:
              this.formPadresRef?.saveParents();
              break;
          }
        }
        break
      case "Date":
        this.formDateRef?.saveData();
        break
      default:
        this.router.navigate(["/profile"])
    }
    
  }

  canGoNext(): boolean {
    switch(this.tipo){
      case "Participantes":
        if (this.id_tipo_evento === 4) {
          switch (this.step) {
            case 0: 
              return this.formMatrimonioRef?.form?.valid || false;
            case 1: 
              return this.formPadresMatrimonioRef?.form?.valid || false;
            case 2: 
              return this.formPadrinosMatrimonioRef?.form?.valid || false;
            default:
              return false;
          }
        } else {
          switch (this.step) {
            case 0:
              if (this.id_tipo_evento === 1) {
                return this.formBautizoRef?.form?.valid || false;
              } else if (this.id_tipo_evento === 3 || this.id_tipo_evento === 7) {
                return this.formConPrimRef?.form?.valid || false;
              }
              return false;
            case 1:
              return this.formPadresRef?.form?.valid || false;
            default:
              return false;
          }
        }
        break;
      case "Date":
        return (this.formDateRef?.form?.valid && this.formDateRef?.selecteday !== '') || false;
        break;
      default:
        return false;
    }
  }

  markCurrentFormAsTouched() {
    switch (this.tipo) {
      case "Participantes":
        if (this.id_tipo_evento === 4) {
          switch (this.step) {
            case 0:
              this.formMatrimonioRef?.form?.markAllAsTouched();
              break;
            case 1:
              this.formPadresMatrimonioRef?.form?.markAllAsTouched();
              break;
            case 2:
              this.formPadrinosMatrimonioRef?.form?.markAllAsTouched();
              break;
          }
        } else {
          switch (this.step) {
            case 0:
              if (this.id_tipo_evento === 1) {
                this.formBautizoRef?.form?.markAllAsTouched();
              } else if (this.id_tipo_evento === 3 || this.id_tipo_evento === 7) {
                this.formConPrimRef?.form?.markAllAsTouched();
              }
              break;
            case 1:
              this.formPadresRef?.form?.markAllAsTouched();
              break;
          }
        }
        break;
      case "Date":
        this.formDateRef?.form?.markAllAsTouched();
        break;
      default:
        break;
    }
  }
  
  
  ngOnDestroy(): void {
    this.eventService.reset_data();
  }  
}
