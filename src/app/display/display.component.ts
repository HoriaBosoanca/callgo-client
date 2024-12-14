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
			let img = document.createElement('img')

			// Styles
			img.style.margin = 'auto'
			img.alt = ''
			img.style.borderRadius = '1vh'
			img.style.borderWidth = '1rem'
			img.style.width = `${100 / this.frames.length}%`
			
			this.videoBox.nativeElement.appendChild(img)
			this.images.push(img)
			// this.videoBox.nativeElement.innerHTML = ''
			this.correctImagesGenerated = true
		}
	}
}
