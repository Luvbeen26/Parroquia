import { Component, computed, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { PendientProcess } from '../pendient-process/pendient-process';
import { EditProfile } from '../edit-profile/edit-profile';
import { AllEvents } from '../all-events/all-events';
import { Auth } from '../../../../services/auth';
import { Profile } from '../../../../services/profile';
import { Userbase } from '../../../../models/user';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-perfil-contenedor',
  imports: [MatIcon, MatChipsModule, EditProfile, PendientProcess, AllEvents],
  templateUrl: './perfil-contenedor.html',
  styleUrl: './perfil-contenedor.css'
})
export class PerfilContenedor {
  auth = inject(Auth);
  profileService = inject(Profile);
  toast = inject(ToastrService);
  
  user_data = signal<Userbase | null>(null);
  option = signal<number>(0);
  
  name = computed(() => {
    const user = this.user_data();
    return user ? `${user.nombres} ${user.apellidos}` : '';
  });

  ngOnInit() {
    this.profileService.getUserData().subscribe({
      next: res => {
        console.log('🟢 PADRE: Datos recibidos:', res);
        this.user_data.set(res);
      },
      error: err => {
        this.toast.error("Error", err.error.detail);
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  optionMenu(opt: number) {
    this.option.set(opt);
  }
}