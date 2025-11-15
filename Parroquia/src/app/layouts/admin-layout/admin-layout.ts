import { Component } from '@angular/core';
import { SidebarAdmin } from '../../shared/sidebar-admin/sidebar-admin';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [SidebarAdmin,RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {

}
