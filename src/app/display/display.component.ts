import { Component, OnInit } from '@angular/core';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [],
  templateUrl: './display.component.html',
  styleUrl: './display.component.css'
})
export class DisplayComponent implements OnInit {
	constructor(private sessionService: SessionService) {}

	async ngOnInit(): Promise<void> {
		console.log('Frames', await this.sessionService.requestFrames())
		while(true) {
			let frames: string[] = await this.sessionService.requestFrames()
		}
	}
}
