import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChatLiastResponse, UserResponse, messageData, messagesResponse, queryParams } from './chat-user.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private url: string = environment.apiUrl

  constructor(private http: HttpClient) {}

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
