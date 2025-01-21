import { Component, ElementRef, OnInit, viewChild, ViewChild } from '@angular/core';
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

		if(this.apiService.localStream == null) {
			this.apiService.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
		}
		
		await this.apiService.connect(sessionStorage.getItem("sessionID")!, sessionStorage.getItem("myName")!)
		this.videoElement.srcObject = this.apiService.localStream
		this.videoElement.muted = true
		this.videoElement.classList.add('video')
		await this.videoElement.play()

		
		const p = document.createElement('p')
		p.innerHTML = sessionStorage.getItem('myName')!
		p.style.color = 'white'
		p.style.fontSize = '3vh'
		p.style.position = 'absolute'
		p.style.top = '45%'
		p.style.left = '50%'

		const div = document.createElement('div')
		div.style.height = '40vh'
		div.style.display = 'flex'
		div.style.position = 'relative'
		div.appendChild(this.videoElement)
		div.appendChild(p)

		this.videoBox.nativeElement.appendChild(div)

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
	
	@ViewChild('cameraButton')
	cameraButton!: ElementRef<HTMLButtonElement>

	// Toggle camera on/off
	camIsOn = true
	async toggleCamera(): Promise<void> {
		// toggle
		if (this.camIsOn) {
			this.turnOffCamera()
		} else {
			await this.turnOnCamera()
		}
	}
	
	turnOffCamera() {
		this.camIsOn = false
		this.cameraButton.nativeElement.style.backgroundColor = 'rgb(156, 38, 38)'
		this.apiService.localStream!.getTracks().forEach((track) => {
			track.enabled = false
		})
	}
	
	async turnOnCamera() {
		this.camIsOn = true
		this.cameraButton.nativeElement.style.backgroundColor = 'rgb(85, 156, 38)'
		this.apiService.localStream!.getTracks().forEach((track) => {
			track.enabled = true
		})
		await this.videoElement.play()
	}

	@ViewChild('microphoneButton')
	microphoneButton!: ElementRef<HTMLButtonElement>

	micIsOn = true
	toggleMicrophone() {
		if(this.micIsOn) {
			this.turnOffMicrophone()
		} else {
			this.turnOnMicrophone()
		}
	}

	turnOffMicrophone() {
		this.micIsOn = false
		this.microphoneButton.nativeElement.style.backgroundColor = 'rgb(156, 38, 38)'
	}

	turnOnMicrophone() {
		this.micIsOn = true
		this.microphoneButton.nativeElement.style.backgroundColor = 'rgb(85, 156, 38)'
	}

	@ViewChild('audioButton')
	audioButton!: ElementRef<HTMLButtonElement>

	audioIsOn = false
	toggleAudio() {
		if(this.audioIsOn) {
			this.turnOffAudio()
		} else {
			this.turnOnAudio()
		}
	}

	turnOffAudio() {
		this.audioIsOn = false
		this.audioButton.nativeElement.style.backgroundColor = 'rgb(156, 38, 38)'
	}

	turnOnAudio() {
		this.audioIsOn = true
		this.audioButton.nativeElement.style.backgroundColor = 'rgb(85, 156, 38)'
	}

	listIsDisplayed = false
	toggleList() {
		this.listIsDisplayed = !this.listIsDisplayed
		document.getElementById('dropdown')!.classList.toggle('show')
	}
}
