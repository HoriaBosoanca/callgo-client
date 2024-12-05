import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  constructor() { }

  public hostID: number = -1
  
  public myID: number = -1
  public displayName: string = "null"
}
