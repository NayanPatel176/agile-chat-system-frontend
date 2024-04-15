import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginUserData, LoginUserResponse } from './user-login.model';
import { tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }
  private url: string = environment.apiUrl
  loginUser(userData: LoginUserData) {
    return this.http.post<LoginUserResponse>(`${this.url}/user/login`, userData)
      .pipe(
        tap(response => {
          // Store user ID in local storage upon successful response
          if (response && response.userId) {
            localStorage.setItem('userId', response.userId);
          }
        })
      );
  }
}
