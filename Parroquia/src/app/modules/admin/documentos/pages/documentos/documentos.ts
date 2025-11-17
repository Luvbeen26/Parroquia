import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-documentos',
  imports: [MatIconModule,MatTooltipModule],
  templateUrl: './documentos.html',
  styleUrl: './documentos.css'
})
export class Documentos {
searchText = '';
  currentPage = 1;
  totalPages = 2;
  pages = [1, 2];

  documentos = [
    {
      id: 1,
      celebrante: 'Emma Vega Zorrillo',
      evento: 'Confirmacion',
      folio: '1828901',
      documento: 'Credencial del Padrino'
    },
    {
      id: 2,
      celebrante: 'Elizabeth Inzunza Vega',
      evento: 'Primera Comunion',
      folio: '1828902',
      documento: 'Credencial del Padrino'
    },
    {
      id: 3,
      celebrante: 'Elizabeth Inzunza Vega',
      evento: 'Primera Comunion',
      folio: '1828902',
      documento: 'Fe de primera comunion de Padrino'
    },
    {
      id: 4,
      celebrante: 'Elizabeth Inzunza Vega',
      evento: 'Primera Comunion',
      folio: '1828902',
      documento: 'Acta de Nacimiento'
    },
    {
      id: 5,
      celebrante: 'Iveth Vega Fierro & Francisco Inzunza Hernandez',
      evento: 'Matrimonio',
      folio: '1828903',
      documento: 'Acta de nacimiento (Novio)'
    },
    {
      id: 6,
      celebrante: 'Iveth Vega Fierro & Francisco Inzunza Hernandez',
      evento: 'Matrimonio',
      folio: '1828903',
      documento: 'Acta de nacimiento (Novia)'
    }
  ];

  revisarDocumento(id: number) {
    console.log('Revisar documento:', id);
    // Abrir modal para ver el documento
  }

  aceptarDocumento(id: number) {
    console.log('Aceptar documento:', id);
    // Lógica para aceptar
  }

  rechazarDocumento(id: number) {
    console.log('Rechazar documento:', id);
    // Lógica para rechazar
  }

  goToPage(page: number) {
    this.currentPage = page;
    // Cargar datos de la página
  }
}
