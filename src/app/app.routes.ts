import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { CameraComponent } from './camera/camera.component';

export const routes: Routes = [
    { path: 'menu', component: MenuComponent }, 
    { path: 'video', component: CameraComponent },
];
