import express, { Request, Response } from "express";
import { dbClient } from "../src/db/prismaClient.js";
import { validateData } from "./utils/validateData.js";
import { GetProfileSchema, UpdateSchema, SubcribeSchema } from "../src/types/types.js";
import multer from "multer";
import fs from 'fs'
import path from 'path'

const profileRouter = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/avatars'

        if(!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, {recursive: true})
        }
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const userId = req.session.userId
        const ext = path.extname(file.originalname)

        cb(null, `avatar-${userId}-${Date.now()}${ext}`)
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }
})


const getProfile = async(req: Request, res: Response) => {
    try {
        const user = await dbClient.user.findUnique({
            where: {
                id: req.session.userId
            },
            include: {
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true,
                        likes: true
                    }
                },
                posts: {
                    include: {
                        _count: {
                            select: {
                                likes: true,
                                comments: true
                            }
                        }
                    }
                }
            }
        })

        if (!user) return res.status(400).json({ message: 'Ошибка получения пользователя' })
        
        //искусственная задержка для того чтобы карточка чуть попульсировала
        setTimeout(() => { return res.status(200).json({ data: { id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl }, secondData: { followers: user._count.followers, following: user._count.following, postsCount: user._count.posts, posts: user.posts, likes: user._count.likes, bannerColor: user.bannerTheme } }) }, 1000)
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: 'Сервер упал' })
    }
}

profileRouter.get('/getMyProfile', getProfile)

profileRouter.get('/getSbProfile/:id', validateData(GetProfileSchema), async (req: Request, res: Response) => {
    try {
        const targetUserId = Number(req.params.id)

        if( targetUserId == req.session.userId){
            return res.redirect('/getMyProfile')
        } else {
            const user = await dbClient.user.findUnique({
                where: {
                    id: targetUserId
                },
                include:{
                    _count:{
                        select:{
                            posts: true,
                            followers: true,
                            following: true,
                            likes: true
                        }
                    },
                    posts:{
                        include:{
                            _count:{
                                select:{
                                    likes: true,
                                    comments: true
                                }
                            }
                        }
                    }
                }
            })

            if (!user) return res.status(400).json({ message: 'Ошибка получения пользователя' })

            const follow = req.session.userId ? await dbClient.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: req.session.userId,
                        followingId: targetUserId
                        }
                    }
            }) : null;

            setTimeout(() => { return res.status(200).json({
                data: {
                    id: user.id,
                    username: user.username,
                    avatarUrl: user.avatarUrl
                }, 
                secondData:{
                    followers: user._count.followers,
                    following: user._count.following,
                    postsCount: user._count.posts,
                    posts: user.posts,
                    likes: user._count.likes,
                    isSubcribed: !!follow,
                    bannerColor: user.bannerTheme
                }
            })}, 1000)
        }

    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: 'Сервер упал' })
    }
})


profileRouter.post('/update', validateData(UpdateSchema), async (req: Request, res: Response) => {
    try{
        console.log(req.body)
        if(!req.session.userId) return res.status(400).json({message: 'Отсутстует сессия'})
        console.log('здесь')
        const user = await dbClient.user.update({
            where:{
                id: req.session.userId
            },
            data:{
                username: req.body.username,
                bannerTheme: req.body.bannerColor
            }
        })

        return res.status(200).json({success: true})

    } catch ( e ){
        console.error(e)
        return res.status(400).json({ success: false })
    }
})

profileRouter.post('/subcribe', validateData(SubcribeSchema), async(req: Request, res: Response) =>{
    try{

        const userId = req.session.userId

        if( !userId || userId == req.body.to ) return res.status(400).json({ message: 'Не удалось подписаться' })

        const follow = await dbClient.follow.create({
            data:{
                followerId: userId,
                followingId: req.body.to
            }
        })

        return res.status(200).json({ success: true })

    } catch ( e ){
        console.error(e)
        return res.status(400).json({ message: 'Не удалось подписаться' })
    }
})

profileRouter.delete('/unsubcribe/:id', async (req: Request, res: Response) => {
    try {

        const userId = req.session.userId
        const followingId = Number(req.params.id)

        if (!userId || userId == followingId) return res.status(400).json({ message: 'Не удалось отподписаться' })

        const follow = await dbClient.follow.delete({
            where:{
                followerId_followingId:{
                    followerId: userId,
                    followingId: followingId
                }
            }
        })

        return res.status(200).json({ success: true })
    } catch (e) {
        console.error(e)
        return res.status(400).json({ message: 'Не удалось отподписаться' })
    }
})

profileRouter.post('/uploadAvatar', upload.single('avatar'), async(req: Request, res: Response) => {
    try{
        console.log('/uploadAvatar')

        const userId = req.session.userId
        if(!userId) return res.status(400).json({ message: 'Отсутвует сессия' })
        console.log(req.file)
        if(!req.file) return res.status(400).json({ message: 'Отсутвует изображение' })
        
        const avatarUrl = `/uploads/avatars/${req.file.filename}`

        const user = await dbClient.user.findUnique({
            where:{
                id: userId
            }
        })


        if( !user )  return res.status(400).json({ message: 'Пользователь не найден' })

        console.log('user найден')

        if( user?.avatarUrl){
            const oldFile = path.join(process.cwd(), user.avatarUrl)
            if( fs.existsSync(oldFile)){
                fs.unlinkSync(oldFile)
            }
        }

        console.log('здесь')

        await dbClient.user.update({
            where:{
                id: userId
            },
            data:{
                avatarUrl: avatarUrl
            }
        })

        console.log('здесь')

        return res.status(200).json({ success: true, avatarUrl: avatarUrl })

    } catch (e){
        console.error(e)
        return res.status(500).json({ success: false})
    }
})

export default profileRouter