import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Modalcomponent } from '../../../../../shared/modalcomponent/modalcomponent';

interface ItemFinanza {
  id: number;
  descripcion: string;
  fecha: Date;
  categoria: string;
  tipo: 'ingreso' | 'gasto';
  monto: number;
  evidencia: string | null;
  notas?: string;
}

@Component({
  selector: 'app-finanzas',
  imports: [CommonModule,MatIconModule,MatTooltipModule,Modalcomponent],
  templateUrl: './finanzas.html',
  styleUrl: './finanzas.css'
})
export class Finanzas {
  fechaInicio: string = '';
  fechaFin: string = '';
  categoriaFiltro: string = '';
  tipoFiltro: string = '';

  // Paginación
  currentPage = 1;
  totalPages = 2;
  pages = [1, 2];

  // Modal
  isModalEvidenciaOpen = false;
  evidenciaUrl: string | null = null;
  itemSeleccionado: ItemFinanza | null = null;

  // Datos
  finanzas: ItemFinanza[] = [
    {
      id: 1,
      descripcion: 'Pago de servicio de Luz',
      fecha: new Date('2025-09-15T14:30:00'),
      categoria: 'servicios',
      tipo: 'gasto',
      monto: 2000,
      evidencia: '/assets/evidencias/luz.jpg'
    },
    {
      id: 2,
      descripcion: 'Pago del agua',
      fecha: new Date('2025-09-10T10:15:00'),
      categoria: 'servicios',
      tipo: 'gasto',
      monto: 1300,
      evidencia: null
    },
    {
      id: 3,
      descripcion: 'Mantenimiento aires',
      fecha: new Date('2025-09-05T16:00:00'),
      categoria: 'mantenimiento',
      tipo: 'gasto',
      monto: 1500,
      evidencia: '/assets/evidencias/aires.jpg'
    },
    {
      id: 4,
      descripcion: 'Avance Pago de panel solar',
      fecha: new Date('2025-08-19T09:00:00'),
      categoria: 'mantenimiento',
      tipo: 'gasto',
      monto: 2000,
      evidencia: '/assets/evidencias/panel.jpg'
    },
    {
      id: 5,
      descripcion: 'Pago a Ministro Juan',
      fecha: new Date('2025-08-16T11:30:00'),
      categoria: 'salarios',
      tipo: 'gasto',
      monto: 1300,
      evidencia: null
    }
  ];

  get totalIngresos(): number {
    return this.finanzas
      .filter(f => f.tipo === 'ingreso')
      .reduce((sum, f) => sum + f.monto, 0);
  }

  get totalGastos(): number {
    return this.finanzas
      .filter(f => f.tipo === 'gasto')
      .reduce((sum, f) => sum + f.monto, 0);
  }

  get balance(): number {
    return this.totalIngresos - this.totalGastos;
  }

  ngOnInit() {
    // Cargar datos iniciales
  }

  aplicarFiltros() {
    console.log('Aplicando filtros:', {
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      categoria: this.categoriaFiltro,
      tipo: this.tipoFiltro
    });
    // Lógica de filtrado
  }

  limpiarFiltros() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.categoriaFiltro = '';
    this.tipoFiltro = '';
    this.aplicarFiltros();
  }

  verEvidencia(id: number) {
    const item = this.finanzas.find(f => f.id === id);
    if (item && item.evidencia) {
      this.itemSeleccionado = item;
      this.evidenciaUrl = item.evidencia;
      this.isModalEvidenciaOpen = true;
    }
  }

  cerrarModalEvidencia() {
    this.isModalEvidenciaOpen = false;
    this.evidenciaUrl = null;
    this.itemSeleccionado = null;
  }

  abrirModalNuevoGasto() {
    console.log('Abrir modal para nuevo gasto/ingreso');
    // Lógica para abrir modal
  }

  editarItem(id: number) {
    console.log('Editar item:', id);
    // Lógica de edición
  }

  eliminarItem(id: number) {
    console.log('Eliminar item:', id);
    // Lógica de eliminación
  }

  cambiarPagina(page: number) {
    this.currentPage = page;
    // Cargar datos de la página
  }
}
