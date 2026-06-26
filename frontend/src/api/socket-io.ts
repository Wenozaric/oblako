import { io, Socket } from 'socket.io-client'

export let socket: Socket<any> | null = null

export const socketService = {
    get socket() {
        return socket
    },

    connect: () => {
        if (socket?.connected) return

        socket = io('http://localhost:3000', {
            path: '/my-socket/',
            withCredentials: true,
            autoConnect: false
        })

        socket.on('connect', () => {
        })

        socket.connect()
    },

    disconnect: () => {
        if (socket) {
            socket.disconnect()
            socket = null;
        }
    },

    sendMessage: (roomId: string, ciphertext: string, iv: string, recipientId: number) => {
        if (!socket) return
        socket.emit('chat:send_message', { roomId, text: ciphertext, iv, recipientId })
    },

    onMessage: (callback: (message: any) => void) => {
        if (!socket) return;
        socket.off('chat:receive_message')
        socket.on('chat:receive_message', callback)
    },

    offMessage: () => {
        if (!socket) return;
        socket.off('chat:receive_message')
    },

    getCompanionPublicKey: (roomId: string, recipientId: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!socket) {
                return reject(new Error('Сокет не инициализирован'))
            }

            const requestKey = () => {
                socket!.off('room_data')
                socket!.off('error')

                socket!.emit('join_room', { roomId, recipientId })

                socket!.on('room_data', (data: { roomId: string, publicKey: string }) => {
                    socket!.off('room_data')
                    socket!.off('error')
                    resolve(data.publicKey)
                });

                socket!.on('error', (err: { message: string }) => {
                    socket!.off('room_data')
                    socket!.off('error')
                    reject(new Error(err.message || 'Ошибка сокета'))
                });
            };

            if (!socket.connected) {
                socket.once('connect', requestKey)
            } else {
                requestKey()
            }
        });
    }
};