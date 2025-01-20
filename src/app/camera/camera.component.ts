import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { DisplayComponent } from '../display/display.component';
import { ListComponent } from '../list/list.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [FormsModule, CommonModule, DisplayComponent, ListComponent],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit {
	constructor(private apiService: ApiService, private router: Router) {}

	async ngOnInit() {
		
		await this.apiService.connect(sessionStorage.getItem("sessionID")!, sessionStorage.getItem("myName")!)
		this.videoElement.srcObject = this.apiService.localStream
		await this.videoElement.play()
		this.videoBox.nativeElement.appendChild(this.videoElement)

		this.router.events
      		.pipe(filter(event => event instanceof NavigationEnd))
      		.subscribe((event: NavigationEnd) => {
				if (!event.urlAfterRedirects.includes('video')) {
					this.turnOffCamera()
				}
      		})
	}

	@ViewChild('videoBox')
	videoBox!: ElementRef<HTMLVideoElement> 

	videoElement: HTMLVideoElement = document.createElement('video')
	
	// Toggle camera on/off
	camIsOn = true
	async camera(): Promise<void> {
		// toggle
		if (this.camIsOn) {
			this.turnOffCamera()
		} else {
			await this.turnOnCamera()
		}
	}
	
	turnOffCamera() {
		this.camIsOn = false
		this.apiService.localStream.getTracks().forEach((track) => {
			track.enabled = false
		})
	}
	
	async turnOnCamera() {
		this.camIsOn = true
		this.apiService.localStream.getTracks().forEach((track) => {
			track.enabled = true
		})
		await this.videoElement.play()
	}

	listIsDisplayed = false
	toggleList() {
		this.listIsDisplayed = !this.listIsDisplayed
		document.getElementById('dropdown')!.classList.toggle('show')
	}
}
