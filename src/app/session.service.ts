import { Injectable, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SessionService implements OnInit {
	constructor(private apiService: ApiService, private router: Router) { }

	ngOnInit(): void {
		if(this.hostID == -1){
			this.router.navigate(['/menu'])
		}
	}

	public camIsOn = false

	public hostID: number = -1
	
	public myID: number = -1
	public displayName: string = "null"

	public videoFrames: string[] = []

	async requestFrames(): Promise<string[]> {
		let members: number[] = await this.getAllIDs(this.hostID)
		if(members == null) {
			members = [this.hostID]
		} else {
			members.push(this.hostID)
		}

		let frames: string[] = []
		for(let id of members) {
			let videoFrame: string = await this.apiService.getVideo(this.hostID, id).toPromise()
			frames.push(videoFrame)
		}
		return frames
	}

	async getAllIDs(hostID: number) {
		let sessionObj = await this.apiService.getSession(hostID).toPromise();
		return sessionObj.members;
	}
}
