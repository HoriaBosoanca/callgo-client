import { Component, OnInit } from '@angular/core';
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

		this.router.events
      		.pipe(filter(event => event instanceof NavigationEnd))
      		.subscribe((event: NavigationEnd) => {
				if (!event.urlAfterRedirects.includes('video')) {
					this.turnOffCamera()
					if(this.timer) {
						window.clearInterval(this.timer)
					}
				}
      		})

		this.apiService.onNewPeer = (member) => {
			if(member.conn && this.mediaStream) {
				for(let track of this.mediaStream.getTracks()) {
					member.conn.addTrack(track, this.mediaStream)
				}
			}
		}
	}

	videoElement: HTMLVideoElement = document.createElement('video')
	
	// Toggle camera on/off
	camIsOn = false;
	async camera(): Promise<void> {
		// toggle
		if (this.camIsOn) {
			this.turnOffCamera()
		} else {
			await this.turnOnCamera()
		}
	}

	timer: number | undefined = undefined
	
	turnOffCamera() {
		this.camIsOn = false;
		this.videoElement.srcObject = null;
	}

	mediaStream: MediaStream| undefined = undefined
	
	async turnOnCamera() {
		this.camIsOn = true;
		
		const mediaStream: MediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
		this.videoElement.srcObject = mediaStream
		this.videoElement.play()
	}

	listIsDisplayed = false
	toggleList() {
		this.listIsDisplayed = !this.listIsDisplayed
		document.getElementById('dropdown')!.classList.toggle('show')
	}
}
