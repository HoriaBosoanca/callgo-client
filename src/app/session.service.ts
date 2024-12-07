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
	public hostID: number = -1
	public myID: number = -1
	public displayName: string = "null"

	async getAllIDs(hostID: number): Promise<number[]> {
		let sessionObj = await this.apiService.getSession(hostID).toPromise();
		let members: number[] = sessionObj.members
		if(members == null) {
			members = [this.hostID]
		} else {
			members.push(this.hostID)
		}
		return members;
	}

	// video frame mangement 
	public videoFrames: string[] = []
	
	async requestFrames(): Promise<string[]> {
		let members: number[] = await this.getAllIDs(this.hostID)
		let frames: string[] = []
		for(let id of members) {
			let videoFrame = await this.apiService.getVideo(this.hostID, id).toPromise()
			frames.push(videoFrame.video)
		}
		return frames
	}

}
