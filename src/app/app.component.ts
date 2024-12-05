import { Component, OnChanges, OnInit } from '@angular/core';
import { CameraComponent } from "./camera/camera.component";
import { MenuComponent } from './menu/menu.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Router, CameraComponent, MenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Callgo';
}
