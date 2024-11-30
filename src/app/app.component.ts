import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CameraComponent } from "./camera/camera.component";
import { MenuComponent } from './menu/menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CameraComponent, MenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Callgo';
}
