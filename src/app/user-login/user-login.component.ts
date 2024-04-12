import { Component } from '@angular/core';
import { LoginService } from './login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent {
  username: string = ''

  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  onSubmit() {
    this.loginService.loginUser({ userName: this.username })
      .subscribe(
        (response) => {
          this.router.navigateByUrl('/user-chat');
        },
        (error) => {
          console.error('API Error:', error)
        }
      );
  }
}
