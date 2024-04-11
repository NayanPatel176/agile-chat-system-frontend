import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { io } from "socket.io-client";
import { ChatLiastResponse, UserResponse, messageData, messagesResponse, queryParams } from './chat-user.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  url: string = 'http://localhost:3001'
  socket = io(this.url);

  constructor(private http: HttpClient) { }

  emit(event: string, data?: any) {
    this.socket.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void) {
    console.log('event: ', event);
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
