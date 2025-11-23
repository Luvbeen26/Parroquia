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

@Component({
  selector: 'app-create-event',
  imports: [FormBautizo, FormPadres, FormDocuments, FormDate, FormPay, FormConPrim, MatIconModule],
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
  @ViewChild(FormDocuments) formDocumentsRef!: FormDocuments;
  @ViewChild(FormDate) formDateRef!: FormDate;
  @ViewChild(FormPay) formPayRef!: FormPay;

  celebrado_form!: FormGroup
  eventoId!: number
  step = 0;
  
  constructor() {
    this.eventoId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit() {
    
  }

  // ✅ Usar AfterViewInit en lugar de AfterViewChecked
  ngAfterViewInit() {
    // ✅ Forzar detección inicial
    this.cdr.detectChanges();
  }

  canGoNext(): boolean {
    // ✅ Agregar un pequeño delay para asegurar que el ViewChild esté listo
    setTimeout(() => this.cdr.detectChanges(), 0);
    
    switch (this.step) {
      case 0:
        if (this.eventoId === 1) {
          return this.formBautizoRef?.form?.valid || false;
        } else if (this.eventoId === 3 || this.eventoId === 7) {
          return this.formConPrimRef?.form?.valid || false;
        }
        return false;
      case 1:
        return this.formPadresRef?.form?.valid || false;
      case 2:
        return this.formDocumentsRef?.isAllFilesUploaded || false;
      case 3:
        return (this.formDateRef?.form?.valid && this.formDateRef?.selecteday !== '') || false;
      case 4:
        return this.formPayRef?.formPago?.valid || false;
      default:
        return false;
    }
  }

  nextStep() {
    if (!this.canGoNext()) {
      this.markCurrentFormAsTouched();
      return;
    }

    this.saveCurrentStep();

    if (this.step === 4) {
      this.createEvent();
    } else {
      this.step++;
      // ✅ Forzar detección después de cambiar de paso
      setTimeout(() => this.cdr.detectChanges(), 100);
    }
  }

  prevStep() {
    if (this.step > 0) {
      this.saveCurrentStep();
      this.step--;
      // ✅ Forzar detección después de cambiar de paso
      setTimeout(() => this.cdr.detectChanges(), 100);
    }
  }

  saveCurrentStep() {
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

  markCurrentFormAsTouched() {
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