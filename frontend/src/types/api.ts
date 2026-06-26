import { z } from 'zod'

type BaseSuccess = { success: boolean }

export const RegisterSchema = z.object({
    email: z.string(),
    username: z.string(),
    password: z.string(),
    publicKey: z.string().min(1)
})

export type RegisterType = z.infer<typeof RegisterSchema>

export const LoginSchema = z.object({
    email: z.string(),
    password: z.string(),
})

export type LoginType = z.infer<typeof LoginSchema>

export interface Posts {
    id: number
    createdAt: Date
    authorId: number
    name: string
    description: string

    comments: Comment[]
    _count: {
        comments: number
        likes: number
    }

    userVote: string | null

    //то что приходит отдельно с бека (чего нет в ориг схема)
    author: {
        username: string,
        avatarUrl: string
    }
}

interface Comment {
    id: number
    content: string
    createdAt: Date
    userId: number
    postId: number

    //то что приходит отдельно с бека (чего нет в ориг схема)
    authorUsername: string
}

export interface CreatePost {
    name: string
    desciption: string
}

export interface UserProfile {
    data: {
        email?: string
        avatarUrl?: string

        id: number
        username: string
    },
    secondData: {
        followers: number
        following: number
        postsCount: number
        posts: Posts[] | null
        likes: number
        isSubcribed: boolean
        bannerColor: string | null
    }
}

export interface UploadAvatarResponse {
    success: boolean
    avatarUrl: string
}

export interface UpdateData {
    username: string
    bannerColor: string
}

export type UpdateAll = BaseSuccess
export type Subscribe = BaseSuccess
export type CreatePostResponse = BaseSuccess
export interface VoteResponse{
    success: boolean
    newRating: number
    currentVote: 'UP' | 'DOWN' | null
}

export interface LoginResponse{
    username: string,
    success: boolean
}

export interface CreateChatResponse{
    roomId: number
    isNew: boolean
}