import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-menu',
	standalone: true,
	imports: [FormsModule],
	templateUrl: './menu.component.html',
	styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
	constructor(private router: Router, private apiService: ApiService) {}
	
	async ngOnInit(): Promise<void> {
		await this.apiService.askForStream();
	}
	
	// input
	displayNameCreate: string = ""
	displayNameJoin: string = ""
	meetingID: string = ""
	
	// HTML refs
	@ViewChild('nameInputCreate')
	nameInputCreate!: ElementRef;
	
	@ViewChild('nameInputJoin') 
	nameInputJoin!: ElementRef;
	
	@ViewChild('joinInput') 
	joinInput!: ElementRef;

	async startMeeting() {
		if(this.displayNameCreate != "") {
			const obj: any = await this.apiService.createSession()
			const sessionID = obj.sessionID
			const password = obj.password
			sessionStorage.setItem('sessionID', sessionID)
			sessionStorage.setItem('password', password)
			sessionStorage.setItem("myName", this.displayNameCreate)
			this.router.navigate(['/video'])
		} else {
			this.nameInputCreate.nativeElement.style.borderColor = 'red'
			console.log("Empty name")
		}
	}
	
	joinMeeting() {
		if(this.displayNameJoin != "" && this.meetingID != "") {
			sessionStorage.setItem('sessionID', this.meetingID)
			sessionStorage.setItem("myName", this.displayNameJoin)
			this.router.navigate(['/video'])
		} else {
			this.nameInputJoin.nativeElement.style.borderColor = 'red'
			this.joinInput.nativeElement.style.borderColor = 'red'
			throw new Error("Empty name or ID")
		}
	}
}
