import express, { Request, Response } from 'express'
import { dbClient } from '../src/db/prismaClient.js'
import { Prisma } from '../src/generated/prisma/client.js'

const postRouter = express.Router()

postRouter.post('/createPost', async (req: Request, res: Response) => {
    try {
        const userId = req.session.userId
        let desciption = ''
        if (req.body.desciption) desciption = req.body.description
        const post = await dbClient.post.create({
            data: {
                name: req.body.name,
                desciption: req.body.desciption,
                author: {
                    connect: {
                        id: userId
                    }
                }
            }
        })

        console.log(post)

        if (!post) return res.status(400).json({ success: false })

        return res.status(200).json({ success: true })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: 'Не' })
    }
})

postRouter.get('/posts', async (req: Request, res: Response) => {
    try {

        //пагинация
        const startIndex = Number(req.query.startIndex) || 0
        const limit = Number(req.query.limit) || 10

        const currentFilter = String(req.query.tab || 'popular')

        const posts = await dbClient.post.findMany({
            include: {
                _count: {
                    select: {
                        comments: true
                    }
                },
                likes: {
                    select: {
                        type: true,
                        userId: true
                    }
                },
                author: {
                    select: {
                        username: true,
                        avatarUrl: true
                    }
                }
            }
        })

        const formatLikes = posts.map((post) => {
            const upVotes = post.likes.filter(vote => vote.type === 'UP').length
            const downVotes = post.likes.filter(vote => vote.type === 'DOWN').length

            const currentUserVote = post.likes.find(vote => vote.userId == req.session.userId)
            return {
                id: post.id,
                name: post.name,
                description: post.desciption,
                createdAt: post.createdAt,
                authorId: post.authorId,
                author: {
                    username: post.author.username,
                    avatarUrl: post.author.avatarUrl
                },
                userVote: currentUserVote ? currentUserVote.type : null,
                _count: {
                    likes: upVotes - downVotes,
                    comments: post._count.comments
                }
            }
        })

        console.log(currentFilter)
        switch (currentFilter) {
            case 'new': {
                formatLikes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                break
            }
            case 'manyComments': {
                formatLikes.sort((a, b) => b._count.comments - a._count.comments)
                break
            }
            case 'popular':
            default: {
                formatLikes.sort((a, b) => b._count.likes - a._count.likes)
                break
            }
        }

        const paginatedPosts = formatLikes.slice(startIndex, startIndex + limit)
        return res.status(200).json({ posts: paginatedPosts })

    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: 'Не' })
    }
})


postRouter.post('/vote', async (req: Request, res: Response) => {
    try {
        const postId = Number(req.body.postId)
        const type = String(req.body.data).toUpperCase() as 'UP' | 'DOWN'
        const userId = Number(req.session.userId)

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Не авторизован' })
        }

        let isRemoved = false
        const currentVote = await dbClient.like.findUnique({
            where: { userId_postId: { userId, postId } }
        })

        if (currentVote && currentVote.type === type) {
            await dbClient.like.delete({ where: { id: currentVote.id } })
            isRemoved = true
        } else {
            await dbClient.like.upsert({
                where: { userId_postId: { userId, postId } },
                update: { type: type },
                create: { userId, postId, type }
            })
        }

        const upVotes = await dbClient.like.count({ where: { postId, type: 'UP' } })
        const downVotes = await dbClient.like.count({ where: { postId, type: 'DOWN' } })
        const newVote = upVotes - downVotes

        return res.status(200).json({
            success: true,
            newRating: newVote,
            currentVote: isRemoved ? null : type
        })

    } catch (e) {
        console.error(e)
        return res.status(500).json({ success: false, message: 'Ошибка сервера' })
    }
})

export default postRouter