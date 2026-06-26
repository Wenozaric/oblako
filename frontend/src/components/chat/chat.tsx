import { useEffect, useState, useRef } from 'react'
import { socketService } from '../../api/socket-io'
import { chatService } from '../../api/all-api'
import {
	getOrCreateRoomKey,
	encryptOutgoingMessage,
	decryptIncomingMessage,
} from '../../utils/chatEncryptManager'

interface Message {
	id: string
	text: string
	senderId: number
	createdAt: string
}

interface ChatProps {
	roomId: string
	recipientId: number
	companionName: string
	companionAvatar: string | null
}

export const Chat = ({
	roomId,
	recipientId,
	companionName,
	companionAvatar,
}: ChatProps) => {
	const [messages, setMessages] = useState<Message[]>([])
	const [inputValue, setInputValue] = useState('')
	const [isSecure, setIsSecure] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	useEffect(() => {
		if (!roomId || !recipientId) return

		setMessages([])
		setIsSecure(false)

		socketService.connect()

		const initE2E = async () => {
			try {
				await getOrCreateRoomKey(roomId, recipientId)
				setIsSecure(true)

				const encryptedHistory = await chatService.getChatHistory(roomId)

				if (!encryptedHistory || encryptedHistory.length === 0) {
					setMessages([])
					return
				}

				const decryptedHistory = []
				for (const msg of encryptedHistory) {
					try {
						const clearText = await decryptIncomingMessage(
							roomId,
							msg.senderId,
							msg.text,
							msg.iv,
						)
						decryptedHistory.push({ ...msg, text: clearText })
					} catch (err) {
						console.error(`Ошибка дешифрации сообщения ${msg.id}:`, err)
						decryptedHistory.push({
							...msg,
							text: 'Ошибка расшифровки',
						})
					}
				}
				setMessages(decryptedHistory)
			} catch (err) {
				console.error('Ошибка инициализации или истории:', err)
				setIsSecure(false)
			}
		}
		initE2E()

		socketService.onMessage(async (newMessage: any) => {
			try {
				const decryptedText = await decryptIncomingMessage(
					roomId,
					newMessage.senderId,
					newMessage.text,
					newMessage.iv,
				)

				setMessages((prev) => {
					if (prev.some((msg) => msg.id === newMessage.id)) return prev
					return [...prev, { ...newMessage, text: decryptedText }]
				})
			} catch (err) {
				console.error('Ошибка расшифровки сообщения:', err)
				setMessages((prev) => {
					if (prev.some((msg) => msg.id === newMessage.id)) return prev
					return [
						...prev,
						{ ...newMessage, text: 'Ошибка дешифрования текста' },
					]
				})
			}
		})

		return () => {
			socketService.offMessage()
		}
	}, [roomId, recipientId])

	const handleSendMessage = async (e: any) => {
		e.preventDefault()
		if (!inputValue.trim() || !isSecure) return

		try {
			const { ciphertext, iv } = await encryptOutgoingMessage(
				roomId,
				recipientId,
				inputValue,
			)

			socketService.sendMessage(roomId, ciphertext, iv, recipientId)

			setInputValue('')
		} catch (err) {
			console.error('Ошибка шифрования:', err)
		}
	}

	return (
		<div className='flex h-full w-full flex-col bg-white select-none'>
			<div className='flex shrink-0 items-center justify-between border-b border-gray-100 bg-white py-3.5 pr-4 pl-12 md:px-6 md:py-4 lg:pl-6'>
				<div className='flex min-w-0 items-center gap-3.5'>
					<div className='flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#7c4dff] text-sm font-bold text-white shadow-sm'>
						{companionAvatar ? (
							<img
								src={`http://localhost:3000${companionAvatar}`}
								alt='avatar'
								className='h-full w-full object-cover'
							/>
						) : (
							companionName.slice(0, 2).toUpperCase()
						)}
					</div>
					<div className='min-w-0'>
						<strong className='block truncate text-base font-semibold text-gray-800'>
							{companionName}
						</strong>
					</div>
				</div>

				<div
					className='hidden max-w-[180px] truncate rounded-md bg-gray-100 px-3 py-1.5 font-mono text-[11px] text-gray-400 sm:block'
					title={roomId}
				>
					{roomId}
				</div>
			</div>

			<div className='flex flex-1 flex-col gap-3 overflow-y-auto bg-[#fcfbfe] p-4 md:p-6'>
				{messages.map((msg) => (
					<div
						key={msg.id}
						className={`flex w-full ${
							msg.senderId === recipientId ? 'justify-start' : 'justify-end'
						}`}
					>
						<div
							className={`padding-[10px_16px] max-w-[75%] rounded-2xl p-3 px-4 text-sm leading-relaxed break-words shadow-[0_2px_6px_rgba(0,0,0,0.02)] md:max-w-[65%] ${
								msg.senderId === recipientId
									? 'border border-gray-100 bg-white text-gray-800'
									: 'bg-[#7c4dff] text-white'
							}`}
						>
							{msg.text}
						</div>
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>

			<div className='shrink-0 border-t border-gray-100 bg-white p-3 md:p-4 lg:px-6'>
				<form
					onSubmit={handleSendMessage}
					className='flex w-full items-center gap-2.5 rounded-full bg-gray-100 p-1.5'
				>
					<input
						type='text'
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder={isSecure ? 'Напишите сообщение...' : 'Ожидайте...'}
						disabled={!isSecure}
						className='flex-1 rounded-full border-none bg-transparent px-4 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none disabled:cursor-not-allowed'
					/>
					<button
						type='submit'
						disabled={!isSecure}
						className='shrink-0 cursor-pointer rounded-full border-none bg-[#7c4dff] px-5 py-2 text-sm font-bold text-white transition-all duration-200 hover:bg-[#651fff] active:scale-[0.97] disabled:scale-100 disabled:cursor-not-allowed disabled:bg-gray-300 md:px-6'
					>
						Отправить
					</button>
				</form>
			</div>
		</div>
	)
}
