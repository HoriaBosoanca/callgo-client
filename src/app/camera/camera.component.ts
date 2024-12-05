import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit {
	constructor(private apiService: ApiService, private sessionService: SessionService) {}

	async ngOnInit() {
		console.log(await this.apiService.getSession(this.sessionService.hostID).toPromise())

		this.canvas = document.createElement('canvas'); // Hidden canvas for capturing video frames
		this.displayImage = document.getElementById('reconstructedFrame') as HTMLImageElement;
	}

  	camIsOn = false;
  	videoElement!: HTMLVideoElement;
	canvas!: HTMLCanvasElement;
	displayImage!: HTMLImageElement;

	delay: number = 20

  	// Toggle camera on/off
	async camera(videoElement: HTMLVideoElement): Promise<void> {
    	this.videoElement = videoElement;

    	try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

			if (this.camIsOn) {
				// Turn off
				this.camIsOn = false;
				this.videoElement.srcObject = null;
				this.displayImage.style.display = "none";
			} else {
				// Turn on
				this.camIsOn = true;
				this.displayImage.style.display = "block";
				this.videoElement.srcObject = stream;
				this.videoElement.play();
				while(this.camIsOn) {
					await this.send(stream);
					await this.receive();
					await this.sleep(this.delay);
				}
			}
		} catch (err) {
			console.error('Error accessing the camera', err);
		}
  	}

	// Start capturing and sending video data
	async send(stream: MediaStream): Promise<void> {
		// Capture current frame as a base64 string
		this.canvas.width = this.videoElement.videoWidth;
		this.canvas.height = this.videoElement.videoHeight;
		const context = this.canvas.getContext('2d');
		context?.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);

		const frame = this.canvas.toDataURL('image/jpeg'); // Capture frame as Base64

		try {
			// console.log(this.sessionService.hostID, this.sessionService.myID)
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

	sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}



