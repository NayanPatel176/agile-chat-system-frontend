import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserChatRoutingModule } from './user-chat-routing.module';
import { UserChatComponent } from './user-chat.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    UserChatComponent
  ],
  imports: [
    CommonModule,
    UserChatRoutingModule,
    FormsModule
  ]
})
export class UserChatModule { }
