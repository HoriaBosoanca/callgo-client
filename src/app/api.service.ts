import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable, OnInit } from '@angular/core'
import { from, lastValueFrom, Observable } from 'rxjs'
import { Router } from '@angular/router';

interface Member {
	memberID: string
	name: string
	conn: RTCPeerConnection | null
	video: HTMLVideoElement
}

@Injectable({
providedIn: 'root'
})
export class ApiService {

	constructor(private http: HttpClient, private router: Router) { }

	async askForStream() {
		this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
	}

	// members data
	public stableMembers: Member[] = []

	private httpUrl = 'https://callgo-server-386137910114.europe-west1.run.app'
	private webSocketUrl = 'wss://callgo-server-386137910114.europe-west1.run.app/ws'
	// private httpUrl = 'http://localhost:8080'
	// private webSocketUrl = 'http://localhost:8080/ws'

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
	private config = {
		iceServers: [
			{
				urls: 'stun:openrelay.metered.ca:80'
			},
			{
				urls: 'turn:openrelay.metered.ca:80',
				username: 'openrelayproject',
				credential: "openrelayproject"
			}
		]
	}

	// local stream
	localStream: MediaStream | null = null 
	
	async connect(sessionID: string, displayName: string) {
		console.log(sessionID)

		this.webSocket = new WebSocket(`${this.webSocketUrl}?sessionID=${sessionID}&displayName=${displayName}`)
	
		this.webSocket.onopen = (event) => {
			console.log('WebSocket connection established')
		}
	
		this.webSocket.onmessage = async (message: MessageEvent) => {
			const data = JSON.parse(message.data)
			
			switch(data.type) {

				case 'assignID':
					sessionStorage.setItem("myID", data.memberID)
					this.stableMembers.push({
						"name": data.memberName,
						"memberID": data.memberID,
						"conn": null,
						"video": document.createElement('video')
					})
					break

				case 'exist':
					this.stableMembers.push({
						"name": data.memberName,
						"memberID": data.memberID,
						"conn": null,
						"video": document.createElement('video')
					})
					break

				case 'join':
					// webRTC
					const peerConnection = new RTCPeerConnection(this.config)
					const video = document.createElement('video')
					// logging
					peerConnection.onconnectionstatechange = () => {
						console.log(data.memberID, peerConnection.iceConnectionState)
					}
					// ontrack
					peerConnection.ontrack = async (event) => {
						try {
							video.srcObject = event.streams[0]
							await video.play()
						} catch(error) {
							console.log(error)
						}
					}
					// send tracks
					for(let track of this.localStream!.getTracks()) {
						peerConnection.addTrack(track, this.localStream!)
					}
					try {
						// send ICE
						// peerConnection.onicecandidate = ({candidate}) => {
						// 	if(candidate && candidate.candidate) {
						// 		this.sendICE(candidate, data.memberID, sessionStorage.getItem("myID")!)
						// 	}
						// }
						// send SDP
						const offer = await peerConnection.createOffer()
						await peerConnection.setLocalDescription(offer)
						this.sendSDP(peerConnection.localDescription!, data.memberID, sessionStorage.getItem("myID")!)
					} catch(error) {
						console.log(error)
					}
		
					this.stableMembers.push({
						"name": data.memberName,
						"memberID": data.memberID,
						"conn": peerConnection,
						"video": video
					})
					break
				
				case 'leave':
					this.stableMembers = this.stableMembers.filter(member => member.memberID != data.memberID)
					break

				case 'sdp':
					if(data.sdp.type == 'offer') {
						const peerConnection = new RTCPeerConnection(this.config)
						const video = document.createElement('video')
						// logging
						peerConnection.onconnectionstatechange = () => {
							console.log(data.from, peerConnection.iceConnectionState)
						}
						// ontrack
						peerConnection.ontrack = async (event) => {
							try {
								video.srcObject = event.streams[0]
								await video.play()
							} catch(error) {
								console.log(error)
							}
						}
						// send tracks
						for(let track of this.localStream!.getTracks()) {
							peerConnection.addTrack(track, this.localStream!)
						}
						try {
							// ICE
							// peerConnection.onicecandidate = ({candidate}) => {
							// 	if(candidate && candidate.candidate) {
							// 		this.sendICE(candidate, data.memberID, sessionStorage.getItem("myID")!)
							// 	}
							// }
							// SDP
							const findWithSameID = this.stableMembers.find(member => member?.memberID == data?.from)
							findWithSameID!.conn = peerConnection
							findWithSameID!.video = video
							await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
							const answer = await peerConnection.createAnswer()
							await peerConnection.setLocalDescription(answer)
							this.sendSDP(peerConnection.localDescription!, data.from, sessionStorage.getItem("myID")!)
						} catch(error) {
							console.log(error)
						}
					}

					if(data.sdp.type == 'answer') {
						try {
							const findWithSameID = this.stableMembers.find(member => member?.memberID == data?.from)
							await findWithSameID!.conn!.setRemoteDescription(new RTCSessionDescription(data.sdp))
						} catch(error) {
							console.log(error)
						}
					}
					break
				
				case 'ice':
					const findWithSameID = this.stableMembers.find(member => member?.memberID == data?.from)
					findWithSameID!.conn!.addIceCandidate(new RTCIceCandidate(data.ice))
					break
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
			"type": "sdp",
			"to": to,
			"from": from,
			"sdp": sdp
		}))
	}

	sendICE(ice: RTCIceCandidate, to: string, from: string) {
		this.webSocket.send(JSON.stringify({
			"type": "ice",
			"to": to,
			"from": from,
			"ice": ice
		}))
	}
}