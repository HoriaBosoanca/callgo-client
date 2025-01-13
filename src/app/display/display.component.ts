import { Component, ElementRef, OnInit, ViewChild, Renderer2 } from '@angular/core'
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
	constructor(private apiService: ApiService) {}

	@ViewChild('videoBox') 
	videoBox!: ElementRef

	private oldAmountOfMembers = 0
	
	async ngOnInit(): Promise<void> {
		const timer = setInterval(async () => {
			// stop if someone leaves meeting
			if(!window.location.href.includes('video')) {
				clearInterval(timer)
			}

			// Reset images only if the number of members changes
			if (this.oldAmountOfMembers !== this.apiService.stableMembers.length) {
				this.resetImages(this.apiService.stableMembers.length);
			}

			this.oldAmountOfMembers = this.apiService.stableMembers.length
	
			for (let i = 0; i < this.images.length; ++i) {
				const videoDataTransfer = this.apiService.stableMembers[i];
				const img = this.images[i];
				const name = this.names[i];

				// img.src = videoDataTransfer.video;
				if (img.src.length < 50 || img.src == 'assets/images/black.png') {
					img.src = 'assets/images/black.png'
					name.style.top = '50%'
					name.style.fontWeight = 'bold'
				} else {
					name.style.top = '90%'
					name.style.fontWeight = 'normal'
				}
				name.innerHTML = videoDataTransfer.name || 'Unknown';
			}
		}, this.apiService.delay);
	}
	
	correctImagesGenerated: boolean = false
	images: HTMLImageElement[] = []
	names: HTMLParagraphElement[] = []
	resetImages(amountOfMembers: number) {
		// Clear existing elements
		this.videoBox.nativeElement.innerHTML = '' // Clear all child elements
		this.images = []
		this.names = []
	
		// Create new elements
		for (let i = 0; i < amountOfMembers; ++i) {
			// values
			const maxParticipantsPerRow = 4
			const widthPercent = 100 / Math.min(amountOfMembers, maxParticipantsPerRow) - 1
			
			// Create div
			const div: HTMLDivElement = document.createElement('div')
			div.style.width = `${widthPercent}%`
			div.style.position = 'relative'
			div.style.display = 'flex'
			div.style.maxWidth = '50%'
			div.style.margin = 'auto'
			
			// Create image
			const img: HTMLImageElement = document.createElement('img')
			img.alt = ''
			img.style.margin = 'auto'
			img.style.borderWidth = '1rem'
			img.style.width = '100%'
			img.style.objectFit = 'contain'
			img.style.borderRadius = '1vh'
	
			// Create name overlay
			const name: HTMLParagraphElement = document.createElement('p')
			name.style.top = '50%'
			name.style.position = 'absolute'
			name.style.left = '50%'
			name.style.transform = 'translate(-50%, -50%)'
			name.style.color = 'white'
			name.style.fontSize = '1.5vh'
	
			// Append elements
			div.appendChild(img)
			div.appendChild(name)
			this.videoBox.nativeElement.appendChild(div)
	
			this.images.push(img)
			this.names.push(name)
			this.correctImagesGenerated = true
		}
	}	
}
