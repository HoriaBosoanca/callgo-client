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

	async getAllIDs(hostID: string): Promise<number[]> {
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

	// video frame mangement 
	async requestFrames(): Promise<string[]> {
		let members: any[] = await this.getAllIDs(this.hostID)
		let frames: string[] = []
		for(let member of members) {
			let videoFrame = await this.apiService.getVideo(this.hostID, member.ID).toPromise()
			frames.push(videoFrame.video)
		}
		return frames
	}

}
