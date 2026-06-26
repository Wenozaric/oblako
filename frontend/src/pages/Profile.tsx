import { useParams } from 'react-router-dom'
import { profileService } from '../api/all-api'
import { Header } from '../components/main/header'
import { useEffect, useState } from 'react'
import { type UserProfile } from '../types/api'
import { Pen, X, Upload, Pipette } from 'lucide-react'
import { PostsTop } from '../components/profile/postsTop'
import { CreatePostComponent } from '../components/profile/createPost'

const ProfilePage = () => {
	const { idUser } = useParams()

	const [profileData, setProfileData] = useState<UserProfile | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [editorMode, setEditorMode] = useState<boolean>(false)

	const [newUserName, settingNewUserName] = useState<boolean>(false)
	const [isOwner, setIsOwner] = useState<boolean | null>(null)

	const [terUsername, setTerUsername] = useState<string>('')

	const [subscribed, setSubscribed] = useState<boolean>(false)

	const [tempColor, setTempColor] = useState('#ddd6fe')

	console.log(profileData)
	useEffect(() => {
		const savedColor = profileData?.secondData?.bannerColor
		if (savedColor) {
			setTempColor(savedColor)
		}
	}, [profileData])

	const getProfile = async () => {
		try {
			const res = await profileService.getMe()
			setProfileData(res)
			console.log(res)
			setIsOwner(true)
			setIsLoading(false)
		} catch (e) {
			console.error(e)
		}
	}

	const getSbProfile = async () => {
		try {
			const res = await profileService.getSb(Number(idUser))
			setProfileData(res)
			if (res.data.email) setIsOwner(true)
			else setIsOwner(false)
			setIsLoading(false)

			if (res.secondData.isSubcribed) setSubscribed(true)
		} catch (e) {
			console.error(e)
		}
	}

	useEffect(() => {
		if (!idUser) {
			getProfile()
		} else {
			console.log(idUser)
			getSbProfile()
		}
	}, [])

	const updateUsername = (newUsername: string) => {
		setTerUsername(newUsername)
	}

	const handleEditButtonClick = () => {
		if (isOwner) {
			if (!editorMode) {
				setTerUsername(profileData?.data.username || '')
				setEditorMode(true)
			} else {
				checkUsername()
				setEditorMode(false)
				settingNewUserName(false)
			}
		} else {
			SubcribeOrUnsubcribe()
		}
	}

	const uploadPng = async (e: any) => {
		const file = e.target.files?.[0]
		if (!file) return null

		const formData = new FormData()
		formData.append('avatar', file)

		try {
			const res = await profileService.loadPng(formData)
			setProfileData((prev: any) => ({
				...prev,
				data: {
					...prev.data,
					avatarUrl: res.avatarUrl,
				},
			}))
		} catch (error) {
			console.error('Ошибка загрузки:', error)
		}
	}

	const checkUsername = async () => {
		const savedColor = profileData?.secondData?.bannerColor || '#ddd6fe'
		const isUsernameChanged =
			terUsername && terUsername.trim() !== profileData?.data.username
		const isColorChanged = tempColor !== savedColor

		if (isUsernameChanged || isColorChanged) {
			try {
				if (profileData?.data.username !== undefined) {
					const res = await profileService.update({
						username: isUsernameChanged
							? terUsername
							: profileData.data.username,
						bannerColor: tempColor,
					})

					if (res.success) {
						setProfileData((prev: any) => ({
							...prev,
							data: {
								...prev.data,
								username: isUsernameChanged ? terUsername : prev.data.username,
							},
							secondData: {
								...prev.secondData,
								bannerColor: tempColor,
							},
						}))

						setTerUsername('')
					}
				}
			} catch (e) {
				console.log(e)
			}
		}
	}

	const SubcribeOrUnsubcribe = async () => {
		if (!subscribed) {
			try {
				if (!isNaN(Number(idUser))) {
					const req = await profileService.subscribe(Number(idUser))
					console.log(req.success)
					if (req.success) setSubscribed(true)
				}
			} catch (e) {
				console.log(e)
			}
		} else {
			try {
				if (!isNaN(Number(idUser))) {
					const req = await profileService.unsubscribe(Number(idUser))
					console.log(req.success)
					if (req.success) setSubscribed(false)
				}
			} catch (e) {
				console.log(e)
			}
		}
	}

	if (isLoading) {
		return (
			<div className='flex h-screen w-screen flex-col bg-gradient-to-tr from-[#EFE3F2] via-[#FFFDFE] to-[#F5EEF7] font-sans antialiased'>
				<Header />
				<div className='flex w-full flex-row items-stretch justify-center gap-4 p-5'>
					<div className='flex h-full w-[600px] animate-pulse flex-col overflow-hidden rounded-3xl border border-violet-100/50 bg-white shadow-[0_10px_40px_-5px_rgba(119,97,246,0.05)]'>
						<div className='relative h-32 shrink-0 bg-gradient-to-r from-violet-200/50 to-violet-300/40' />

						<div className='relative flex flex-1 flex-col justify-between px-6 pb-6'>
							<div className='absolute -top-12 left-6'>
								<div className='h-24 w-24 rounded-2xl border-4 border-white bg-violet-200 shadow-sm' />
							</div>

							<div className='flex flex-col gap-4 pt-16 sm:flex-row sm:items-center sm:justify-between'>
								<div className='flex-1 space-y-3'>
									<div className='h-6 w-2/3 rounded-lg bg-violet-200' />
									<div className='h-4 w-1/3 rounded-lg bg-violet-100' />
								</div>

								<div className='flex shrink-0'>
									<div className='h-9 w-32 rounded-xl bg-violet-200' />
								</div>
							</div>

							<div className='mt-auto flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-violet-50 pt-3 text-sm'>
								<div className='flex items-center gap-2'>
									<div className='h-4 w-16 rounded bg-violet-100' />
								</div>
								<span className='hidden h-1 w-1 rounded-full bg-violet-200 sm:inline-block' />

								<div className='flex items-center gap-2'>
									<div className='h-4 w-16 rounded bg-violet-100' />
								</div>
								<span className='hidden h-1 w-1 rounded-full bg-violet-200 sm:inline-block' />

								<div className='flex items-center gap-2'>
									<div className='h-4 w-24 rounded bg-violet-100' />
								</div>
								<span className='hidden h-1 w-1 rounded-full bg-violet-200 sm:inline-block' />

								<div className='flex items-center gap-2'>
									<div className='h-4 w-20 rounded bg-violet-100' />
								</div>
							</div>
						</div>
					</div>

					<div className='flex h-full w-[400px] animate-pulse flex-col justify-between gap-6 rounded-3xl border border-violet-100/50 bg-white p-6 shadow-[0_10px_40px_-5px_rgba(119,97,246,0.05)]'>
						<div>
							<div className='mb-6 h-5 w-1/3 rounded-lg bg-violet-200' />

							<div className='flex flex-col gap-5'>
								{[1, 2, 3].map((i) => (
									<div key={i} className='flex items-center gap-3'>
										<div className='h-10 w-10 shrink-0 rounded-xl bg-violet-100' />
										<div className='flex-1 space-y-2'>
											<div className='h-3.5 w-3/4 rounded bg-violet-200' />
											<div className='h-3 w-1/2 rounded bg-violet-100' />
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className='flex h-full min-w-[200px] grow animate-pulse flex-col justify-between gap-5 rounded-3xl border border-violet-100/50 bg-white p-6 shadow-[0_10px_40px_-5px_rgba(119,97,246,0.05)]'>
						<div>
							<div className='mb-6 h-5 w-1/3 rounded-lg bg-violet-200' />

							<div className='space-y-5'>
								<div className='space-y-2'>
									<div className='h-3 w-20 rounded bg-violet-100' />
									<div className='h-10 w-full rounded-xl bg-violet-50/70' />
								</div>
								<div className='space-y-2'>
									<div className='h-3 w-20 rounded bg-violet-100' />
									<div className='h-24 w-full rounded-xl bg-violet-50/70' />
								</div>
							</div>
						</div>
						<div className='mt-auto h-11 w-full rounded-xl bg-violet-200' />
					</div>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className='flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-gradient-to-tr from-[#EFE3F2] via-[#FFFDFE] to-[#F5EEF7] font-sans antialiased'>
				<Header />

				<div className='flex w-full flex-row items-start gap-4 p-4 md:p-5 flex-wrap'>
					<div className='w-full max-w-[650px] shrink-0 overflow-hidden rounded-3xl border border-violet-100/50 bg-white shadow-[0_10px_40px_rgba(139,92,246,0.05)] lg:w-[600px]'>
						<div
							className='relative h-32 w-full overflow-hidden'
							style={{
								background: `linear-gradient(to right, #ffffff, ${tempColor})`,
							}}
						>
							{editorMode ? (
								<div
									className='absolute top-5 right-5 cursor-pointer'
									onClick={(e) => {
										e.currentTarget.querySelector('input')?.click()
									}}
								>
									<Pipette />
									<input
										type='color'
										className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
										value={tempColor}
										onChange={(e) => setTempColor(e.target.value)}
									/>
								</div>
							) : (
								<></>
							)}
						</div>
						<div className='relative px-6 pb-6'>
							<div className='absolute -top-10 left-4 z-10 h-20 w-20 shrink-0 md:-top-12 md:left-6 md:h-24 md:w-24'>
								{editorMode ? (
									<label className='group relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-violet-50/50 text-xl font-bold text-violet-400 shadow-md transition-colors hover:bg-violet-100/50'>
										{profileData?.data.avatarUrl ? (
											<img
												src={`http://localhost:3000${profileData.data.avatarUrl}`}
												alt='Avatar Preview'
												className='absolute top-0 left-0 h-full w-full object-cover opacity-40 transition-opacity group-hover:opacity-60'
											/>
										) : null}
										<Upload className='z-10 h-5 w-5 text-violet-600 drop-shadow-sm' />
										<input
											type='file'
											accept='image/*'
											className='hidden'
											onChange={(e) => uploadPng(e)}
										/>
									</label>
								) : profileData?.data.avatarUrl ? (
									<div className='h-full w-full overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md'>
										{profileData?.data.avatarUrl !== '' ? (
											<img
												src={`http://localhost:3000${profileData.data.avatarUrl}`}
												alt='Avatar'
												className='h-full w-full object-cover'
											/>
										) : (
											<div className='flex h-full items-center justify-center text-lg font-bold text-violet-400 md:text-xl'>
												Ава
											</div>
										)}
									</div>
								) : (
									<div className='flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-violet-50/30 text-lg font-bold text-violet-400 shadow-md md:text-xl'>
										Ава
									</div>
								)}
							</div>

							<div className='flex min-w-0 flex-col gap-4 border-b border-violet-50 pt-12 pb-4 sm:flex-row sm:items-center sm:justify-between md:pt-16'>
								<div className='w-full min-w-0 flex-1'>
									<h2 className='flex items-center justify-between gap-2 text-xl font-bold tracking-tight text-violet-950 md:text-2xl'>
										{!newUserName ? (
											<div
												className='w-full pr-2 text-xl font-bold break-words whitespace-normal md:text-2xl'
												title={
													terUsername ? terUsername : profileData?.data.username
												}
											>
												{terUsername ? terUsername : profileData?.data.username}
											</div>
										) : (
											<input
												className='w-full border-b border-violet-200 bg-transparent p-0 text-xl font-bold text-violet-950 focus:border-violet-400 focus:outline-none md:text-2xl'
												value={
													terUsername ? terUsername : profileData?.data.username
												}
												onChange={(e) => updateUsername(e.target.value)}
											/>
										)}
										{!editorMode ? (
											<></>
										) : (
											<button
												className='shrink-0 text-violet-400 transition-colors hover:text-violet-600'
												onClick={() => settingNewUserName(!newUserName)}
											>
												{!newUserName ? (
													<Pen className='h-5 w-5 cursor-pointer' />
												) : (
													<X className='h-5 w-5 cursor-pointer' />
												)}
											</button>
										)}
									</h2>
									<div className='mt-1 text-sm font-medium break-all text-violet-400'>
										{isOwner ? 'Ваш айди' : 'Айди'}
										<span className='font-mono font-semibold text-violet-500/80'>
											{` @${profileData?.data.id}`}
										</span>
									</div>
								</div>
								
								<div className='flex w-full shrink-0 sm:w-auto'>
									<button
										className={`w-full rounded-full px-5 py-2.5 text-center text-sm font-medium tracking-wide transition-all duration-150 active:scale-[0.98] sm:w-auto ${
											!editorMode
												? !subscribed
													? 'bg-violet-500 text-white shadow-sm shadow-violet-100 hover:bg-violet-600'
													: 'border border-violet-100 bg-violet-50 text-violet-600 hover:bg-violet-100'
												: 'border border-violet-100 bg-violet-50 text-violet-600 hover:bg-violet-100'
										}`}
										onClick={() => handleEditButtonClick()}
									>
										{isOwner
											? editorMode
												? 'Закончить редактирование'
												: 'Редактировать'
											: !subscribed
												? 'Подписаться'
												: 'Отписаться'}
									</button>
								</div>
							</div>
							<div className='mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 pt-3 text-sm'>
								<div className='flex items-center'>
									<div className='mr-2 font-extrabold text-violet-600'>
										{profileData?.secondData.likes}
									</div>
									<div className='text-violet-400'>рейтинг</div>
								</div>

								<span className='hidden h-1 w-1 rounded-full bg-violet-200 sm:inline-block' />

								<div className='flex items-center'>
									<div className='mr-2 font-extrabold text-violet-950'>
										{profileData?.secondData.postsCount}
									</div>
									<div className='text-violet-400'>поста</div>
								</div>

								<span className='hidden h-1 w-1 rounded-full bg-violet-200 sm:inline-block' />

								<div className='flex items-center'>
									<div className='mr-2 font-extrabold text-violet-950'>
										{profileData?.secondData.followers}
									</div>
									<div className='text-violet-400'>подписчиков</div>
								</div>

								<span className='hidden h-1 w-1 rounded-full bg-violet-200 sm:inline-block' />

								<div className='flex items-center'>
									<div className='mr-2 font-extrabold text-violet-950'>
										{profileData?.secondData.following}
									</div>
									<div className='text-violet-400'>подписок</div>
								</div>
							</div>
						</div>
					</div>
					<div className='flex w-[400px] flex-col gap-4 rounded-3xl border border-violet-100/50 bg-white p-6 font-sans antialiased shadow-[0_10px_40px_rgba(139,92,246,0.05)]'>
						<div className='flex items-center justify-between border-b border-violet-50 pb-3'>
							<h3 className='text-lg font-bold tracking-tight text-violet-950'>
								Топ 3 постов
							</h3>
						</div>

						<div className='flex h-[100%] flex-col'>
							<PostsTop posts={profileData?.secondData.posts} />
						</div>
					</div>
					{isOwner ? <CreatePostComponent /> : <></>}
				</div>
			</div>
		</>
	)
}

export default ProfilePage
