import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { LucideAngularModule, Home, Newspaper, FileText, LogOut, Users, LayoutDashboard } from 'lucide-angular';
import "cally"
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
