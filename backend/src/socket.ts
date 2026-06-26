import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import sharedsession from 'express-socket.io-session';
import { dbClient } from './db/prismaClient.js';

export const initSocket = (httpServer: HttpServer, sessionMiddleware: any) => {
    const io = new Server(httpServer, {
        path: '/my-socket/',
        cors: {
            origin: ['http://localhost:5173', 'http://localhost'],
            credentials: true
        }
    });

    io.use(sharedsession(sessionMiddleware, {
        autoSave: true
    }) as any);

    io.on('connection', (socket: any) => {
        const currentUserId = socket.handshake.session?.userId;
        console.log('Подключился пользователь:', currentUserId);

        if (currentUserId) {
            socket.join(`user_${currentUserId}`);
        }

        socket.on('join_room', async ({ roomId, recipientId }: { roomId: string, recipientId: number }) => {
            try {
                if (!currentUserId) return socket.emit('error', { message: 'Вы не авторизованы' });

                socket.join(roomId);

                const companion = await dbClient.user.findUnique({
                    where: { id: Number(recipientId) },
                    select: { publicKey: true }
                });

                if (!companion || !companion.publicKey) {
                    return socket.emit('error', { message: 'Публичный ключ собеседника не найден' });
                }

                socket.emit('room_data', { roomId, publicKey: companion.publicKey });
            } catch (error) {
                console.error(error);
            }
        });

        socket.on('chat:send_message', async ({ roomId, text, iv, recipientId }: { roomId: string, text: string, iv: string, recipientId: number }) => {
            try {
                if (!currentUserId) return socket.emit('error', { message: 'Вы не авторизованы' });

                const savedMessage = await dbClient.message.create({
                    data: {
                        text: text,
                        iv: iv,
                        chatRoomId: roomId,
                        senderId: currentUserId
                    },
                    include: {
                        sender: { select: { username: true, avatarUrl: true } }
                    }
                });

                const messagePayload = {
                    id: savedMessage.id,
                    text: savedMessage.text,
                    iv: savedMessage.iv,
                    senderId: savedMessage.senderId,
                    roomId: roomId,
                    createdAt: savedMessage.createdAt,
                    sender: savedMessage.sender
                };

                io.to(roomId).emit('chat:receive_message', messagePayload);

                if (Number(recipientId) !== currentUserId) {
                    io.to(`user_${recipientId}`).emit('chat:receive_message_background', messagePayload);
                }

            } catch (error) {
                console.error(error);
            }
        });
    });

    return io;
};