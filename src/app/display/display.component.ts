import { Component, ElementRef, OnInit, ViewChild, Renderer2 } from '@angular/core'
import { SessionService } from '../session.service'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display.component.html',
  styleUrl: './display.component.css'
})
export class DisplayComponent implements OnInit {
	constructor(private sessionService: SessionService) {}

	@ViewChild('videoBox') videoBox!: ElementRef

	framesAndNames: any[] = []
	async ngOnInit(): Promise<void> {
		const timer = setInterval(async () => {
			let oldAmountOfMembers = this.framesAndNames.length;
			this.framesAndNames = await this.sessionService.requestFramesAndNames();
	
			// Reset images only if the number of members changes
			if (oldAmountOfMembers !== this.framesAndNames.length) {
				this.resetImages(this.framesAndNames.length);
			}
	
			for (let i = 0; i < this.images.length; ++i) {
				const frame = this.framesAndNames[i];
				const img = this.images[i];
				const name = this.names[i];

				img.src = frame.video;
				if (img.src == 'data:,' || img.src == '../../assets/images/black.png') {
					img.src = '../../assets/images/black.png'
					name.style.top = '50%'
					name.style.fontWeight = 'bold'
				} else {
					name.style.top = '90%'
					name.style.fontWeight = 'normal'
				}
				name.innerHTML = frame.name || 'Unknown';
			}
		}, this.sessionService.delay);
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
			const participantCount = this.framesAndNames.length
			const widthPercent = 100 / Math.min(participantCount, maxParticipantsPerRow) - 1
			
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
			name.style.fontSize = '1.5rem'
	
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
