import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private readonly url: string = 'http://localhost:3001';
  private socket!: Socket;
  private roomId: string = '';

  constructor() {
    // Initialize the socket connection
    this.initSocket();
  }

  // Initialize the socket connection and set up event listeners
  private initSocket(): void {
    // Create a new socket instance
    this.socket = io(this.url);

    // Log when connected to the Socket.IO server
    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      this.rejoinRooms();
    });

    // Reconnect the socket if disconnected
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected. Reconnecting...');
    });
  }


  private rejoinRooms(): void {
    this.joinGroup(this.roomId).subscribe(() => { });
    // this.getEvent('message').subscribe((message) => { console.log('message') });
  }

  // Emit an event with optional data
  emit(event: string, data?: any): void {
    this.socket.emit(event, data);
  }

  // Join a group and notify when done
  joinGroup(groupId: string): Observable<void> {
    return new Observable((observer) => {
      this.roomId = groupId
      this.socket.emit('joinGroup', groupId, () => {
        // Store the joined room for rejoining upon reconnection
        observer.next();
        observer.complete();
      });
    });
  }

  // Listen for group messages
  listenForGroupMessages(groupId: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(`groupMessage:${groupId}`, (message) => {
        observer.next(message);
      });
    });
  }

  // Listen for a specific event
  getEvent(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (message) => {
        observer.next(message);
      });
    });
  }

  // Disconnect the socket
  disconnect(): void {
    this.socket.disconnect();
  }
}
