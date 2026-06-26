import express, { Request, Response }  from 'express';
import { dbClient } from '../src/db/prismaClient.js';
import bcrypt from 'bcrypt'

import { validateData } from "./utils/validateData.js";
import { cookieCheck } from './utils/cookieCheck.js';
import { RegisterSchema, LoginSchema } from '../src/types/types.js';

const authRouter = express.Router()

authRouter.get('/checkCookie', (req: Request, res: Response) => {
    console.log('пришел /checkCookie')
    console.log(req.session)
    console.log(req.session.auth)
    if( req.session?.auth == true) return res.status(200).json({username: req.session.username})
    return res.status(400).json({username: undefined})
})

authRouter.post('/login', cookieCheck, validateData(LoginSchema), async(req: Request, res: Response) => {
    const { email, password } = req.body
    try {

        const alreadyUser = await dbClient.user.findFirst({
            where: {
                email: email
            }
        })

        if( alreadyUser ){
            const isCompare = await bcrypt.compare(password, alreadyUser.password)
            if( isCompare ){
                req.session.userId = alreadyUser.id
                req.session.email = alreadyUser.email
                req.session.username = alreadyUser.username
                req.session.auth = true
                await new Promise((resolve) => req.session.save(() => resolve(false)))
                return res.status(200).json({ success: true, username: alreadyUser.username })
            }
        }
        return res.status(400).json({ message: 'Неверное имя пользователя или пароль' })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: 'Сервер упал' })
    }
})

authRouter.post('/register', cookieCheck, validateData(RegisterSchema), async(req: Request, res: Response) => {
    console.log(req.session)
    const {email, password, publicKey, username} = req.body
    try{
        const alreadyUser = await dbClient.user.findFirst({
            where:{
                email: email
            }
        })

        if ( alreadyUser ) return res.status(400).json({message: 'Эта почта уже занята'})
        
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await dbClient.user.create({
            data:{
                email:email,
                password: hashedPassword,
                username: username,
                publicKey: publicKey
            },

        })

        if( user ){
            req.session.userId = user.id
            req.session.email = user.email 
            req.session.username = user.username
            req.session.auth = true
            await new Promise((resolve) => req.session.save(() => resolve(false)))
            console.log(user)
            return res.status(200).json({ message: 'Успешная регистрация', username: user.username})
        } 
        
        return res.status(400).json({ message: 'Не получилось зарегистрироваться, попробуйте позже'})
    } catch(e){
        console.error(e)
        return res.status(500).json({ message: 'Сервер упал' })
    }
})

export default authRouter