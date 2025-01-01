import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list',
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {
	constructor() {}

	async kickMember(memberID: string) {
		// await this.sessionService.leaveMeeting(memberID)
	}
}
