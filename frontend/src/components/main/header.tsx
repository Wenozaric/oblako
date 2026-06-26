import { MessageCircleMore } from 'lucide-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

export const Header = () => {
	const navigate = useNavigate()
	const url = useLocation()
	const path = url.pathname

	const [searchParams, setSearchParams] = useSearchParams()
	const currentFilter = searchParams.get('tab') || 'popular'

	const changeType = (newType: string) => {
		setSearchParams({ tab: newType })
	}

	return (
		<div className='sticky top-0 z-50 flex w-full flex-col bg-white px-4 shadow-sm select-none md:flex-row md:px-6'>
			<div className='flex h-16 w-full shrink-0 items-center justify-between gap-4 md:h-20 md:w-auto md:justify-start'>
				<div className='flex items-center gap-2 md:gap-4'>
					<svg
						className='h-10 w-10 fill-[url(#cloud-clean-gradient)] md:h-12 md:w-12'
						viewBox='0 0 24 24'
					>
						<defs>
							<linearGradient
								id='cloud-clean-gradient'
								x1='0%'
								y1='0%'
								x2='100%'
								y2='100%'
							>
								<stop offset='0%' stopColor='#ebe9f3' />
								<stop offset='100%' stopColor='#986ee0' />
							</linearGradient>
						</defs>
						<path d='M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z' />
					</svg>
					<div className='text-2xl font-bold tracking-tight text-violet-900 md:text-3xl'>
						Облако
					</div>
				</div>

				<div className='flex items-center gap-4 md:hidden'>
					<MessageCircleMore
						size='26px'
						className='cursor-pointer text-gray-700 transition-all duration-300 hover:text-[#7c55f1]'
						onClick={() => navigate('/chat')}
					/>
					{path === '/' ? (
						<button
							className='rounded-full bg-[#7c55f1] px-4 py-2 text-sm font-semibold tracking-wide text-white transition-all duration-200 hover:bg-[#9373f4] active:scale-[0.98]'
							onClick={() => navigate('/profile')}
						>
							Профиль
						</button>
					) : (
						<button
							className='rounded-full bg-[#7c55f1] px-4 py-2 text-sm font-semibold tracking-wide text-white transition-all duration-200 hover:bg-[#9373f4] active:scale-[0.98]'
							onClick={() => navigate('/')}
						>
							Вернуться
						</button>
					)}
				</div>
			</div>

			<div className='flex h-12 items-center justify-between border-t border-gray-100 md:h-auto md:grow md:justify-end md:border-t-0'>
				<div
					className={`flex h-full w-full items-center justify-around md:ml-[5%] md:w-auto md:justify-start md:gap-2 ${
						path === '/profile' ? 'pointer-events-none invisible' : ''
					}`}
				>
					<div
						className='relative flex h-full grow cursor-pointer items-center justify-center px-3 transition-all duration-200 hover:bg-gray-100 md:grow-0'
						onClick={() => changeType('popular')}
					>
						<div className='text-sm font-semibold tracking-tight text-violet-900 md:text-lg'>
							Популярные
						</div>
						{currentFilter === 'popular' && (
							<div className='absolute right-0 bottom-0 left-0 h-[2px] bg-violet-900' />
						)}
					</div>

					<div
						className='relative flex h-full grow cursor-pointer items-center justify-center px-3 transition-all duration-200 hover:bg-gray-100 md:grow-0'
						onClick={() => changeType('new')}
					>
						<div className='text-sm font-semibold tracking-tight text-violet-900 md:text-lg'>
							Новые
						</div>
						{currentFilter === 'new' && (
							<div className='absolute right-0 bottom-0 left-0 h-[2px] bg-violet-900' />
						)}
					</div>

					<div
						className='relative flex h-full grow cursor-pointer items-center justify-center px-3 transition-all duration-200 hover:bg-gray-100 md:grow-0'
						onClick={() => changeType('manyComments')}
					>
						<div className='text-sm font-semibold tracking-tight text-violet-900 md:text-lg'>
							Обсуждаемые
						</div>
						{currentFilter === 'manyComments' && (
							<div className='absolute right-0 bottom-0 left-0 h-[2px] bg-violet-900' />
						)}
					</div>
				</div>

				<div className='ml-auto hidden items-center gap-6 md:flex'>
					<MessageCircleMore
						size='30px'
						className='cursor-pointer transition-all duration-300 hover:text-[#7c55f1]'
						onClick={() => navigate('/chat')}
					/>
					{path === '/' ? (
						<button
							className='w-[200px] rounded-full bg-[#7c55f1] p-3 text-lg font-semibold tracking-wide text-white transition-all duration-200 hover:bg-[#9373f4]'
							onClick={() => navigate('/profile')}
						>
							Мой профиль
						</button>
					) : (
						<button
							className='w-[200px] rounded-full bg-[#7c55f1] p-3 text-lg font-semibold tracking-wide text-white transition-all duration-200 hover:bg-[#9373f4]'
							onClick={() => navigate('/')}
						>
							Вернуться
						</button>
					)}
				</div>
			</div>
		</div>
	)
}
