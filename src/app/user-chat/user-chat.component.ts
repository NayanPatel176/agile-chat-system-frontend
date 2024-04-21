import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatService } from './chat.service';
import { ChatListData, UserData, messageDetails } from './chat-user.model';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { SocketService } from './socket.service';

@Component({
  selector: 'app-user-chat',
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.css']
})
export class UserChatComponent implements OnInit {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
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
  chatTitle: string | undefined = ''
  chatDp: string = ''

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,
    private router: Router,
    private toast: NgToastService
  ) {
    if (!this.senderId) {
      this.router.navigateByUrl('/user-login');
    }
    this.getUserDetails(this.senderId)
    this.getChatList()
    this.getUserList()
    this.socketService.joinGroup(this.senderId).subscribe(() => { })
  }

  ngOnInit(): void {

    this.socketService.getEvent('message').subscribe((message) => {
      if (message.senderId !== this.senderId) {
        this.toast.success({ detail: message.isGroupChat ? `${message.senderName} sent a message in ${message.groupName} group.` : `Your got new message from ${message.senderName}`, summary: `${message.message}`, duration: 5000 });
      }
      if (this.selectedChatId === message.chatId) {
        this.messages.push(message)
        setTimeout(() => {
          this.scrollToBottom();
        });
      }
    })

    this.socketService.getEvent('recievedChat').subscribe((message) => {
      if (message.participants.includes(this.senderId)) {
        if (this.chatList.findIndex(chat => chat._id === message._id) < 0) {
          message.userInfo = message.groupName ? message.groupName : message.userList.find((user: any) => user._id !== this.senderId).userName
          message.profile = this.generateDefaultImage(message.userInfo || 'Test')
          this.chatList.unshift(message)
          if (message.senderId !== this.senderId) {
            if (message.isGroupChat) {
              this.toast.success({ detail: `${message.senderName} created group.`, summary: 'Go ahead and chat with other group members.', duration: 5000 });
            } else {
              this.toast.success({ detail: `${message.senderName} want to chat with you.`, summary: `Go ahead and chat with ${message.senderName}.`, duration: 5000 });
            }
          }
        }
      }
    })
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.scrollToBottom();
    });
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error("Error scrolling to bottom:", err);
    }
  }

  userDetails: UserData = { _id: '', userName: '', createdAt: '' }
  getUserDetails(userId: string) {
    this.chatService.getUserDetails(userId)
      .subscribe(
        (response) => {
          this.userDetails = response.userDetails
        },
        (error) => {
          console.error('API Error:', error)
          this.toast.error({
            detail: 'Chat App',
            summary: 'You are not authorized to access this screen. Please go to the login page and log in again.',
            duration: 5000
          });
          this.router.navigateByUrl('/user-login');
        }
      );
  }

  // subscribeGroupMessages() {
  //   this.chatList.map(chat => {
  //     if (chat.isGroupChat) {
  //       this.joinGroup(chat._id)
  //       this.subscribeMessages(chat._id);
  //     }
  //   })
  // }

  // joinGroup(chatId: string) {
  //   this.socketService.joinGroup(chatId).subscribe(() => { })
  // }

  // subscribeMessages(chatId: string) {
  //   this.socketService.listenForGroupMessages(chatId).subscribe((message) => {
  //     if (this.senderId !== message.senderId) {
  //       if (this.chatList.findIndex(chat => chat._id === message.chatId) >= 0) {
  //         if (message.senderId !== this.senderId) {
  //           this.toast.success({ detail: message.isGroupChat ? `${message.senderName} sent a message in ${message.groupName} group.` : `Your got new message from ${message.senderName}`, summary: `${message.message}`, duration: 5000 });
  //         }
  //       }
  //       if (this.selectedChatId === message.chatId) {
  //         this.messages.push(message)
  //       }
  //     }
  //   });
  // }

  sendMessage() {
    if (!this.selectedChatId || !this.typeMessage) {
      return
    }
    const { isGroupChat, groupName, participants } = this.chatSelectedData
    const message = {
      chatId: this.selectedChatId,
      senderId: this.senderId,
      message: this.typeMessage,
      createdAt: new Date().toISOString(),
      senderName: this.userDetails.userName,
      isGroupChat,
      groupName
    }
    this.socketService.emit('message', { participants, message });
    // if (this.chatSelectedData && this.chatSelectedData.isGroupChat) {
    //   this.socketService.emit('groupMessage', { groupId: this.chatSelectedData._id, participants, message });
    // } else {
    //   this.socketService.emit('message', { recipientId: this.chatSelectedData.recipientId, message })
    // }
    // this.messages.push(message)
    this.typeMessage = ''
    // this.chatService.sendMessage(payload)
    //   .subscribe(
    //     (response) => {
    //       // this.messages.push(response.data)
    //       this.typeMessage = ''
    //     },
    //     (error) => {
    //       console.error('API Error:', error)
    //     }
    //   );
  }
  participants: string[] = []
  addChat(user: any) {
    if (this.isGroupChat) {
      if (!this.participants.includes(user._id)) {
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
      this.openDrwer = true
      this.participants = []
      this.socketService.emit('createChat', payload)
      // this.chatService.createChat(payload)
      //   .subscribe(
      //     (response) => {
      //       this.openDrwer = true
      //       if (!this.chatList.find(chat => chat._id === response.data._id)) {
      //         const userInfo = response.data.userList ? response.data.userList.find((user: any) => user._id != this.senderId).userName : ''
      //         response.data.profile = this.generateDefaultImage(userInfo || 'Test')
      //         response.data.userInfo = userInfo
      //         this.chatList.unshift(response.data)
      //         this.participants = []
      //         this.getMessages(response.data)
      //       }
      //     },
      //     (error) => {
      //       console.error('API Error:', error)
      //     }
      //   );
    }
  }

  createGroup() {
    if (this.participants.length < 1) {
      return
    }
    const payload = {
      isGroupChat: this.isGroupChat,
      participants: [this.senderId, ...this.participants]
    }
    this.socketService.emit('createChat', payload)
    this.openDrwer = true
    this.participants = []
    // this.chatService.createChat(payload)
    //   .subscribe(
    //     (response) => {
    //       this.openDrwer = true
    //       if (!this.chatList.find(chat => chat._id === response.data._id)) {
    //         response.data.profile = this.generateDefaultImage(response.data.groupName || response.data.userInfo || 'Test')
    //         if (!response.data.isGroupChat) {
    //           const userInfo = response.data.userList ? response.data.userList.find((user: any) => user._id != this.senderId).userName : ''
    //           response.data.userInfo = userInfo
    //         }
    //         this.chatList.unshift(response.data)
    //         this.participants = []
    //         this.getMessages(response.data)
    //       }
    //     },
    //     (error) => {
    //       console.error('API Error:', error)
    //     }
    //   );
  }
  userListSkip: number = 0
  userListLimit: number = 20
  getUserList(isScrol?: boolean) {
    if (isScrol) {
      if (this.userCount <= this.userListSkip + this.userListLimit) {
        return
      }
      this.userListSkip = this.userListSkip + this.userListLimit
    }
    const query = {
      skip: this.userListSkip,
      limit: this.userListLimit,
      userId: this.senderId
    }
    this.chatService.getUserList(query)
      .subscribe(
        (response) => {
          this.userList = [...this.userList, ...response.usersList]
          this.userCount = response.usersCount
        },
        (error) => {
          console.error('API Error:', error)
        }
      );
  }

  chatListSkip: number = 0
  chatListLimit: number = 20
  getChatList(isScrol?: boolean) {
    if (isScrol) {
      if (this.chatCount <= this.chatListSkip + this.chatListLimit) {
        return
      }
      this.chatListSkip = this.chatListSkip + this.chatListLimit
    }
    const query = {
      skip: this.chatListSkip,
      limit: this.chatListLimit,
      userId: this.senderId
    }
    this.chatService.getChatList(query)
      .subscribe(
        (response) => {
          if (isScrol) {
            this.chatList = [...this.chatList, ...response.chats]
          } else {
            this.chatList = response.chats
          }
          // this.subscribeGroupMessages()
          this.chatList.map(chat => {
            if (!chat.isGroupChat) {
              const userInfo = chat.userList ? chat.userList.find(user => user._id != this.senderId)?.userName : ''
              chat.userInfo = userInfo
            }
            chat.profile = this.generateDefaultImage(chat.groupName || chat.userInfo || 'Test')
          })
          this.chatCount = response.chatCount
          if (!this.chatCount) {
            this.toast.success({ detail: 'You Have No Chats Yet', summary: 'Start a new conversation!', duration: 5000 });
          }
          if (this.chatCount && !this.selectedChatId) {
            this.selectedChatId = this.chatList[0]._id
            this.getMessages(this.chatList[0])
          }
        },
        (error) => {
          this.toast.error({ detail: "ERROR", summary: error.error.message || 'Something went wrong!', sticky: true });
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

  messagesSkip: number = 0
  messagesLimit: number = 20
  chatSelectedData: ChatListData = { _id: '', participants: [], isGroupChat: false, createdAt: '' }
  getMessages(chatData: ChatListData, isScrol?: boolean) {
    this.chatSelectedData = chatData
    this.chatSelectedData.recipientId = !chatData.isGroupChat ? chatData.participants.find(participant => participant !== this.senderId) : ''
    if (isScrol) {
      if (this.messagesCount <= this.messagesSkip + this.messagesLimit) {
        return
      }
      this.messagesSkip = this.messagesSkip + this.messagesLimit
    } else {
      this.messagesSkip = 0
    }
    this.selectedChatId = chatData._id
    if (chatData.isGroupChat) {
      this.chatTitle = chatData.groupName || ''
    } else {
      this.chatTitle = chatData.userList ? chatData.userList.find(user => user._id !== this.senderId)?.userName : ''
    }
    this.chatDp = chatData.profile || ''
    const query = {
      skip: this.messagesSkip,
      limit: this.messagesLimit,
      chatId: this.selectedChatId,
      userId: this.chatSelectedData.recipientId
    }
    this.chatService.getMessages(query)
      .subscribe(
        (response) => {
          const newMessages = response.messages.reverse();
          if (isScrol) {
            // Calculate the height of the newly added messages
            const newMessagesHeight = this.calculateMessagesHeight(newMessages);

            // Calculate the current scroll position relative to the bottom
            const scrollHeight = this.chatContainer.nativeElement.scrollHeight;
            const scrollTop = this.chatContainer.nativeElement.scrollTop;
            const offsetHeight = this.chatContainer.nativeElement.offsetHeight;
            const relativeScrollPosition = scrollHeight - (scrollTop + offsetHeight);
            this.messages = [...newMessages, ...this.messages]

            this.chatContainer.nativeElement.scrollTop = scrollHeight - (newMessagesHeight + relativeScrollPosition);
          } else {
            this.messages = newMessages
            setTimeout(() => {
              this.scrollToBottom();
            });
          }
          this.messagesCount = response.messagesCount
          if (!chatData.isGroupChat && response.opponentUserName) {
            this.chatTitle = response.opponentUserName
          }
        },
        (error) => {
          console.error('API Error:', error)
        }
      );
  }

  private calculateMessagesHeight(messages: any[]): number {
    return messages.reduce((totalHeight, message) => {
      return totalHeight + 19; // Assuming a fixed height of 19px per message
    }, 0);
  }

  isGroupChat: boolean = false
  toggleDrawer(flag: boolean, isGroupChat: boolean): void {
    this.openDrwer = flag
    this.isGroupChat = isGroupChat
  }

  loadMoreData(listNumber: number): void {
    // Your API call code here
    if (listNumber === 1) {
      this.getChatList(true)
    }
    if (listNumber === 2) {
      this.getUserList(true)
    }
    if (listNumber === 3) {
      this.getMessages(this.chatSelectedData, true)
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigateByUrl('./user-login');
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }
}
