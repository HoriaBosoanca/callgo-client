import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { SessionService } from '../session.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-menu',
	standalone: true,
	imports: [FormsModule],
	templateUrl: './menu.component.html',
	styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
	constructor(private router: Router, private apiService: ApiService, private sessionService: SessionService ) {}
	
	ngOnInit(): void {}
	
	// input
	displayNameCreate: string = ""
	displayNameJoin: string = ""
	meetingID: string = ""
	
	// HTML refs
	@ViewChild('nameInputCreate') nameInputCreate!: ElementRef;
	@ViewChild('nameInputJoin') nameInputJoin!: ElementRef;
	@ViewChild('joinInput') joinInput!: ElementRef;

	async startMeeting() {
		if(this.displayNameCreate != "") {
			this.sessionService.myID = await this.apiService.createSession(this.displayNameCreate).toPromise()
			this.sessionService.hostID = this.sessionService.myID
	
			this.sessionService.displayName = this.displayNameCreate
			this.router.navigate(['/video'])
			
			if(this.sessionService.hostID != 'null') {
				localStorage.setItem('hostID', this.sessionService.hostID)
			}
		} else {
			this.nameInputCreate.nativeElement.style.borderColor = 'red'
			console.log("Empty name")
		}
	}

	
	async joinMeeting() {
		if(this.displayNameJoin != "" && this.meetingID != "") {
			this.sessionService.myID = await this.apiService.joinSession(this.meetingID, this.displayNameJoin).toPromise()
			this.sessionService.hostID = this.meetingID
		} else {
			this.nameInputJoin.nativeElement.style.borderColor = 'red'
			this.joinInput.nativeElement.style.borderColor = 'red'
			throw new Error("Empty name or ID")
		}
		this.sessionService.displayName = this.displayNameJoin
		this.router.navigate(['/video'])
	}
}
