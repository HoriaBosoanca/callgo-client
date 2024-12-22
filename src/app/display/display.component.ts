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

	framesAndNames: any[] = []
	async ngOnInit(): Promise<void> {
		const timer = setInterval(async () => {
			let oldAmountOfMembers = this.framesAndNames.length
			this.framesAndNames = await this.sessionService.requestFramesAndNames()
			if(oldAmountOfMembers != this.framesAndNames.length) {
				this.resetImages(this.framesAndNames.length)
			}

			if(!this.correctImagesGenerated) {
				this.resetImages(this.framesAndNames.length)
			}

			for(let i = 0; i < this.images.length; ++i) {
				this.images[i].src = this.framesAndNames[i].video
				console.log(this.framesAndNames[i].name)
				if(this.images[i].src == 'data:,') {
					this.images[i].src = '../../assets/images/black.png'
				}
			}
			
		}, this.sessionService.delay)
	}
	
	correctImagesGenerated: boolean = false
	images: HTMLImageElement[] = []
	names: HTMLParagraphElement[] = []
	resetImages(amountOfMembers: number) {
		for(let image of this.images){
			image.remove()
		}
		this.images = []
		for(let i = 0; i < amountOfMembers; ++i) {

			const img: HTMLImageElement = document.createElement('img')
			this.applyStyles(img)
			// const name: HTMLParagraphElement = document.createElement('p')
			// name.innerHTML = 
			
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
		
		if(this.framesAndNames.length <= this.maxParticipantsPerRow) {
			// there is ony 1 row
			img.style.width = `${100 / this.framesAndNames.length}%`
			img.style.maxHeight = '100%'
		} else {
			// there are multiple rows
			img.style.width = `${100 / this.maxParticipantsPerRow}%`
			const amountOfRows = this.framesAndNames.length / this.maxParticipantsPerRow
			img.style.maxHeight = `${100 / amountOfRows}%`
		}

		img.style.objectFit = 'contain'
		img.style.borderRadius = '1vh'
	}
}
