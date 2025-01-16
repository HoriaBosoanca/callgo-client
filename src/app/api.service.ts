import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable, OnInit } from '@angular/core'
import { from, lastValueFrom, Observable } from 'rxjs'
import { Router } from '@angular/router';

interface Member {
	memberID: string
	name: string
	conn: RTCPeerConnection | null
}

@Injectable({
providedIn: 'root'
})
export class ApiService {

	constructor(private http: HttpClient, private router: Router) { }

	// members data
	public stableMembers: Member[] = []

	// private httpUrl = 'https://callgo-server-386137910114.europe-west1.run.app'
	// private webSocketUrl = 'wss://callgo-server-386137910114.europe-west1.run.app/ws'
	private httpUrl = 'http://localhost:8080'
	private webSocketUrl = 'http://localhost:8080/ws'

	// http
	createSession(): Promise<any> {
		return lastValueFrom(this.http.post(`${this.httpUrl}/initialize`, null))
	}

	kickSession(sessionID: string, memberID: string, password: string): Promise<any> {
		return lastValueFrom(this.http.post(`${this.httpUrl}/disconnect`, {
			"sessionID":`${sessionID}`,
			"memberID":`${memberID}`,
			"password":`${password}`
		}))
	}

	// websocket
	private webSocket!: WebSocket

	// stun server
	private config = {iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun2.1.google.com:19302'] }]}

	// callbacks that other classes can define using their context, but apiService calls them
	public initMemberDisplay = (newMember: Member) => {}
	public initMemberCamera = (newMember: Member) => {}

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
					"memberID": data.memberID,
					"conn": null
				})
			} 

			// when being notified about who is already in the meeting (on meeting join)
			if(data.type == "exist") {
				this.stableMembers.push({
					"name": data.memberName,
					"memberID": data.memberID,
					"conn": null
				})
			}

			// when being notified about a new joining member
			if(data.type == "join") {
				// webRTC
				const peerConnection = new RTCPeerConnection(this.config)
				// send ICE
				peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
					console.log(event)
					event.candidate && console.log(event.candidate)
				}
				// send SDP
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
					const peerConnection = new RTCPeerConnection(this.config)
					try {
						const findWithSameID = this.stableMembers.find(member => member?.memberID == data?.from)
						findWithSameID!.conn = peerConnection
						await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
						const answer: RTCSessionDescriptionInit = await peerConnection.createAnswer()
						await peerConnection.setLocalDescription(answer)
						this.sendSDP(answer, data.from, sessionStorage.getItem("myID")!)

						this.initMemberDisplay(findWithSameID!)
						this.initMemberCamera(findWithSameID!)
					} catch(error) {
						console.log(error)
					}
				}
	
				if(data.sdp.type == "answer") {
					try {
						const findWithSameID = this.stableMembers.find(member => member?.memberID == data?.from)
						await findWithSameID!.conn!.setRemoteDescription(new RTCSessionDescription(data.sdp))

						this.initMemberDisplay(findWithSameID!)
						this.initMemberCamera(findWithSameID!)
					} catch(error) {
						console.log(error)
					}
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

	close() {
		if(this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
			this.webSocket.close()
		} else {
			console.error('WebSocket already closed.')
		}
	}

	sendSDP(sdp: RTCSessionDescriptionInit, to: string, from: string) {
		this.webSocket.send(JSON.stringify({
			"to": to,
			"from": from,
			"sdp": sdp
		}))
	}
}