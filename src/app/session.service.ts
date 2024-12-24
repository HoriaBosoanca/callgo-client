import { Injectable, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
	constructor(private apiService: ApiService, private router: Router) { }

	// constants
	public delay: number = 100 

	// session management
	public hostID: string = "null"
	public hostDisplayName: string = "null"
	public myID: string = "null"
	public displayName: string = "null"

	public stableMembers: any[] = []

	// === video data ===
	async getAllMembers(hostID: string): Promise<number[]> {
		let sessionObj = await this.apiService.getSession(hostID).toPromise();
		this.hostDisplayName = sessionObj.host.name
		let members: any[] = sessionObj.members
		if(members == null) {
			members = [{"name":this.hostDisplayName, "ID":this.hostID}]
		} else {
			members.push({"name":this.hostDisplayName, "ID":this.hostID})
		}

		if(members != this.stableMembers) {
			this.stableMembers = members
		}

		return members;
	}

	async requestFramesAndNames(): Promise<string[]> {
		// if page was just refreshed, retrieve saved host ID and my ID
		if(this.hostID == 'null' && sessionStorage.getItem('hostID') != null && sessionStorage.getItem('myID') != null) {
			this.hostID = sessionStorage.getItem('hostID')!
			this.myID = sessionStorage.getItem('myID')!
		}
		let members: any[] = await this.getAllMembers(this.hostID)
		let framesAndNames: any[] = []
		for(let member of members) {
			let videoFrame = await this.apiService.getVideo(this.hostID, member.ID).toPromise()
			framesAndNames.push({
				"video": videoFrame.video,
				"name": member.name
			})
		}
		return framesAndNames
	}

	// === join / create ===
	async startMeeting(displayName: string) {
		this.myID = await this.apiService.createSession(displayName).toPromise()
		this.hostID = this.myID

		this.displayName = this.displayName
		this.router.navigate(['/video'])
		// persistently store host ID and my ID
		sessionStorage.setItem('hostID', this.hostID)
		sessionStorage.setItem('myID', this.myID)
	}

	async joinMeeting(meetingID: string, displayName: string) {
		this.myID = await this.apiService.joinSession(meetingID, displayName).toPromise()
		this.hostID = meetingID
		// persistently store host ID and my ID
		sessionStorage.setItem('hostID', this.hostID)
		sessionStorage.setItem('myID', this.myID)
	}

	// === leave / kick ===
	async leaveMeeting(memberID: string) {
		// this should be done on the server but whatever (i don't want to add a third urlParam and hide IDs from members)
		if(this.myID == this.hostID) {
			await this.apiService.leaveSession(this.hostID, memberID).toPromise()
		}
		// kicking someone else would redirect yourself
		// this.router.navigate(['/menu'])
	}
}
