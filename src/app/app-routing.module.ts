import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/user-login', pathMatch: 'full' },
  { path: 'user-login', loadChildren: () => import('./user-login/user-login.module').then(m => m.UserLoginModule) },
  { path: 'user-chat', loadChildren: () => import('./user-chat/user-chat.module').then(m => m.UserChatModule) },
  { path: '**', redirectTo: '/user-login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
