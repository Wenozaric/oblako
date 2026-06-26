import { useEffect, useState } from 'react'
import { Chat } from './chat'
import { chatService } from '../../api/all-api'

interface Room {
	roomId: string
	recipientId: number
	companionName: string
	companionAvatar: string | null
	lastMessage: string
}

export const Messenger = () => {
	const [rooms, setRooms] = useState<Room[]>([])
	const [activeRoom, setActiveRoom] = useState<Room | null>(null)
	const [loading, setLoading] = useState(true)
	const [userIdInput, setUserIdInput] = useState('')
	const [errorMsg, setErrorMsg] = useState('')


	const loadMyChats = async () => {
		try {
			const data = await chatService.getMyRooms()
			setRooms(data)
			console.log(data)

			if (data.length > 0 && !activeRoom) {
				setActiveRoom(data[0])
			}
		} catch (err: any) {
			console.error('Ошибка загрузки комнат:', err)
			setErrorMsg('Не удалось загрузить чаты')
		} finally {
			setLoading(false)
		}
	}

	const handleBackToList = () => {
		setActiveRoom(null)
	}

	useEffect(() => {
		loadMyChats()
	}, [])

	const handleCreateChatSubmit = async (e: any) => {
		e.preventDefault()
		setErrorMsg('')
		const targetUserId = Number(userIdInput)
		if (!userIdInput.trim() || isNaN(targetUserId)) {
			setErrorMsg('Введите числовой ID')
			return
		}

		try {
			const data = await chatService.createChat(targetUserId)
			setUserIdInput('')

			const newActiveRoom = {
				roomId: String(data.roomId),
				recipientId: targetUserId,
				companionName: `Пользователь #${targetUserId}`,
				companionAvatar: null,
				lastMessage: 'Чат инициализирован',
			}

			setActiveRoom(newActiveRoom)
			const freshRooms = await chatService.getMyRooms()
			setRooms(freshRooms)
		} catch (err: any) {
			const serverMessage =
				err.response?.data?.message || 'Не удалось создать чат'
			setErrorMsg(serverMessage)
		}
	}

	if (loading)
		return (
			<div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
				Загрузка диалогов...
			</div>
		)

	return (
		<div className='relative mx-auto flex h-[calc(100dvh-80px)] w-full max-w-[1200px] overflow-hidden bg-white font-sans select-none'>
			<div
				className={`box-border h-full w-full flex-col gap-5 border-r border-gray-100 bg-gray-50/50 p-4 lg:w-[350px] lg:shrink-0 lg:p-5 ${
					activeRoom ? 'hidden lg:flex' : 'flex'
				}`}
			>
				<div className='rounded-xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]'>
					<h5 className='m-0 mb-2.5 text-sm font-bold text-gray-700'>
						Создать чат по ID
					</h5>
					<form onSubmit={handleCreateChatSubmit} className='flex gap-2'>
						<input
							type='text'
							placeholder='ID пользователя'
							value={userIdInput}
							onChange={(e) => setUserIdInput(e.target.value)}
							className='flex-1 rounded-lg border border-gray-200 p-2.5 text-xs transition-all outline-none focus:border-[#7c4dff] md:text-sm'
						/>
						<button
							type='submit'
							className='cursor-pointer rounded-lg border-none bg-[#7c4dff] px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#693ce6] active:scale-[0.97] md:text-sm'
						>
							Ок
						</button>
					</form>
					{errorMsg && (
						<p className='color-[#ff1744] m-0 mt-2 text-xs font-medium'>
							{errorMsg}
						</p>
					)}
				</div>

				<div className='flex-1 overflow-y-auto pr-0.5'>
					<h4 className='m-0 mb-3 text-base font-bold text-gray-800'>
						Мои диалоги
					</h4>
					{rooms.length === 0 ? (
						<p className='text-sm text-gray-400'>
							У вас пока нет активных чатов.
						</p>
					) : (
						rooms.map((room) => (
							<div
								key={room.roomId}
								onClick={() => setActiveRoom(room)}
								className={`mb-2 flex cursor-pointer items-center gap-3 rounded-xl border p-3 shadow-[0_1px_3px_rgba(0,0,0,0.01)] transition-all duration-200 ${
									activeRoom?.roomId === room.roomId
										? 'border-[#7c4dff] bg-[#f1e6ff]'
										: 'border-gray-100 bg-white hover:bg-gray-50'
								}`}
							>
								<div className='flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e0d4ff] text-sm font-bold text-[#7c4dff]'>
									{room.companionAvatar ? (
										<img
											src={`http://localhost:3000${room.companionAvatar}`}
											alt='avatar'
											className='h-full w-full object-cover'
										/>
									) : (
										room.companionName.slice(0, 2).toUpperCase()
									)}
								</div>
								<div className='min-w-0 flex-1'>
									<strong className='block truncate text-sm font-semibold text-gray-800'>
										{room.companionName}
									</strong>
									<small className='mt-0.5 block truncate text-xs text-gray-400'>
										{room.lastMessage}
									</small>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			<div
				className={`relative h-full w-full flex-col p-0 lg:flex-1 ${
					!activeRoom ? 'hidden lg:flex' : 'flex'
				}`}
			>
				{activeRoom ? (
					<div className='relative flex h-full w-full flex-col'>
						<button
							onClick={handleBackToList}
							className='absolute top-[12px] left-3 z-50 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-[#7c4dff]/80 text-sm font-bold text-white shadow-md backdrop-blur-sm transition-all hover:bg-[#7c4dff] active:scale-90 lg:hidden'
						>
							←
						</button>

						<div className='h-full w-full flex-1'>
							<Chat
								roomId={activeRoom.roomId}
								recipientId={activeRoom.recipientId}
								companionName={activeRoom.companionName}
								companionAvatar={activeRoom.companionAvatar}
							/>
						</div>
					</div>
				) : (
					<div className='box-border flex h-full w-full items-center justify-center p-5 text-center text-sm text-gray-400'>
						Выберите чат из списка слева, чтобы начать общение
					</div>
				)}
			</div>
		</div>
	)
}
