import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { Eventos } from '../../../../../services/eventos';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GetAParroquialEvent, ParroquialEvent } from '../../../../../models/event';
import { ChartNoAxesColumnIcon } from 'lucide-angular';

@Component({
  selector: 'app-form-parroquial',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './form-parroquial.html',
  styleUrl: './form-parroquial.css',
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
})
export class FormParroquial {
today = new Date();
  minday: Date;
  isomin: string;
  selecteday="";
  form:FormGroup;
  eventService=inject(Eventos)
  toast=inject(ToastrService)
  router=inject(Router)
  route = inject(ActivatedRoute);
  button_text:string="Registrar Evento"
  id_event: number | null = null;

  meses = [
    "Enero", "Febrero", "Marzo", "Abril",
    "Mayo", "Junio", "Julio", "Agosto",
    "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  hours_available:string[]=[]
  hours_fin_available: string[] = [];


  constructor(private frm:FormBuilder){
    //RESTRINGIR DIAS PARA SELECCIONAR
    this.minday = new Date(this.today);
    
    this.minday.setDate(this.today.getDate() + 3); // día siguiente
    this.isomin = this.minday.toISOString().split('T')[0]; // YYYY-MM-DD
  

    this.form=frm.group({
      descripcion: ['',Validators.required],
      fecha: ['',Validators.required],
      hora:['',Validators.required],
      hora_fin: ['', Validators.required]

    });
    this.form.get('hora')?.valueChanges.subscribe(horaInicio => {
      if (horaInicio) {
        this.filterHorasFin(horaInicio);
      }
    });

    
  }

  ngOnInit(){
    const id = this.route.snapshot.paramMap.get('id');

    if (id){
      this.button_text="Editar Evento"
      this.id_event=Number(id)
      this.cargarDatosParroquial()
      sessionStorage.setItem('editing_event_id', id);
    }
  }

  ngOnDestroy() {
    sessionStorage.removeItem('editing_event_id');
  }

  cargarDatosParroquial(){
    this.eventService.GetParroquial(this.id_event!).subscribe({
      next: res =>{
        this.llenarFormulario(res)
      }
    })
  }

  llenarFormulario(evento: GetAParroquialEvent) {
    const fechaInicioStr = evento.fecha_inicio.replace('T', ' ');
    const fechaFinStr = evento.fecha_fin.replace('T', ' ');
    
    const fechaInicio = fechaInicioStr.split(' ');
    const fechaFin = fechaFinStr.split(' ');
    
    this.selecteday = fechaInicio[0];
    
    const dateInput = document.getElementById("date") as HTMLInputElement;
    if (dateInput) {
      dateInput.value = this.transformDate(this.selecteday);
    }
    
    const horaInicio = fechaInicio[1].substring(0, 5);
    const horaFin = fechaFin[1].substring(0, 5);
    
    
    this.form.patchValue({
      descripcion: evento.descripcion,
      fecha: fechaInicio[0],
      hora: '', 
      hora_fin: ''
    }, { emitEvent: false });
    
    
    this.eventService.getHorasAvailable(this.selecteday, 6).subscribe({
      next: (res) => {
        this.hours_available = res.hrs_disponibles;
        
    
        const selectHora = document.getElementById("hora") as HTMLSelectElement;
        selectHora.innerHTML = '<option value="">Seleccione hora de inicio</option>';
        res.hrs_disponibles.forEach((hora: string) => {
          const option = document.createElement('option');
          option.value = hora;
          option.textContent = hora;
          selectHora.appendChild(option);
        });
        
    
        selectHora.value = horaInicio;
        this.form.patchValue({ hora: horaInicio }, { emitEvent: true });
        
    
        
    
        setTimeout(() => {
          const selectHoraFin = document.getElementById("hora_fin") as HTMLSelectElement;
          if (selectHoraFin && this.hours_fin_available.includes(horaFin)) {
            selectHoraFin.value = horaFin;
            this.form.patchValue({ hora_fin: horaFin }, { emitEvent: false });
            console.log('✅ Formulario completamente cargado:', this.form.value);
          }
        }, 150);
      },
      error: (err) => {
        console.error('Error al cargar horas:', err);
        this.toast.error('Error al cargar horas disponibles');
      }
    });
  }

  
  getAvailableHours(fecha: string, horaGuardada?: string) {
    this.eventService.getHorasAvailable(fecha, 6).subscribe({
      next: (res) => {
        this.hours_available = res.hrs_disponibles;
        const selectHora = document.getElementById("hora") as HTMLSelectElement;

        selectHora.innerHTML = '<option value="">Seleccione hora de inicio</option>';
        res.hrs_disponibles.forEach((hora: string) => {
          const option = document.createElement('option');
          option.value = hora;
          option.textContent = hora;
          selectHora.appendChild(option);
        });

        if (horaGuardada && res.hrs_disponibles.includes(horaGuardada)) {
          selectHora.value = horaGuardada;
        }
        
        this.form.patchValue({ hora_fin: '' });
        this.hours_fin_available = [];
      },
      error: (err) => {
        console.log(err);
        this.toast.error('Error al cargar horas disponibles');
      }
    });
  }
  
  
  DateChange(event:Event){
    const selected=(event.target as any).value;
    const date_input=document.getElementById("date") as HTMLInputElement
    const fecha=this.transformDate(selected);
    this.selecteday=selected;
    date_input.value=fecha;
    this.form.patchValue({ fecha: selected });
    this.getAvailableHours(selected);
  }

  transformDate(date:String):string{
    const partes=date.split("-")
    const fecha = `${parseInt(partes[2])} de ${this.meses[parseInt(partes[1]) - 1]} de ${partes[0]}`;
    return fecha
  }

  takeHour(){
    const hour_input=document.getElementById("hora") as HTMLSelectElement;
    const hora=hour_input.value;
    console.log(hora)
    return hora
  }

 
  filterHorasFin(horaInicio: string) {    
    const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
    

    this.hours_fin_available = [];
    
    let currentH = horaInicioH;
    let currentM = horaInicioM;
    
    while (true) {
      
      currentM += 60;
      if (currentM >= 60) {
        currentM = 0;
        currentH += 1;
      }
      

      if (currentH >= 24) {
        this.hours_fin_available.push('00:00');
        break;
      }
            
      const horaStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;
      this.hours_fin_available.push(horaStr);
    }

    const selectHoraFin = document.getElementById("hora_fin") as HTMLSelectElement;
    selectHoraFin.innerHTML = '<option value="">Seleccione hora de fin</option>';
    
    this.hours_fin_available.forEach((hora: string) => {
      const option = document.createElement('option');
      option.value = hora;
      option.textContent = hora === '00:00' ? '00:00 (Medianoche)' : hora;
      selectHoraFin.appendChild(option);
    });

    // Resetear selección si ya no es válida
    const currentHoraFin = this.form.get('hora_fin')?.value;
    if (currentHoraFin && !this.hours_fin_available.includes(currentHoraFin)) {
      this.form.patchValue({ hora_fin: '' });
    }
  }

  RegEditEvent(){
    if (this.form.invalid) {
      this.toast.error('Por favor completa todos los campos correctamente');
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.form.value;
    const descripcion = formValue.descripcion;
    const fecha = this.selecteday;
    const hora_inicio = formValue.hora;
    const hora_fin = formValue.hora_fin;

    
    const fecha_inicio = `${fecha} ${hora_inicio}`;
    
    
    let fecha_fin_completa: string;
    
    if (hora_fin === '00:00') {
      const fechaFinDate = new Date(fecha);
      fechaFinDate.setDate(fechaFinDate.getDate() + 1);
      const fechaSiguiente = fechaFinDate.toISOString().split('T')[0];
      fecha_fin_completa = `${fechaSiguiente} ${hora_fin}:00`;
    } else {
      fecha_fin_completa = `${fecha} ${hora_fin}:00`;
    }

    if(this.id_event)
      this.EditarEvento(descripcion,fecha_inicio,fecha_fin_completa)
    else
      this.RegistrarEvento(descripcion,fecha_inicio,fecha_fin_completa)
      
    
  }

  RegistrarEvento(descripcion:string,fecha_inicio:string,fecha_fin_completa:string){
    this.eventService.RegisterParroquial(descripcion,fecha_inicio,fecha_fin_completa).subscribe({
      next: res =>{
        
        this.router.navigate(["/admin/eventos"]);
        this.toast.success("Evento Creado Con Exito");
      },
      error: err =>{
        this.toast.error("Error al crear el evento",err)
      }
    });
  }


  EditarEvento(descripcion:string,fecha_inicio:string,fecha_fin_completa:string){
    this.eventService.EditParroquial(descripcion,fecha_inicio,fecha_fin_completa,this.id_event!).subscribe({
      next: res =>{
        
        this.router.navigate(["/admin/eventos"]);
        this.toast.success("Evento Editado Con Exito");
      },
      error: err =>{
        this.toast.error("Error al editar el evento",err)
      }
    })
  }
}
