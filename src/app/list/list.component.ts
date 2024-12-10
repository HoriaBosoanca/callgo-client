import { Component, OnInit } from '@angular/core';
import { SessionService } from '../session.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list',
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent implements OnInit {
	constructor(private sessionService: SessionService) {}

	// wait 1 second before fetching ids
	ngOnInit(): void {
		const timer = setInterval(() => {
			this.stableIDs = this.sessionService.stableIDs
			clearInterval(timer)
		}, 1000)
	}

	stableIDs: number[] = []
}
