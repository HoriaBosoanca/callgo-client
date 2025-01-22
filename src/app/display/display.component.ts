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
		setInterval(() => {
			for(let member of this.apiService.stableMembers) {
				if(member.conn) {
					member.conn.onconnectionstatechange = () => {
						console.log(member.memberID, member.conn!.iceConnectionState)
					}
					if(!this.videos.includes(member.video)) {
						this.addVideo(member.video, member.name)
					}
				}
			}
		}, 200)
	}

	videos: HTMLVideoElement[] = []
	addVideo(video: HTMLVideoElement, memberName: string) {
		video.muted = true
		video.classList.add('video')

		const p = document.createElement('p')
		p.innerHTML = memberName
		p.style.color = 'white'
		p.style.fontSize = '3vh'
		p.style.position = 'absolute'
		p.style.top = '45%'
		p.style.left = '50%'

		const div = document.createElement('div')
		div.style.height = '40vh'
		div.style.display = 'flex'
		div.style.position = 'relative'
		div.appendChild(video)
		div.appendChild(p)

		this.videoBox.nativeElement.appendChild(div)

		this.videos.push(video)
	}
}
