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

  private apiUrl = 'https://callgo-server-386137910114.europe-west3.run.app'

  // VIDEO
  postVideo(videoData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/video`, videoData, { headers: this.getHeaders() });
  }

  getVideo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/video`, { headers: this.getHeaders() });
  }

  // SESSION
  createSession(): Observable<any> {
    return this.http.post(`${this.apiUrl}/session`, { headers: this.getHeaders() });
  }

  joinSession(hostID: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/session/${hostID}`, { headers: this.getHeaders() });
  }

  getSession(hostID: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/session/${hostID}`, { headers: this.getHeaders() });
  }
}
