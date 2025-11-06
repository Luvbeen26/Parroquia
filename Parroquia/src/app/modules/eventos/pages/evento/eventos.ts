import { Component } from '@angular/core';
import { EventInfoCard } from '../../components/event-info-card/event-info-card';


@Component({
  selector: 'app-eventos',
  imports: [EventInfoCard],
  templateUrl: './eventos.html',
  styleUrl: './eventos.css'
})
export class Eventos {
  eventosList=[
    { nombre:"Bautizo", image:"img/bautizo.png",route_prog:"/eventos/create_event",
      requisitos:["Copia y acta de nacimiento del bautizado","Copia de la credencial de padrio/madrina","Copia de fe de bautismo de los padrinos"],programar: 500,id:1},
    { nombre:"Confirmacion", image:"img/confirmacion.png",route_prog:"/eventos/create_event",
      requisitos:["Copia y acta de nacimiento del confirmado","Copia de la credencial de padrio/madrina","Copia de fe de confirmación de los padrinos"], programar: 500,id:7},
    { nombre:"Primera Comunion", image:"img/primer.png",route_prog:"/eventos/create_event",
      requisitos:["Copia y acta de nacimiento del comulgante","Copia de la credencial de padrio/madrina","Copia de fe de primera comunion de los padrinos"], programar: 500,id:3},
    { nombre:"Matrimonio", image:"img/matrimonio.png",route_prog:"/eventos/create_event",
      requisitos:["Acta de nacimiento del novio y la novia","Fe de bautismo del novio y la novia","Fe de primera comunión del novio y la novia","Fe de confirmacion del novio y la novia","Copia de la credencial del novio y la novia","Copia de la credencial de los padrinos"],programar: 500,id:4},
    { nombre:"XV Años", image:"img/xv.png",route_prog:"/eventos/create_event",
      requisitos:["Copia y acta de nacimiento de la quinceañera","Copia de la fe de bautismo","Copia de fe de primera comunion","Copia de fe de confirmación"], programar: 500,id:5},


  ]
}
