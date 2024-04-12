export interface messageData {
    chatId: string;
    senderId: string;
    message: string;
}

export interface queryParams {
    chatId?: string;
    userId?: string;
    skip: number;
    limit: number;
}

export interface UserData {
    _id: string;
    userName: string;
    createdAt: string;
}

export interface UserResponse {
    usersList: UserData[];
    usersCount: number;
}

export interface ChatListData {
    _id: string;
    participants: string[];
    groupName?: string;
    isGroupChat: boolean;
    createdAt: string;
    profile?: string;
    userList?: any[];
    userInfo? : string
}

export interface ChatLiastResponse {
    chats: ChatListData[];
    chatCount: number;
}

export interface messageDetails {
    _id?: string;
    chatId: string;
    message: string;
    senderId: string;
    createdAt: string;
}

export interface messagesResponse {
    messages: messageDetails[];
    messagesCount: number;
    opponentUserName: string;
}