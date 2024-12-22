import { Component, ElementRef, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { SessionService } from '../session.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display.component.html',
  styleUrl: './display.component.css'
})
export class DisplayComponent implements OnInit {
	constructor(private sessionService: SessionService, private renderer: Renderer2) {}

	@ViewChild('videoBox') videoBox!: ElementRef

	async ngOnInit(): Promise<void> {
		const timer = setInterval(async () => {
			let oldAmountOfMembers = this.frames.length
			this.frames = await this.sessionService.requestFrames()
			if(oldAmountOfMembers != this.frames.length) {
				this.resetImages(this.frames.length)
			}

			if(!this.correctImagesGenerated) {
				this.resetImages(this.frames.length)
			}

			for(let i = 0; i < this.images.length; ++i) {
				this.images[i].src = this.frames[i]
				if(this.images[i].src == 'data:,') {
					this.images[i].src = '../../assets/images/black.png'
				}
			}
			
		}, this.sessionService.delay)
	}
	
	frames: string[] = []
	
	correctImagesGenerated: boolean = false
	images: HTMLImageElement[] = []
	resetImages(amountOfMembers: number) {
		for(let image of this.images){
			image.remove()
		}
		this.images = []
		for(let i = 0; i < amountOfMembers; ++i) {

			let img: HTMLImageElement = document.createElement('img')

			this.applyStyles(img)
			
			this.videoBox.nativeElement.appendChild(img)
			this.images.push(img)
			this.correctImagesGenerated = true
		}
	}
	
	maxParticipantsPerRow: number = 4
	applyStyles(img: HTMLImageElement) {
		img.style.margin = 'auto'
		img.alt = ''
		img.style.borderWidth = '1rem'
		
		if(this.frames.length <= this.maxParticipantsPerRow) {
			// there is ony 1 row
			img.style.width = `${100 / this.frames.length}%`
			img.style.maxHeight = '100%'
		} else {
			// there are multiple rows
			img.style.width = `${100 / this.maxParticipantsPerRow}%`
			const amountOfRows = this.frames.length / this.maxParticipantsPerRow
			img.style.maxHeight = `${100 / amountOfRows}%`
		}

		img.style.objectFit = 'contain'
		img.style.borderRadius = '1vh'
	}
}
