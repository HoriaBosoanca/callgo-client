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
	
	// private apiUrl = 'https://callgo-server-386137910114.europe-west3.run.app'
	// private apiUrl = 'https://horia.live:8443'
	private httpUrl = 'http://localhost:1234'
	private webSocketUrl = 'ws://localhost:1234/ws'

	// http
	createSession(): Promise<any> {
		return lastValueFrom(this.http.post(`${this.httpUrl}/initialize`, { headers: this.getHeaders() }))
	}

	kickSession(sessionID: string, memberID: string, password: string): Promise<any> {
		return lastValueFrom(this.http.post(`${this.httpUrl}/disconnect`, {"sessionID":`${sessionID}`,"memberID":`${memberID}`,"password":`${password}`}, { headers: this.getHeaders() }))
	}

	// websocket
	private webSocket!: WebSocket

	// members cache
	public stableMembers: any[] = []
	
	connect(sessionID: string) {
		console.log(sessionID)

		this.webSocket = new WebSocket(`${this.webSocketUrl}?sessionID=${sessionID}`)
	
		this.webSocket.onopen = (event: Event) => {
			// console.log(this.stableMembers)
			console.log('WebSocket connection established')
		}
	
		this.webSocket.onmessage = (message: MessageEvent) => {
			const data = JSON.parse(message.data)
			if (data.memberID != null) {
				const myID: string = data.memberID
				sessionStorage.setItem("myID", myID)
			} else {
				const findWithSameID = this.stableMembers.find(item => item?.ID == data?.ID)
				if (findWithSameID) {
					findWithSameID.video = data.video
				} else {
					this.stableMembers.push(data)
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