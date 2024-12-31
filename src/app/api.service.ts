import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class ApiService {

constructor(private http: HttpClient) { }

	private getHeaders(): HttpHeaders {
		return new HttpHeaders({
		'Content-Type': 'application/json'
		});
	}

	// private apiUrl = 'https://callgo-server-386137910114.europe-west3.run.app'
	// private apiUrl = 'https://horia.live:8443'
	private httpUrl = 'http://localhost:1234'
	private webSocketUrl = 'ws://localhost:1234/ws'

	// http
	createSession(displayName: string): Promise<any> {
		return lastValueFrom(this.http.post(`${this.httpUrl}/initialize`, { headers: this.getHeaders() }))
	}

	kickSession(sessionID: string, memberID: string, password: string) {
		return this.http.post(`${this.httpUrl}/disconnect`, {"sessionID":`${sessionID}`,"memberID":`${memberID}`,"password":`${password}`}, { headers: this.getHeaders() })
	}

	// websocket
	private webSocket!: WebSocket
	
	connect(sessionID: string) {
		this.webSocket = new WebSocket(`${this.webSocketUrl}?sessionID=${sessionID}`);
	
		this.webSocket.onopen = (event: Event) => {
			console.log('WebSocket connection established');
		};
	
		this.webSocket.onmessage = (message: MessageEvent) => {
			console.log('Message received:', message.data);
			
			try {
				const data = JSON.parse(message.data);
				if (data.memberID) {
					const myID: string = data.memberID;
					sessionStorage.setItem("myID", myID);
					console.log('Member ID set:', myID);
				}
			} catch (error) {
				console.error('Error parsing message:', error);
			}
		};
	
		this.webSocket.onclose = () => {
			console.log('WebSocket connection closed');
		};
	
		this.webSocket.onerror = (error) => {
			console.error('WebSocket error:', error);
		};
	}	

	sendMessage(name: string, ID: string, video: string) {
		if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
			this.webSocket.send(JSON.stringify({
				"name":`${name}`,
				"ID":`${ID}`,
				"video":`${video}`
			}));
		} else {
			console.error('WebSocket is not open. Unable to send message.');
		}
	}

	close() {
		if(this.webSocket && this.webSocket.readyState !== WebSocket.CLOSED) {
			this.webSocket.close()
		} else {
			console.error('WebSocket already closed.')
		}
	}
}
