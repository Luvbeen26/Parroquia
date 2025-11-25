import { Component, inject, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';

import { FormBautizo } from '../../components/forms/form-bautizo/form-bautizo';
import { FormPadres } from '../../components/forms/form-padres/form-padres';
import { FormDocuments } from '../../components/forms/form-documents/form-documents';
import { FormDate } from '../../components/forms/form-date/form-date';
import { FormPay } from '../../components/forms/form-pay/form-pay';
import { ActivatedRoute, Router } from '@angular/router';
import { FormConPrim } from '../../components/forms/form-con-prim/form-con-prim';
import { FormGroup } from '@angular/forms';
import { Eventos } from '../../../../services/eventos';
import { ToastrService } from 'ngx-toastr';
import { MatIconModule } from '@angular/material/icon';
import { FormMatrimonio } from '../../components/forms/form-matrimonio/form-matrimonio';
import { FormPadresMatrimonio } from '../../components/forms/form-padres-matrimonio/form-padres-matrimonio';
import { FormPadrinosMatrimonio } from '../../components/forms/form-padrinos-matrimonio/form-padrinos-matrimonio';

@Component({
  selector: 'app-create-event',
  imports: [FormBautizo, FormPadres, FormDocuments, FormDate, FormPay, FormConPrim, MatIconModule, FormMatrimonio, FormPadresMatrimonio, FormPadrinosMatrimonio],
  templateUrl: './create-event.html',
  styleUrl: './create-event.css'
})
export class CreateEvent implements AfterViewInit {
  route = inject(ActivatedRoute)
  router = inject(Router)
  eventService = inject(Eventos)
  toast = inject(ToastrService)
  cdr = inject(ChangeDetectorRef)

  @ViewChild(FormBautizo) formBautizoRef!: FormBautizo;
  @ViewChild(FormConPrim) formConPrimRef!: FormConPrim;
  @ViewChild(FormPadres) formPadresRef!: FormPadres;
  @ViewChild(FormPadresMatrimonio) formPadresMatrimonioRef!: FormPadresMatrimonio;
  @ViewChild(FormPadrinosMatrimonio) formPadrinosMatrimonioRef!: FormPadrinosMatrimonio;
  @ViewChild(FormDocuments) formDocumentsRef!: FormDocuments;
  @ViewChild(FormDate) formDateRef!: FormDate;
  @ViewChild(FormPay) formPayRef!: FormPay;
  @ViewChild(FormMatrimonio, { static: false }) formMatrimonioRef!: FormMatrimonio;

  celebrado_form!: FormGroup
  eventoId!: number
  step = 0;
  
  // Método para obtener el número total de steps según el evento
  get totalSteps(): number {
    return this.eventoId === 4 ? 6 : 5; // Matrimonio tiene 6 steps, otros tienen 5
  }
  
  constructor() {
    this.eventoId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  canGoNext(): boolean {
    if (this.eventoId === 4) {
      switch (this.step) {
        case 0: // Datos de novios
          return this.formMatrimonioRef?.form?.valid || false;
        case 1: // Datos de padres
          return this.formPadresMatrimonioRef?.form?.valid || false;
        case 2: // Datos de padrinos
          return this.formPadrinosMatrimonioRef?.form?.valid || false;
        case 3: // Documentos
          return this.formDocumentsRef?.isAllFilesUploaded || false;
        case 4: // Fecha y hora
          return (this.formDateRef?.form?.valid && this.formDateRef?.selecteday !== '') || false;
        case 5: // Pago
          return this.formPayRef?.formPago?.valid || false;
        default:
          return false;
      }
    } else {
      // Lógica normal para otros eventos (5 steps)
      switch (this.step) {
        case 0: // Datos del celebrado
          if (this.eventoId === 1) {
            return this.formBautizoRef?.form?.valid || false;
          } else if (this.eventoId === 3 || this.eventoId === 7) {
            return this.formConPrimRef?.form?.valid || false;
          }
          return false;
        case 1: // Padres y padrinos
          return this.formPadresRef?.form?.valid || false;
        case 2: // Documentos
          return this.formDocumentsRef?.isAllFilesUploaded || false;
        case 3: // Fecha y hora
          return (this.formDateRef?.form?.valid && this.formDateRef?.selecteday !== '') || false;
        case 4: // Pago
          return this.formPayRef?.formPago?.valid || false;
        default:
          return false;
      }
    }
  }

  nextStep() {
    if (!this.canGoNext()) {
      this.markCurrentFormAsTouched();
      return;
    }
    this.saveCurrentStep();
    
    if ((this.eventoId === 4 && this.step === 5) || (this.eventoId !== 4 && this.step === 4)) {
      this.createEvent();
    } else {
      this.step++;
      setTimeout(() => this.cdr.detectChanges(), 100);
    }
  }

  prevStep() {
    if (this.step > 0) {
      this.saveCurrentStep();
      this.step--;
      setTimeout(() => this.cdr.detectChanges(), 100);
    }
  }

  saveCurrentStep() {
    if (this.eventoId === 4) {
      // Lógica para matrimonio
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
        case 3:
          this.formDocumentsRef?.SaveFileService(this.formDocumentsRef.uploadDocs);
          break;
        case 4:
          this.formDateRef?.saveData();
          break;
      }
    } else {
      // Lógica para otros eventos
      switch (this.step) {
        case 0:
          if (this.eventoId === 1) {
            this.formBautizoRef?.saveData();
          } else if (this.eventoId === 3 || this.eventoId === 7) {
            this.formConPrimRef?.saveData();
          }
          break;
        case 1:
          this.formPadresRef?.saveParents();
          break;
        case 2:
          this.formDocumentsRef?.SaveFileService(this.formDocumentsRef.uploadDocs);
          break;
        case 3:
          this.formDateRef?.saveData();
          break;
      }
    }
  }

  markCurrentFormAsTouched() {
    if (this.eventoId === 4) {
      // Lógica para matrimonio
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
        case 4:
          this.formDateRef?.form?.markAllAsTouched();
          break;
        case 5:
          this.formPayRef?.formPago?.markAllAsTouched();
          break;
      }
    } else {
      // Lógica para otros eventos
      switch (this.step) {
        case 0:
          if (this.eventoId === 1) {
            this.formBautizoRef?.form?.markAllAsTouched();
          } else if (this.eventoId === 3 || this.eventoId === 7) {
            this.formConPrimRef?.form?.markAllAsTouched();
          }
          break;
        case 1:
          this.formPadresRef?.form?.markAllAsTouched();
          break;
        case 3:
          this.formDateRef?.form?.markAllAsTouched();
          break;
        case 4:
          this.formPayRef?.formPago?.markAllAsTouched();
          break;
      }
    }
  }

  createEvent() {
    if (!this.formPayRef?.formPago?.valid) {
      this.formPayRef?.formPago?.markAllAsTouched();
      return;
    }

    this.eventService.CreateEvent().subscribe({
      next: (response) => {
        this.toast.success("Comprobante de pago, enviado a su correo", "Evento Creado")
        this.router.navigate(["/"])
      },
      error: (err) => {
        this.toast.error(err.error.detail || "Error al crear evento", "Error")
        console.error('Error completo:', err)
      }
    })
  }

  ngOnDestroy(): void {
    this.eventService.reset_data();
  }
}