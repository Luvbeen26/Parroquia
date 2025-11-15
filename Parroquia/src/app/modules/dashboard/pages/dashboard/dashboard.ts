import { Component, inject, PLATFORM_ID } from '@angular/core';
import { StatCard } from '../../components/stat-card/stat-card';
import { DashboardS } from '../../../../services/dashboardS';
import { CardsInfo, PieEvents,ChartGetData, ChartGetDataPie, ResumeIA } from '../../../../models/dashboardModels';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts'; 
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Modalcomponent } from '../../../../shared/modalcomponent/modalcomponent';


@Component({
  selector: 'app-dashboard',
  imports: [StatCard,BaseChartDirective,CommonModule,Modalcomponent,MatIcon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  dashService=inject(DashboardS)
  items:CardsInfo | null=null
  
  private mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio','Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  public dataChartSubject= new BehaviorSubject<ChartConfiguration<'bar'>['data']>({
    labels: [],datasets: []})

  dataChart$=this.dataChartSubject.asObservable();

  public chartOptions:ChartConfiguration<'bar'>['options'] ={
    responsive:true,
  };

  public pieChartSubject = new BehaviorSubject<ChartConfiguration<'pie'>['data']>({
    labels: [],
    datasets: []
  });

  pieChart$ = this.pieChartSubject.asObservable();


  public resume=new BehaviorSubject<ResumeIA | null>(null);
  resume$=this.resume.asObservable();

  public isModalOpen = false;

  ngOnInit(){
    this.CargarCards();
    this.GetIngresosGastos();
    this.GetEventsLastMonth();
    this.getResumeIA();
    
  }


  CargarCards(){
    this.dashService.getCardInfo().subscribe({
      next: (res) =>{
        this.items=res
      },
      error: (err) =>{
        console.log(err)
      }
    })
  }



  GetIngresosGastos(){
    this.dashService.getDataIngGas().subscribe({
      next:(res: ChartGetData[]) =>{
        this.ProcesarDatos(res,null);
        
      },
      error: (err) =>{
        console.log(err)
      }
    })
  }

  GetEventsLastMonth(){
    this.dashService.getEventsDataPie().subscribe({
      next:(res:ChartGetDataPie) =>{
        this.ProcesarDatos(null,res);
      },
      error: (err) =>{
        console.log(err)
      }
    })
  }

  ProcesarDatos(dataBar:ChartGetData[] | null, dataPie:ChartGetDataPie | null){
    if(dataBar){
      this.dataChartSubject.next({
        labels: dataBar!.map(i => this.mesesNombres[i.mes - 1]),
        datasets:[
          {
            label: 'Ingresos',data:dataBar!.map(i=>i.ingresos),backgroundColor:'#263A4C',borderColor:'#263A4C',
            borderWidth:1,borderRadius:4
          },
          {
            label: 'Gastos',data:dataBar!.map(i=>i.egresos),backgroundColor:'#B60A0A',borderColor:'#B60A0A',
            borderWidth:1,borderRadius:4
          }
        ]
      })
    }

    if(dataPie){
      const labels=["Bautizo","Primera Comunion","Matrimonio","XV Años","Confirmacion"]

      const dataValues = labels.map(label => {
        const item = dataPie.eventos.find( (e:PieEvents) => e.tipo_evento === label);
        return item ? item.cantidad : 0;
      });

      this.pieChartSubject.next({
        labels:labels,
        datasets:[
          { data: dataValues,backgroundColor: ['#6366f1', '#742FD3','#EF4444','#EC4899','#1F734F']
          } 
        ]
      })
    }
  }

  getResumeIA(){
    this.dashService.getResumeIa().subscribe({
      next: (res:ResumeIA) =>{
        this.resume.next(res)
        console.log(this.resume)
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  openResumeModal() {
    this.isModalOpen = true;
    
  }


  closeResumeModal() {
    this.isModalOpen = false;
  }
}
