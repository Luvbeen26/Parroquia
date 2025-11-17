import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { LucideAngularModule,Newspaper,FileText,LogOut } from 'lucide-angular';
import { Auth } from '../../services/auth';



@Component({
  selector: 'app-sidebar-admin',
  imports: [RouterLink,MatIcon,LucideAngularModule],
  templateUrl: './sidebar-admin.html',
  styleUrl: './sidebar-admin.css', 
  host: {
    ngSkipHydration: 'true' // ✅ Deshabilita hidratación solo en este componente
  }
})
export class SidebarAdmin {
  //ICONOS DE LUCIDE ICON
  readonly Newspaper = Newspaper;
  readonly FileText = FileText;
  readonly LogOut = LogOut;
  isMenuOpen = false;
  userName = '';
  authService=inject(Auth)

  ngOnInit(){
    this.userName = this.authService.get_UserName() || '';
  }
  

  menuItems = [
    { icon: 'dashboard', label: 'Panel de Administración', route: '/admin', active: true },
    { icon: 'publication', label: 'Publicaciones', route: '/admin/publications', active: false },
    { icon: 'event', label: 'Eventos', route: '/admin/eventos', active: false },
    { icon: 'document', label: 'Documentos', route: '/admin/documentos', active: false },
    { icon: 'finanzas', label: 'Finanzas', route: '/admin/finanzas', active: false }
  ];

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    if (window.innerWidth <= 768) {
      this.isMenuOpen = false;
    }
  }

  setActive(index: number) {
    this.menuItems.forEach((item, i) => {
      item.active = i === index;
    });
  }

  logout(){
    this.authService.logout();
  }
}
