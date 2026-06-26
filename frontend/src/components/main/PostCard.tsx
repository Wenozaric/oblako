import { useState } from 'react'
import { MessageSquare, Bookmark } from 'lucide-react'

import { useEffect } from 'react'
import { postsService } from '../../api/all-api'
import { useSearchParams } from 'react-router-dom'
import type { Posts } from '../../types/api'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface ProbsData {
	data: Posts
	key: number
}

const Post = ({ data }: ProbsData) => {
	//закреп ( потом реализую )
	console.log(data)
	const [isBookmarked, setIsBookmarked] = useState(false)

	//лайки
	const [likes, setLikes] = useState(data._count.likes)
	const [isLoading, setIsLoading] = useState(false)
	const [isLiked, setIsLiked] = useState<boolean | null>(
		data.userVote === 'UP' ? true : data.userVote === 'DOWN' ? false : null,
	)

	console.log(likes, data.id)

	const handleVote = async (type: 'UP' | 'DOWN') => {
		if (isLoading == false) {
			setIsLoading(true)
			try {
				const res = await postsService.vote(type, data.id)
				console.log(res)
				if (res.success) {
					setIsLiked(
						res.currentVote === 'UP'
							? true
							: res.currentVote === 'DOWN'
								? false
								: null,
					)
					setLikes(() => res.newRating)
				}
			} catch (e) {
				console.log(e)
			} finally {
				setIsLoading(false)
			}
		}
	}

	return (
		<div className='mb-4 w-full max-w-[650px] rounded-xl border border-purple-100/50 bg-white p-4 shadow-[0_10px_30px_-10px_rgba(147,51,234,0.08)] transition-all duration-300 hover:shadow-[0_15px_35px_-5px_rgba(147,51,234,0.12)] md:mb-5 md:rounded-2xl md:p-6'>
			<div className='mb-3 flex items-center justify-between md:mb-4'>
				<div className='flex items-center gap-3'>
					<img
						src={`http://localhost:3000${data.author.avatarUrl}`}
						alt='Аватар автора'
						className='h-9 w-9 rounded-full object-cover ring-2 ring-purple-100 md:h-10 md:w-10'
					/>
					<div>
						<div className='flex items-center gap-2'>
							<span className='text-xs font-medium text-gray-700 md:text-sm'>
								{data.author.username}
							</span>
						</div>
						<span className='text-[11px] text-gray-400 md:text-xs'>
							{formatDistanceToNow(new Date(data.createdAt), {
								addSuffix: true,
								locale: ru,
							})}
						</span>
					</div>
				</div>
			</div>

			<div className='group cursor-pointer space-y-2 md:space-y-3'>
				<h2 className='text-lg leading-snug font-bold break-words text-gray-900 transition-colors group-hover:text-[#7A5CFF] md:text-xl'>
					{data.name}
				</h2>

				<p className='line-clamp-3 text-xs leading-relaxed break-words text-gray-600 md:text-sm'>
					{data.description}
				</p>
			</div>

			<div className='mt-3 mb-4 flex flex-wrap gap-1.5 md:mt-4 md:mb-6 md:gap-2'>
				{['Дизайн интерфейсов', 'Веб-разработка', 'Тренды 2026'].map((tag) => (
					<span
						key={tag}
						className='cursor-pointer rounded-lg bg-gray-50 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-gray-500 transition-all hover:bg-purple-50 hover:text-[#7A5CFF] md:px-3 md:py-1.5 md:text-xs'
					>
						#{tag}
					</span>
				))}
			</div>

			<div className='flex items-center justify-between border-t border-gray-100 pt-3 md:pt-4'>
				<div className='flex items-center rounded-xl bg-gray-50 p-0.5 text-xs font-medium md:p-1 md:text-sm'>
					<button
						onClick={() => handleVote('UP')}
						className={`rounded-lg px-2 py-1 transition-all md:px-2.5 md:py-1.5 ${isLiked === true ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-emerald-500'}`}
					>
						▲
					</button>
					<span
						className={`min-w-[24px] px-1 text-center font-bold md:min-w-[28px] md:px-2 ${likes > 0 ? 'text-emerald-600' : likes < 0 ? 'text-rose-500' : 'text-gray-400'}`}
					>
						{likes > 0 ? `+${likes}` : likes}
					</span>
					<button
						onClick={() => handleVote('DOWN')}
						className={`rounded-lg px-2 py-1 transition-all md:px-2.5 md:py-1.5 ${isLiked === false ? 'bg-rose-500 text-white' : 'text-gray-400 hover:text-rose-500'}`}
					>
						▼
					</button>
				</div>

				<div className='flex items-center gap-1'>
					<button className='flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs text-gray-500 transition-all hover:bg-purple-50 hover:text-[#7A5CFF] md:gap-2 md:px-3 md:py-2 md:text-sm'>
						<MessageSquare size={16} className='md:h-[18px] md:w-[18px]' />
						<span className='font-medium'>0</span>
					</button>
				</div>

				<button
					onClick={() => setIsBookmarked(!isBookmarked)}
					className={`rounded-xl p-1.5 transition-all md:p-2 ${isBookmarked ? 'bg-purple-50 text-[#7A5CFF]' : 'text-gray-500 hover:bg-purple-50 hover:text-[#7A5CFF]'}`}
				>
					<Bookmark
						size={16}
						className='md:h-[18px] md:w-[18px]'
						fill={isBookmarked ? '#7A5CFF' : 'none'}
					/>
				</button>
			</div>
		</div>
	)
}

export const PostCard = () => {
	const [postsData, setPostsData] = useState<Posts[]>([])
	const [searchParams, _setSearchParams] = useSearchParams()
	const currentFilter = searchParams.get('tab') || 'popular'

	const [loading, setLoading] = useState<boolean>(false)
	const [hasMore, setHasMore] = useState<boolean>(true)
	const limit = 10

	const loadFirstPage = async () => {
		setLoading(true)
		setHasMore(true)
		try {
			const res = await postsService.fetchPosts(currentFilter, 0, limit)
			if (res?.posts) {
				if (res.posts.length < limit) setHasMore(false)
				setPostsData(res.posts)
			}
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}

	const loadNextPage = async () => {
		if (loading || !hasMore) return

		setLoading(true)

		try {
			const res = await postsService.fetchPosts(
				currentFilter,
				postsData.length,
				limit,
			)

			if (res?.posts) {
				if (res.posts.length < limit) {
					setHasMore(false)
				}

				setPostsData((prev) => {
					const uniqueNewPosts = res.posts.filter(
						(newPost) => !prev.some((oldPost) => oldPost.id === newPost.id),
					)
					return [...prev, ...uniqueNewPosts]
				})
			}
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadFirstPage()
	}, [searchParams])

	useEffect(() => {
		const handleScroll = () => {
			const { scrollTop, clientHeight, scrollHeight } = document.documentElement

			if (scrollHeight - scrollTop - clientHeight < 150) {
				loadNextPage()
			}
		}

		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [postsData.length, hasMore, loading])

	console.log(postsData)

	return (
		<div className='flex w-full flex-col items-center px-4 md:px-0'>
			{postsData?.length > 0 &&
				postsData.map((post: Posts, index) => <Post data={post} key={index} />)}
		</div>
	)
}
