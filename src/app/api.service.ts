import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable, OnInit } from '@angular/core'
import { from, lastValueFrom, Observable } from 'rxjs'
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

	// private httpUrl = 'https://callgo-server-386137910114.europe-west1.run.app'
	// private webSocketUrl = 'wss://callgo-server-386137910114.europe-west1.run.app/ws'
	private httpUrl = 'http://localhost:8080'
	private webSocketUrl = 'http://localhost:8080/ws'

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

	async connect(sessionID: string, displayName: string) {
		console.log(sessionID)

		this.webSocket = new WebSocket(`${this.webSocketUrl}?sessionID=${sessionID}&displayName=${displayName}`)
	
		this.webSocket.onopen = (event: Event) => {
			console.log('WebSocket connection established')
		}
	
		this.webSocket.onmessage = async (message: MessageEvent) => {
			const data = JSON.parse(message.data)
			
			// when being asigned an ID
			if(data.type == "assignID") {
				sessionStorage.setItem("myID", data.memberID)
				this.stableMembers.push({
					"name": data.memberName,
					"memberID": data.memberID
				})
			} 

			// when being notified about who is already in the meeting (on meeting join)
			if(data.type == "exist") {
				this.stableMembers.push({
					"name": data.memberName,
					"memberID": data.memberID
				})
			}

			// when being notified about a new joining member
			if(data.type == "join") {
				// send SDP for webRTC
				const peerConnection = new RTCPeerConnection()
				try {
					await peerConnection.setLocalDescription(await peerConnection.createOffer())
					this.sendSDP(peerConnection.localDescription!, data.memberID, sessionStorage.getItem("myID")!)
				} catch(error) {
					console.log(error)
				}

				this.stableMembers.push({
					"name": data.memberName,
					"memberID": data.memberID,
					"conn": peerConnection
				})
			}

			// on member disconnect notification
			if(data.type == "leave") {
				this.stableMembers = this.stableMembers.filter(member => member.memberID != data.memberID)
			}

			// on received SDP
			if(data.sdp) {
				if(data.sdp.type == "offer") {
					const peerConnection = new RTCPeerConnection()
					try {
						const findWithSameID = this.stableMembers.find(member => member?.memberID == data?.from)
						findWithSameID.conn = peerConnection
						peerConnection.setRemoteDescription(data.sdp)
						await peerConnection.setLocalDescription(await peerConnection.createAnswer())
					} catch(error) {
						console.log(error)
					}
					this.sendSDP(peerConnection.localDescription!, data.from, sessionStorage.getItem("myID")!)
				}
	
				if(data.sdp.type == "answer") {
					try {
						const findWithSameID = this.stableMembers.find(member => member?.memberID == data?.from)
						findWithSameID.conn.setRemoteDescription(data.sdp)
					} catch(error) {
						console.log(error)
					}
				}
			}

			// on video data sent
			// if(data.video != null) {
			// 	const findWithSameID = this.stableMembers.find(member => member?.memberID == data?.memberID)
			// 	if (findWithSameID) {
			// 		findWithSameID.video = data.video
			// 	}
			// }
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

	// sendMessage(name: string, ID: string, video: string) {
	// 	if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
	// 		this.webSocket.send(JSON.stringify({
	// 			"name":`${name}`,
	// 			"ID":`${ID}`,
	// 			"video":`${video}`
	// 		}))
	// 	} else {
	// 		console.error('WebSocket is not open. Unable to send message.')
	// 	}
	// }

	close() {
		if(this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
			this.webSocket.close()
		} else {
			console.error('WebSocket already closed.')
		}
	}

	sendSDP(sdp: RTCSessionDescription, to: string, from: string) {
		this.webSocket.send(JSON.stringify({
			"to": to,
			"from": from,
			"sdp": sdp
		}))
	}
}