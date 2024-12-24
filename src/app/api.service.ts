import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
  private apiUrl = 'https://horia.live:8443'

  // VIDEO
  postVideo(videoData: string, sessionID: string, memberID: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/video/${sessionID}/${memberID}`, { video: videoData }, { headers: this.getHeaders() });
  }

  getVideo(sessionID: string, memberID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/video/${sessionID}/${memberID}`, { headers: this.getHeaders() });
  }

  // SESSION
  createSession(displayName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/session`, {"name":displayName}, { headers: this.getHeaders() });
  }

  joinSession(hostID: string, displayName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/session/${hostID}`, {"name":displayName}, { headers: this.getHeaders() });
  }

  getSession(hostID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/session/${hostID}`, { headers: this.getHeaders() });
  }

  leaveSession(hostID: string, memberID: string) {
    return this.http.delete(`${this.apiUrl}/session/${hostID}/${memberID}`, { headers: this.getHeaders() })
  }
}
