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
	camIsOn = false;
	async camera(): Promise<void> {
		// toggle
		if (this.camIsOn) {
			this.turnOffCamera()
		} else {
			await this.turnOnCamera()
		}
	}

	localStream: MediaStream = new MediaStream()
	
	turnOffCamera() {
		this.camIsOn = false;
		this.videoElement.srcObject = null;
	}
	
	async turnOnCamera() {
		this.camIsOn = true;
		
		this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
		for(let member of this.apiService.stableMembers) {
			if(member.conn) {
				for(let track of this.localStream.getTracks()) {
					member.conn.addTrack(track, this.localStream)
					console.log(sessionStorage.getItem('myID'), "sent a track to", member.memberID)
				}
			}
		} 
		this.videoElement.play()
	}

	listIsDisplayed = false
	toggleList() {
		this.listIsDisplayed = !this.listIsDisplayed
		document.getElementById('dropdown')!.classList.toggle('show')
	}
}
