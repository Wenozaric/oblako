import type { LoginType, RegisterType, Posts, UserProfile, UpdateAll, UploadAvatarResponse, Subscribe, UpdateData, CreatePost, CreatePostResponse, VoteResponse, CreateChatResponse, LoginResponse } from "../types/api";
import { apiService } from "./axios.config";

export const authService = {
    register: (data: RegisterType) =>
        apiService.post('/register', data).then(res => res.data),

    login: (data: LoginType) =>
        apiService.post<LoginResponse>('/login', data).then(res => res.data),

    checkCookie: () =>
        apiService.get('/checkCookie').then(res => res.data)
}


export const profileService = {
    getMe: () =>
        apiService.get<UserProfile>('/getMyProfile').then(res => res.data),

    getSb: (id: number) =>
        apiService.get<UserProfile>(`/getSbProfile/${id}`).then(res => res.data),

    update: ({ username, bannerColor }: UpdateData) =>
        apiService.post<UpdateAll>('/update', { username: username, bannerColor: bannerColor }).then(res => res.data),

    loadPng: (data: FormData) =>
        apiService.post<UploadAvatarResponse>('/uploadAvatar', data, {
            headers: {
                'Content-type': 'multipart/form-data'
            }
        }).then(res => res.data),

    subscribe: (id: number) =>
        apiService.post<Subscribe>('/subcribe', { to: id }).then(res => res.data),

    unsubscribe: (id: number) =>
        apiService.delete<Subscribe>(`/unsubcribe/${id}`).then(res => res.data)

}

export const postsService = {
    createPost: (data: CreatePost) =>
        apiService.post<CreatePostResponse>('/createPost', data).then(res => res.data),

    fetchPosts: (filter: string, startIndex: number, limit: number) =>
        apiService.get<{ posts: Posts[] }>('/posts', { params: { tab: filter, startIndex: startIndex, limit: limit } }).then(res => res.data),

    vote: (vote: string, postId: number) =>
        apiService.post<VoteResponse>('/vote', { data: vote, postId: postId }).then(res => res.data)
}

export const chatService = {
    createChat: (toUserId: number) =>
        apiService.post<CreateChatResponse>('/chat/create', { secondUser: toUserId }).then(res => res.data),

    getMyRooms: () =>
        apiService.get<any[]>('/chat/my-rooms').then(res => res.data),

    getChatHistory: (roomId: string) =>
        apiService.get<any[]>(`/chat/history/${roomId}`).then(res => res.data)
}