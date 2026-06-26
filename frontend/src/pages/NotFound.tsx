import { Link } from 'react-router-dom'

const NotFound = () => {
	return (
		<div className='flex min-h-screen w-full flex-col items-center justify-center bg-[#FAF9FC] px-4 font-sans text-[#1A1A1A]'>
			<div className='w-full max-w-sm text-center'>
				<div className='rounded-full font-bold text-[#7A5CFF] uppercase text-8xl'>
					404
				</div>

				<h1 className='mt-6 text-3xl font-black tracking-tight text-gray-900 md:text-4xl'>
					Страница отсутствует
				</h1>

				<p className='mt-3 text-sm leading-relaxed text-gray-500'>
					Адрес не существует, либо публикация была перемещена в архив.
					Проверьте правильность написания ссылки.
				</p>

				<div className='mt-8'>
					<Link
						to='/'
						className='inline-flex items-center justify-center gap-2 rounded-xl bg-[#7A5CFF] px-6 py-3 text-lg font-semibold tracking-wide text-white shadow-sm shadow-purple-500/5 transition-all duration-150 hover:bg-[#651fff] active:scale-[0.98]'
					>
						<span>Вернуться на главную</span>
					</Link>
				</div>
			</div>
		</div>
	)
}

export default NotFound
