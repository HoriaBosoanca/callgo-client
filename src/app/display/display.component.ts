import { Component, OnInit } from '@angular/core';
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
	constructor(private sessionService: SessionService) {}

	async ngOnInit(): Promise<void> {
		console.log(this.sessionService.hostID)
		const timer = setInterval(async () => {
			this.frames = await this.sessionService.requestFrames()
		}, this.sessionService.delay)
	}

	frames: string[] = []
}
