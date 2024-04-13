import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io } from "socket.io-client";
import { ChatLiastResponse, UserResponse, messageData, messagesResponse, queryParams } from './chat-user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  url: string = 'http://localhost:3001'
  socket = io(this.url);

  constructor(private http: HttpClient) { 
    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });
  }

  emit(event: string, data?: any) {
    this.socket.emit(event, data);
  }


  // Join a group
  joinGroup(groupId: string): Observable<void> {
    return new Observable((observer) => {
      this.socket.emit('joinGroup', groupId, () => {
        observer.next();
        observer.complete();
      });
    });
  }

  // Listen for group messages
  listenForGroupMessages(groupId: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(`groupMessage:${groupId}`, (message) => {
        console.log('groupId: ', groupId);
        observer.next(message);
      });
    });
  }


  on(event: string, callback: (...args: any[]) => void) {
    this.socket.on(event, callback);
  }

  sendMessageFromSocket(msg: string) {
    this.socket.emit('message', msg);
  }
  getMessage(event: string, callback: (...args: any[]) => void) {
    return this.socket.on(event, callback);
  }

  disconnect() {
    this.socket.disconnect();
  }

  getUserList(queryParams: queryParams) {
    let params = new HttpParams();
    params = params
      .set('userId', queryParams.userId || '')
      .set('skip', queryParams.skip)
      .set('limit', queryParams.limit)
    return this.http.get<UserResponse>(`${this.url}/user`, { params });
  }

  getUserDetails(userId: string) {
    let params = new HttpParams();
    params = params
      .set('userId', userId)
    return this.http.get<any>(`${this.url}/user/details`, { params });
  }

  getChatList(queryParams: queryParams) {
    let params = new HttpParams();
    params = params
      .set('userId', queryParams.userId || '')
      .set('skip', queryParams.skip)
      .set('limit', queryParams.limit)
    return this.http.get<ChatLiastResponse>(`${this.url}/chat`, { params });
  }

  getMessages(queryParams: queryParams) {
    let params = new HttpParams();
    params = params
      .set('chatId', queryParams.chatId || '')
      .set('userId', queryParams.userId || '')
      .set('skip', queryParams.skip)
      .set('limit', queryParams.limit)
    return this.http.get<messagesResponse>(`${this.url}/message`, { params });
  }

  sendMessage(messageData: messageData) {
    return this.http.post<any>(`${this.url}/message`, messageData);
  }

  createChat(payload: any) {
    return this.http.post<any>(`${this.url}/chat`, payload);
  }
}
