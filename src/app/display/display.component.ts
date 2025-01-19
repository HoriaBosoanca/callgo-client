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
	videoBox!: ElementRef<HTMLVideoElement>

	ngOnInit(): void {
		const timer = setInterval(() => {
			for(let member of this.apiService.stableMembers) {
				if(member.conn) {
					member.conn!.oniceconnectionstatechange = () => {
						console.log(member.conn!.iceConnectionState)
					}
					member.conn!.ontrack = (event) => {
						this.videoBox.nativeElement.replaceChildren()
						const video = document.createElement('video')
						video.srcObject = event.streams[0]
						video.muted = true
						video.play()
						this.videoBox.nativeElement.appendChild(video)
					}
				}
			}
		}, 200) 
	}
}
