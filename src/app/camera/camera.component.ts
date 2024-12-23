import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { SessionService } from '../session.service';
import { DisplayComponent } from '../display/display.component';
import { ListComponent } from '../list/list.component';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [FormsModule, CommonModule, DisplayComponent, ListComponent],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit {
	constructor(private apiService: ApiService, private sessionService: SessionService) {}

	async ngOnInit() {
		const timer = setInterval(async () => {
			await this.send();
		}, this.sessionService.delay)
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
	
	turnOffCamera() {
		this.camIsOn = false;
		this.videoElement.srcObject = null;
	}
	
	async turnOnCamera() {
		this.camIsOn = true;
		this.videoElement.srcObject = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
		this.videoElement.play();
	}
	
	// Start capturing and sending video data
	async send(): Promise<void> {
		try {
			const frame = this.createVideoFrame()
			await this.apiService.postVideo(frame, this.sessionService.hostID, this.sessionService.myID).toPromise();
		} catch (error) {
			console.error('Error uploading video chunk:', error);
		}
	}

	// Capture frame as Base64
	canvas: HTMLCanvasElement = document.createElement('canvas');
	createVideoFrame(): string {
		this.canvas.width = this.videoElement.videoWidth;
		this.canvas.height = this.videoElement.videoHeight;
		const context = this.canvas.getContext('2d');
		context?.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height)
		return this.canvas.toDataURL('image/jpeg');
	}

	listIsDisplayed = false
	toggleList() {
		this.listIsDisplayed = !this.listIsDisplayed
	}
}
