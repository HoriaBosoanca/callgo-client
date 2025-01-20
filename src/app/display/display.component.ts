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
				this.videoBox.nativeElement.appendChild(member.video)
			}
		}
	}
}
