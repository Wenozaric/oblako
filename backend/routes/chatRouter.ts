import express, { Request, Response } from 'express'
import { dbClient } from '../src/db/prismaClient.js'

const chatRouter = express.Router()

chatRouter.post('/create', async (req: Request, res: Response) => {
    try {
        const currentUserId = req.session.userId
        const { secondUser } = req.body
        if (!currentUserId) {
            return res.status(401).json({ message: 'Вы не авторизованы. Войдите в аккаунт заново.' })
        }

        if (!secondUser) {
            return res.status(400).json({ message: 'ID собеседника обязателен для создания чата.' })
        }

        if (Number(currentUserId) === Number(secondUser)) {
            return res.status(400).json({ message: 'Нельзя создать чат с самим собой.' })
        }

        const targetUser = await dbClient.user.findUnique({
            where: { id: Number(secondUser) }
        })

        if (!targetUser) {
            return res.status(404).json({ message: 'Пользователь с таким ID не существует в системе.' })
        }

        const existingChat = await dbClient.chatRoom.findFirst({
            where: {
                AND: [
                    { users: { some: { id: Number(currentUserId) } } },
                    { users: { some: { id: Number(secondUser) } } }
                ]
            }
        })

        if (existingChat) {
            return res.status(200).json({ roomId: existingChat.id, isNew: false })
        }

        const newChat = await dbClient.chatRoom.create({
            data: {
                users: {
                    connect: [
                        { id: Number(currentUserId) },
                        { id: Number(secondUser) }
                    ]
                }
            }
        })

        return res.status(200).json({ roomId: newChat.id, isNew: true})

    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: 'Не' })
    }
})

chatRouter.get('/my-rooms', async (req, res) => {
    try {
        const currentUserId = req.session?.userId; // Достаем ID залогиненного юзера из сессии

        if (!currentUserId) {
            return res.status(401).json({ error: 'Не авторизован' });
        }

        // Ищем все комнаты, где в массиве users есть текущий пользователь
        const rooms = await dbClient.chatRoom.findMany({
            where: {
                users: {
                    some: { id: currentUserId }
                }
            },
            include: {
                // Обязательно подтягиваем участников комнат, чтобы узнать, КТО собеседник
                users: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true
                    }
                },
                // Можно заодно подтянуть последнее сообщение для превью в списке
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        // Форматируем данные для фронтенда, чтобы сразу выдать recipientId
        const formattedRooms = rooms.map(room => {
            // Собеседник — это тот юзер, чей ID НЕ равен ID текущего пользователя
            const companion = room.users.find(u => u.id !== currentUserId);

            return {
                roomId: room.id,
                createdAt: room.createdAt,
                recipientId: companion ? companion.id : null,
                companionName: companion ? companion.username : 'Канал / Группа',
                companionAvatar: companion ? companion.avatarUrl : null,
                lastMessage: room.messages[0]?.text || 'Нет сообщений'
            };
        });

        res.json(formattedRooms);
    } catch (error) {
        console.error('Ошибка получения комнат:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
})

chatRouter.get('/history/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const currentUserId = req.session?.userId;

        if (!currentUserId) return res.status(401).json({ error: 'Не авторизован' });

        // Тянем сообщения из Prisma для конкретной комнаты
        const messages = await dbClient.message.findMany({
            where: { chatRoomId: roomId },
            orderBy: { createdAt: 'asc' } // Сортируем от старых к новым
        });

        res.json(messages);
    } catch (error) {
        console.error('Ошибка получения истории чата:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

export default chatRouter