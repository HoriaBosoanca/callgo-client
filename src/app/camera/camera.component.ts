import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { SessionService } from '../session.service';
import { DisplayComponent } from '../display/display.component';

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
		this.displayImage = document.getElementById('reconstructedFrame') as HTMLImageElement;
	}

  	camIsOn = false;
  	@ViewChild('videoElement') videoElement!: ElementRef;
	canvas!: HTMLCanvasElement;
	displayImage!: HTMLImageElement;

  	// Toggle camera on/off
	async camera(): Promise<void> {
    	try {
			// toggle
			if (this.camIsOn) {
				this.turnOffCamera()
			} else {
				await this.turnOnCamera()
				while(this.camIsOn) {
					await this.send();
					await this.receive();
				}
			}
		} catch (err) {
			console.error('Error accessing the camera', err);
		}
  	}

	turnOffCamera() {
		this.sessionService.camIsOn = false

		this.camIsOn = false;
		this.videoElement.nativeElement.srcObject = null;
		this.displayImage.style.display = "none";
	}

	async turnOnCamera() {
		this.sessionService.camIsOn = true

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
	
	async receive(): Promise<void> {
		try {
			// console.log(this.sessionService.hostID, this.sessionService.myID)
			const frameObj = await this.apiService.getVideo(this.sessionService.hostID, this.sessionService.myID).toPromise();
			this.displayImage.src = frameObj.video
		} catch (error) {
			console.error('Error during video reception:', error);
		}
	}
	
	// sleep(ms: number): Promise<void> {
	// 	return new Promise(resolve => setTimeout(resolve, ms));
	// }
	
	// Capture frame as Base64
	createVideoFrame(): string {
		this.canvas.width = this.videoElement.nativeElement.videoWidth;
		this.canvas.height = this.videoElement.nativeElement.videoHeight;
		const context = this.canvas.getContext('2d');
		context?.drawImage(this.videoElement.nativeElement, 0, 0, this.canvas.width, this.canvas.height);
		return this.canvas.toDataURL('image/jpeg');
	}
}
