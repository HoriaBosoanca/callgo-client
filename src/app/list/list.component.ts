import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-list',
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {

	constructor(public apiService: ApiService) {}

	meetingCode = sessionStorage.getItem("sessionID")

	async kickMember(memberID: string) {
		if(sessionStorage.getItem("password")) {
			await this.apiService.kickSession(sessionStorage.getItem("sessionID")!, memberID, sessionStorage.getItem("password")!)
		} else {
			console.error("You are not the meeting host.")
		}
	}
}
