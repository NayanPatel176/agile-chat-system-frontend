import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserChatRoutingModule } from './user-chat-routing.module';
import { UserChatComponent } from './user-chat.component';
import { FormsModule } from '@angular/forms';
import { ScrollTrackerDirective } from './scroll-tracker.directive';

@NgModule({
  declarations: [
    UserChatComponent,
    ScrollTrackerDirective
  ],
  imports: [
    CommonModule,
    UserChatRoutingModule,
    FormsModule
  ]
})
export class UserChatModule { }
