import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { SessionService } from '../session.service';
import { DisplayComponent } from '../display/display.component';
import { delay } from 'rxjs';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [FormsModule, CommonModule, DisplayComponent],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit {
	constructor(private apiService: ApiService, private sessionService: SessionService) {}

	async ngOnInit() {
		this.canvas = document.createElement('canvas'); // Hidden canvas for capturing video frames
	}

  	camIsOn = false;
  	@ViewChild('videoElement') videoElement!: ElementRef;
	canvas!: HTMLCanvasElement;
	displayImage!: HTMLImageElement;

  	// Toggle camera on/off
	async camera(): Promise<void> {
			// toggle
			if (this.camIsOn) {
				this.turnOffCamera()
			} else {
				await this.turnOnCamera()
				const timer = setInterval(async () => {
					await this.send();
				}, this.sessionService.delay)
			}
  	}

	turnOffCamera() {
		this.camIsOn = false;
		this.videoElement.nativeElement.srcObject = null;
	}

	async turnOnCamera() {
		this.camIsOn = true;
		this.videoElement.nativeElement.style.display = "none"; // don't display the input version of yourself
		const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
		this.videoElement.nativeElement.srcObject = stream;
		this.videoElement.nativeElement.play();
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
	createVideoFrame(): string {
		this.canvas.width = this.videoElement.nativeElement.videoWidth;
		this.canvas.height = this.videoElement.nativeElement.videoHeight;
		const context = this.canvas.getContext('2d');
		context?.drawImage(this.videoElement.nativeElement, 0, 0, this.canvas.width, this.canvas.height);
		return this.canvas.toDataURL('image/jpeg');
	}
}
