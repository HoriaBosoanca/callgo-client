import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { lastValueFrom, Observable } from 'rxjs'
import { Router } from '@angular/router';

@Injectable({
providedIn: 'root'
})
export class ApiService {

	constructor(private http: HttpClient, private router: Router) { }

	private getHeaders(): HttpHeaders {
		return new HttpHeaders({
		'Content-Type': 'application/json'
		})
	}

	// constants
	public delay: number = 25

	// === join / create ===
	async startMeeting() {
		const obj: any = await this.createSession()
		const sessionID = obj.sessionID
		const password = obj.password
		sessionStorage.setItem('sessionID', sessionID)
		sessionStorage.setItem('password', password)
	}
	
	// 'https://callgo-server-386137910114.europe-west3.run.app'
	private httpUrl = 'http://localhost:4321'
	private webSocketUrl = 'ws://localhost:4321/ws'

	// http
	createSession(): Promise<any> {
		return lastValueFrom(this.http.post(`${this.httpUrl}/initialize`, { headers: this.getHeaders() }))
	}

	kickSession(sessionID: string, memberID: string, password: string): Promise<any> {
		return lastValueFrom(this.http.post(`${this.httpUrl}/disconnect`, {
			"sessionID":`${sessionID}`,
			"memberID":`${memberID}`,
			"password":`${password}`
		}, { headers: this.getHeaders() }))
	}

	// websocket
	private webSocket!: WebSocket

	// members cache
	public stableMembers: any[] = []
	
	connect(sessionID: string, displayName: string) {
		console.log(sessionID)

		this.webSocket = new WebSocket(`${this.webSocketUrl}?sessionID=${sessionID}&displayName=${displayName}`)
	
		this.webSocket.onopen = (event: Event) => {
			// console.log(this.stableMembers)
			console.log('WebSocket connection established')
		}
	
		this.webSocket.onmessage = (message: MessageEvent) => {
			const data = JSON.parse(message.data)
			
			// on member join (self) notification
			if(data.myID != null) {
				sessionStorage.setItem("myID", data.myID)
			} 

			// on member join (broadcast) notification
			if(data.InitID != null) {
				const findWithSameID = this.stableMembers.find(item => item?.memberID == data?.InitID)
				// if member not already in meeting, push it's data
				if(!findWithSameID) {
					this.stableMembers.push({
						"name": data.InitName,
						"memberID": data.InitID
					})
				}
			}

			// on member disconnect notification
			if(data.disconnectID != null) {
				this.stableMembers = this.stableMembers.filter(item => item.memberID != data.disconnectID)
			}

			// on video data sent
			if(data.video != null) {
				const findWithSameID = this.stableMembers.find(item => item?.memberID == data?.memberID)
				if (findWithSameID) {
					findWithSameID.video = data.video
				}
			}
		}
	
		this.webSocket.onclose = () => {
			console.log('WebSocket connection closed')
			this.stableMembers = []
			this.router.navigate(['/menu'])
		}
	
		this.webSocket.onerror = (error) => {
			console.error('WebSocket error:', error)
		}
	}	

	sendMessage(name: string, ID: string, video: string) {
		if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
			this.webSocket.send(JSON.stringify({
				"name":`${name}`,
				"ID":`${ID}`,
				"video":`${video}`
			}))
		} else {
			console.error('WebSocket is not open. Unable to send message.')
		}
	}

	close() {
		if(this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
			this.webSocket.close()
		} else {
			console.error('WebSocket already closed.')
		}
	}
}