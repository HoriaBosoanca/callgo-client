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
	displayName: string = ""
	meetingID: number = -1
	
	// HTML refs
	@ViewChild('nameInput') nameInput!: ElementRef;
	@ViewChild('joinInput') joinInput!: ElementRef;

	async startMeeting() {
		if(this.displayName != "") {
			this.sessionService.myID = await this.apiService.createSession().toPromise()
			this.sessionService.hostID = this.sessionService.myID
	
			this.sessionService.displayName = this.displayName
			this.router.navigate(['/video'])
		} else {
			this.nameInput.nativeElement.style.borderColor = 'red'
			console.log("Empty name")
		}
	}

	
	async joinMeeting() {
		try {
			if(this.displayName != "") {
				this.sessionService.myID = await this.apiService.joinSession(this.meetingID).toPromise()
				this.sessionService.hostID = this.meetingID
			} else {
				this.nameInput.nativeElement.style.borderColor = 'red'
				console.log("Empty name")
			}
		} catch(err) {
			this.joinInput.nativeElement.style.borderColor = 'red'
			throw err
		}

		this.sessionService.displayName = this.displayName
		this.router.navigate(['/video'])
	}
}
