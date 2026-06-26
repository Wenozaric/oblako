import { useState } from 'react'
import { postsService } from '../../api/all-api'

interface CreatePost {
	name: string
	desciption: string
}

export const CreatePostComponent = () => {
	const [postData, setPostData] = useState<CreatePost>({
		name: '',
		desciption: '',
	})
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const changeInputHandler = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		field: 'name' | 'desciption',
	) => {
		setError(null)
		setPostData((prev) => ({
			...prev,
			[field]: e.target.value,
		}))
	}

	const handleCreatePost = async () => {
		if (!postData.name.trim() || !postData.desciption.trim()) {
			setError('Заполните все поля формы')
			return
		}

		setIsLoading(true)
		try {
			const res = await postsService.createPost(postData)
			if (res && res.success) {
				setPostData({ name: '', desciption: '' })
				window.location.reload()
			} else {
				setError('Не удалось создать публикацию')
			}
		} catch (e: any) {
			setError(e.response?.data?.message || 'Ошибка при создании поста')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='w-full max-w-[650px] rounded-2xl border border-purple-100/50 bg-white p-5 shadow-[0_10px_30px_-10px_rgba(147,51,234,0.08)] md:p-6'>
			<div className='border-b border-violet-50 pb-3'>
				<h3 className='text-lg font-bold tracking-tight text-violet-950'>
					Создать публикацию
				</h3>
			</div>

			<div className='mt-4 flex flex-col gap-4'>
				<div className='flex flex-col gap-1.5'>
					<label className='text-sm font-bold text-violet-950/80'>
						Название
					</label>
					<input
						type='text'
						value={postData.name}
						placeholder='О чём ваш пост?'
						className='w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 focus:border-[#7A5CFF] focus:outline-none'
						onChange={(e) => changeInputHandler(e, 'name')}
					/>
				</div>

				<div className='flex flex-col gap-1.5'>
					<label className='text-sm font-bold text-violet-950/80'>
						Описание
					</label>
					<textarea
						value={postData.desciption}
						placeholder='Поделитесь подробностями...'
						rows={6}
						style={{ resize: 'none' }} 
						className='min-h-[120px] w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 focus:border-[#7A5CFF] focus:outline-none'
						onChange={(e) => changeInputHandler(e, 'desciption')}
					/>
				</div>
			</div>

			<div
				className={`overflow-hidden transition-all duration-300 ${error ? 'mt-3 max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}
			>
				<p className='text-sm font-medium text-rose-500'>{error}</p>
			</div>

			<button
				disabled={isLoading}
				className='mt-5 w-full rounded-xl bg-[#7A5CFF] py-3 text-sm font-bold tracking-wide text-white shadow-md shadow-purple-500/10 transition-all duration-200 hover:bg-[#651fff] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50'
				onClick={handleCreatePost}
			>
				{isLoading ? 'Публикация...' : 'Опубликовать'}
			</button>
		</div>
	)
}
