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

  private apiUrl = 'http://localhost:1234'

  postVideo(endpoint: string, videoData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${endpoint}`, videoData, { headers: this.getHeaders() });
  }

  getVideo(endpoint: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${endpoint}`, { headers: this.getHeaders() });
  }
}
