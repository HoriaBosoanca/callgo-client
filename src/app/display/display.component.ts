import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ApiService } from '../api.service'

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display.component.html',
  styleUrl: './display.component.css'
})
export class DisplayComponent implements OnInit {
	constructor(public apiService: ApiService) {}

	@ViewChild('videoBox') 
	videoBox!: ElementRef
	
	videos: HTMLVideoElement[] = []
	names: HTMLParagraphElement[] = []

	ngOnInit(): void {
		this.apiService.initMemberDisplay = (member) => {
			member.conn!.ontrack = (event) => {
				const mediaStream = new MediaStream()
				mediaStream.addTrack(event.track)
				const videoElement: HTMLVideoElement = document.createElement('video')
				videoElement.srcObject = mediaStream
				this.videos.push(videoElement)

				const pElement: HTMLParagraphElement = document.createElement('p')
				pElement.innerHTML = member.name
				this.names.push(pElement) 
				
				this.videoBox.nativeElement.appendChild(videoElement)
				videoElement.play()
			}
		}
	}
}
