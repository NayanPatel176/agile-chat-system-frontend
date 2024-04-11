import { Component, OnInit } from '@angular/core';
import { ChatService } from './chat.service';
import { ChatListData, UserData, messageDetails } from './chat-user.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-chat',
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.css']
})
export class UserChatComponent implements OnInit {
  senderId: string = localStorage.getItem('userId') || ''
  typeMessage: string = ''

  openDrwer: boolean = true
  selectedChatId: string = ''
  userList: UserData[] = []
  userCount: number = 0

  chatList: ChatListData[] = []
  chatCount: number = 0

  messages: messageDetails[] = []
  messagesCount: number = 0
  chatTitle: string = ''
  chatDp: string = ''

  constructor(
    private chatService: ChatService,
    private router: Router
  ) {
    if (!this.senderId) {
      this.router.navigateByUrl('/user-login');
    }
    this.getChatList()
    this.getUserList()
  }

  ngOnInit(): void {
    this.chatService.on('pushmessage', (message) => {
      if (this.selectedChatId === message.chatId) {
        this.messages.push(message)
      }
      if (!this.selectedChatId) {
        this.getChatList()
      }
    })
    this.chatService.on('createChat', (message) => {
      if(message.participants.includes(this.senderId)){
        this.getChatList()
      }
    })
  }

  sendMessage() {
    if(!this.selectedChatId || !this.typeMessage) {
      return
    }
    const payload = {
      "chatId": this.selectedChatId,
      "senderId": this.senderId,
      "message": this.typeMessage
    }
    this.chatService.sendMessage(payload)
      .subscribe(
        (response) => {
          // this.messages.push(response.data)
          this.typeMessage = ''
        },
        (error) => {
          console.error('API Error:', error)
        }
      );
  }
  participants: string[] = []
  addChat(user: any) {
    if (this.isGroupChat) {
      if(!this.participants.includes(user._id)){
        this.participants.push(user._id)
      } else {
        const findIndex = this.participants.indexOf(user._id)
        this.participants.splice(findIndex, 1)
      }
    } else {
      const payload = {
        isGroupChat: this.isGroupChat,
        participants: [this.senderId, user._id]
      }
      this.chatService.createChat(payload)
        .subscribe(
          (response) => {
            this.openDrwer = true
            if (!this.chatList.find(chat => chat._id === response.data._id)) {
              response.data.profile = this.generateDefaultImage(response.data.groupName || response.data.userInfo || 'Test')
              if(!response.data.isGroupChat){
                const userInfo = response.data.userList ? response.data.userList.find((user: any) => user._id != this.senderId).userName : ''
                response.data.userInfo = userInfo
              }
              this.chatList.unshift(response.data)
              this.participants = []
            }
            this.getMessages(response.data)
          },
          (error) => {
            console.error('API Error:', error)
          }
        );
    }
  }

  createGroup() {
    const payload = {
      isGroupChat: this.isGroupChat,
      participants: [this.senderId, ...this.participants]
    }
    this.chatService.createChat(payload)
      .subscribe(
        (response) => {
          this.openDrwer = true
          if (!this.chatList.find(chat => chat._id === response.data._id)) {
            response.data.profile = this.generateDefaultImage(response.data.groupName || response.data.userInfo || 'Test')
              if(!response.data.isGroupChat){
                const userInfo = response.data.userList ? response.data.userList.find((user: any) => user._id != this.senderId).userName : ''
                response.data.userInfo = userInfo
              }
              this.chatList.unshift(response.data)
              this.participants = []
          }
          this.getMessages(response.data)
        },
        (error) => {
          console.error('API Error:', error)
        }
      );
  }

  getUserList() {
    const query = {
      skip: 0,
      limit: 50,
      userId: this.senderId
    }
    this.chatService.getUserList(query)
      .subscribe(
        (response) => {
          this.userList = response.usersList
          this.userCount = response.usersCount
        },
        (error) => {
          console.error('API Error:', error)
        }
      );
  }

  getChatList() {
    const query = {
      skip: 0,
      limit: 50,
      userId: this.senderId
    }
    this.chatService.getChatList(query)
      .subscribe(
        (response) => {
          this.chatList = response.chats
          this.chatList.map(chat => {
            if (!chat.isGroupChat) {
              const userInfo = chat.userList ? chat.userList.find(user => user._id != this.senderId).userName : ''
              chat.userInfo = userInfo
            }
            chat.profile = this.generateDefaultImage(chat.groupName || chat.userInfo || 'Test')
          })
          this.chatCount = response.chatCount
          if (this.chatCount && !this.selectedChatId) {
            this.selectedChatId = this.chatList[0]._id
            this.getMessages(this.chatList[0])
          }
        },
        (error) => {
          console.error('API Error:', error)
        }
      );
  }

  generateDefaultImage(name: string) {
    const canvas = document.createElement("canvas");
    canvas.style.display = "none";
    canvas.width = 32;
    canvas.height = 32;
    document.body.appendChild(canvas);
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#999";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "14px Helvetica";
    context.fillStyle = "#fff";
    // const nameArray = name.split(" ");
    let initials = "";
    for (let i = 0; i < name.length; i++) {
      if (i <= 1) {
        initials = initials + name[i];
      }
    }
    if (initials.length > 1) {
      context.fillText(initials.toUpperCase(), 6, 22);
    } else {
      context.fillText(initials.toUpperCase(), 11, 22);
    }
    const data = canvas.toDataURL();
    document.body.removeChild(canvas);
    return data;
  }

  getMessages(chatData: ChatListData) {
    this.selectedChatId = chatData._id
    if (chatData.isGroupChat) {
      this.chatTitle = chatData.groupName || ''
    }
    this.chatDp = chatData.profile || ''
    console.log(chatData.participants.find(participant => participant !== this.senderId))
    const query = {
      skip: 0,
      limit: 50,
      chatId: this.selectedChatId,
      userId: !chatData.isGroupChat ? chatData.participants.find(participant => participant !== this.senderId) : ''
    }
    this.chatService.getMessages(query)
      .subscribe(
        (response) => {
          this.messages = response.messages
          this.messagesCount = response.messagesCount
          if (!chatData.isGroupChat) {
            this.chatTitle = response.opponentUserName
          }
        },
        (error) => {
          console.error('API Error:', error)
        }
      );
  }

  isGroupChat: boolean = false
  toggleDrawer(flag: boolean, isGroupChat: boolean): void {
    this.openDrwer = flag
    this.isGroupChat = isGroupChat
  }

  ngOnDestroy() {
    this.chatService.disconnect();
  }
}
