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

	amountOfMembers: number = 0

	ngOnInit(): void {
		setInterval(() => {
			if(this.amountOfMembers != this.apiService.stableMembers.length) {
				this.resetVideos()
			}

			this.amountOfMembers = this.apiService.stableMembers.length

			for(let member of this.apiService.stableMembers) {
				if(member.conn) {
					member.conn.onconnectionstatechange = () => {
						console.log(member.memberID, member.conn!.iceConnectionState)
					}
				}
			}
		}, 200)
	}

	resetVideos() {
		this.videoBox.nativeElement.replaceChildren()
		for(let member of this.apiService.stableMembers) {
			if(member.conn) {
				member.video.muted = true
				member.video.classList.add('video')

				const p = document.createElement('p')
				p.innerHTML = member.name
				p.style.color = 'white'
				p.style.fontSize = '3vh'
				p.style.position = 'absolute'
				p.style.top = '45%'
				p.style.left = '50%'

				const div = document.createElement('div')
				div.style.height = '40vh'
				div.style.display = 'flex'
				div.style.position = 'relative'
				div.appendChild(member.video)
				div.appendChild(p)

				this.videoBox.nativeElement.appendChild(div)
			}
		}
	}
}
