import { Component, inject, Input } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderForm } from '../../header-form/header-form';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Eventos } from '../../../../../services/eventos';

@Component({
  selector: 'app-form-date',
  imports: [HeaderForm, ReactiveFormsModule],
  templateUrl: './form-date.html',
  styleUrl: './form-date.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FormDate {
  today = new Date();
  minday!: Date;
  isomin: string = '';  // ✅ Inicializado como string vacío
  selecteday: string = "";
  form!: FormGroup;
  eventService = inject(Eventos)
  
  @Input() id_event!: number;

  meses = [
    "Enero", "Febrero", "Marzo", "Abril",
    "Mayo", "Junio", "Julio", "Agosto",
    "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  hours_available: string[] = []
  
  constructor(private frm: FormBuilder) {
    // ✅ Solo inicializar el form aquí
    this.form = frm.group({
      fecha: ['', Validators.required],
      hora: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    // ✅ Configurar minday y isomin aquí, cuando ya tenemos id_event
    this.minday = new Date(this.today);
    const days = this.id_event == 4 ? 90 : 3;
    this.minday.setDate(this.today.getDate() + days);
    this.isomin = this.minday.toISOString().split('T')[0];
    
    const fecha_service = this.eventService.getFecha();
    const hour_service = this.eventService.getHour();

    if (fecha_service) {
      this.selecteday = fecha_service;
      const fecha_alter = this.transformDate(fecha_service);
      
      // ✅ Actualizar el FormControl
      this.form.patchValue({ fecha: fecha_alter });
      
      this.getAvailableHours(fecha_service, hour_service);
    }
  }

  DateChange(event: Event): void {
    const selected = (event.target as any).value;
    
    if (!selected) return; // ✅ Validar que hay un valor
    
    const fecha = this.transformDate(selected);
    
    this.selecteday = selected;
    
    // ✅ Actualizar el FormControl para que se vea en el input
    this.form.patchValue({ 
      fecha: fecha,
      hora: '' // Limpiar la hora al cambiar la fecha
    });
    
    this.getAvailableHours(selected);
  }

  transformDate(date: string): string {
    const partes = date.split("-");
    const fecha = `${parseInt(partes[2])} de ${this.meses[parseInt(partes[1]) - 1]} de ${partes[0]}`;
    return fecha;
  }

  takeHour(): string {
    return this.form.value.hora || '';
  }

  getAvailableHours(fecha: string, horaGuardada?: string): void {
    this.eventService.getHorasAvailable(fecha, this.id_event).subscribe({
      next: (res) => {
        this.hours_available = res.hrs_disponibles;
        
        // ✅ Actualizar las opciones del select
        const selectHora = document.getElementById("hora") as HTMLSelectElement;
        selectHora.innerHTML = '<option value="">Seleccione una hora</option>'; 
        
        res.hrs_disponibles.forEach((hora: string) => {
          const option = document.createElement('option');
          option.value = hora;
          option.textContent = hora;
          selectHora.appendChild(option);
        });

        if (horaGuardada && res.hrs_disponibles.includes(horaGuardada)) {
          // ✅ Actualizar el FormControl con un pequeño delay para que el select se haya renderizado
          setTimeout(() => {
            this.form.patchValue({ hora: horaGuardada });
          }, 0);
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  // Método público que el padre puede llamar
  public saveData(): void {
    this.eventService.saveFecha(this.selecteday);
    this.eventService.saveHour(this.takeHour());
  }
}