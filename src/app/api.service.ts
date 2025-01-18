import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable, OnInit } from '@angular/core'
import { from, lastValueFrom, Observable } from 'rxjs'
import { Router } from '@angular/router';

interface Member {
	memberID: string
	name: string
	conn: RTCPeerConnection | null
	stream: MediaStream
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
	public initReceivingTracks(newMember: Member) {
		newMember.conn!.ontrack = (event) => {
			newMember.stream.addTrack(event.track)
			// const videoElement: HTMLVideoElement = document.createElement('video')
			// videoElement.srcObject = mediaStream
			// this.videos.push(videoElement)

			// const pElement: HTMLParagraphElement = document.createElement('p')
			// pElement.innerHTML = member.name
			// this.names.push(pElement) 
			
			// this.videoBox.nativeElement.appendChild(videoElement)
			// videoElement.play()
		}
	}
	
	public localMediaStream: MediaStream | undefined = undefined
	public initSendingTracks(newMember: Member) {
		if(newMember.conn && this.localMediaStream) {
			for(let track of this.localMediaStream.getTracks()) {
				newMember.conn.addTrack(track, this.localMediaStream)
			}
		}
	}

	async connect(sessionID: string, displayName: string) {
		console.log(sessionID)

		this.webSocket = new WebSocket(`${this.webSocketUrl}?sessionID=${sessionID}&displayName=${displayName}`)
	
		this.webSocket.onopen = (event: Event) => {
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
						"stream": new MediaStream()
					})
					break

				case 'exist':
					this.stableMembers.push({
						"name": data.memberName,
						"memberID": data.memberID,
						"conn": null,
						"stream": new MediaStream()
					})
					break

				case 'join':
					// webRTC
					const peerConnection = new RTCPeerConnection(this.config)
					peerConnection.createDataChannel('chat')
					try {
						// send ICE
						peerConnection.onicecandidate = ({candidate}) => {
							if(candidate && candidate.candidate) {
								console.log(candidate)
								this.sendICE(candidate!, data.memberID, sessionStorage.getItem("myID")!)
							}
						}
						// send SDP
						await peerConnection.setLocalDescription(await peerConnection.createOffer())
						this.sendSDP(peerConnection.localDescription!, data.memberID, sessionStorage.getItem("myID")!)
					} catch(error) {
						console.log(error)
					}
		
					this.stableMembers.push({
						"name": data.memberName,
						"memberID": data.memberID,
						"conn": peerConnection,
						"stream": new MediaStream()
					})
					break
				
				case 'leave':
					this.stableMembers = this.stableMembers.filter(member => member.memberID != data.memberID)
					break

				case 'sdp':
					if(data.sdp.type == 'offer') {
						const peerConnection = new RTCPeerConnection(this.config)
						try {
							// ICE
							peerConnection.onicecandidate = ({candidate}) => {
								if(candidate && candidate.candidate) {
									console.log(candidate)
									this.sendICE(candidate, data.memberID, sessionStorage.getItem("myID")!)
								}
							}
							// SDP
							const findWithSameID = this.stableMembers.find(member => member?.memberID == data?.from)
							findWithSameID!.conn = peerConnection
							await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
							await peerConnection.setLocalDescription(await peerConnection.createAnswer())
							this.sendSDP(peerConnection.localDescription!, data.from, sessionStorage.getItem("myID")!)
		
							this.initReceivingTracks(findWithSameID!)
							this.initSendingTracks(findWithSameID!)
						} catch(error) {
							console.log(error)
						}
					}

					if(data.sdp.type == 'answer') {
						try {
							const findWithSameID = this.stableMembers.find(member => member?.memberID == data?.from)
							await findWithSameID!.conn!.setRemoteDescription(new RTCSessionDescription(data.sdp))
		
							this.initReceivingTracks(findWithSameID!)
							this.initSendingTracks(findWithSameID!)
						} catch(error) {
							console.log(error)
						}
					}
					break
				
				case 'ice':
					const findWithSameID = this.stableMembers.find(member => member?.memberID == data?.from)
					// console.log(data)
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