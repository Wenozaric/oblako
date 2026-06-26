import { z } from 'zod'

export const RegisterSchema = z.object({
    body: z.object({
        email: z.email('Невалидный email'),
        password: z.string().min(8, 'Невалидный пароль').max(20, 'Невалидный пароль'),
        username: z.string().min(3, 'Невалидный никнейм').max(20, 'Невалидный никнейм').regex(/^[a-zA-Z0-9]+$/, 'Невалидный никнейм')
        
    })
})

export const GetProfileSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/)
    })
})

export const UpdateSchema = z.object({
    body: z.object({
        username: z.string(),
        bannerColor: z.string()
    })
})

export const SubcribeSchema = z.object({
    body: z.object({
        to: z.number()
    })
})

export const LoginSchema = z.object({
    body: z.object({
        email: z.email('Невалидный email'),
        password: z.string().min(8, 'Невалидный пароль').max(20, 'Невалидный пароль')
    })
})