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

	public hostID: number = -1
	
	public myID: number = -1
	public displayName: string = "null"

	public videoFrames: string[] = []

	async requestFrames() {
		console.log('Meeting id: ', this.hostID)
		let members: number[] = await this.getAllIDs(this.hostID) 
		console.log('Members', members)

		let frames: number[] = []
		for(let id of members) {
			let videoFrame = await this.apiService.getVideo(this.hostID, id).toPromise()
			frames.push(videoFrame);
		}
		return frames
	}

	async getAllIDs(hostID: number) {
		let sessionObj = await this.apiService.getSession(hostID).toPromise();
		return sessionObj.members;
	}
}
