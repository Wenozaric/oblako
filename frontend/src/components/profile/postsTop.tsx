import type { Posts } from '../../types/api'

interface PostsTopInterface {
	posts: Posts[] | null | undefined
}

export const PostsTop = ({ posts }: PostsTopInterface) => {
	return (
		<>
			{posts && posts.length > 0 ? (
				<div className='flex flex-col gap-4'>
					{[...posts]
						.sort((a, b) => b._count.likes - a._count.likes)
						.slice(0, 3)
						.map((post) => {
							const postDate = new Date(post.createdAt).toLocaleDateString(
								'ru-RU',
								{
									day: 'numeric',
									month: 'long',
								},
							)

							return (
								<div
									key={post.id}
									className='group flex cursor-pointer items-center gap-4 border-b border-violet-50/70 pb-4 last:border-0 last:pb-0'
								>
									<div className='relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-violet-100 bg-violet-50 text-xs font-bold text-violet-500 shadow-sm'>
										{post.author?.username ? (
											<div className='flex h-full w-full items-center justify-center bg-purple-500 text-white'>
												{post.author.username.slice(0, 2).toUpperCase()}
											</div>
										) : (
											<div className='flex h-full w-full items-center justify-center bg-gray-200 text-gray-400'>
												📝
											</div>
										)}
									</div>

									<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
										<h4 className='line-clamp-1 text-sm font-bold text-violet-900 transition-colors group-hover:text-[#7A5CFF]'>
											{post.name}
										</h4>

										<p className='line-clamp-1 text-xs text-gray-500'>
											{post.description}
										</p>

										<div className='mt-1 flex items-center gap-2 text-[11px] font-medium text-violet-400'>
											<span>{postDate}</span>
											<span className='h-1 w-1 rounded-full bg-violet-200' />
											<span>{post._count.comments} коммент.</span>
											<span className='h-1 w-1 rounded-full bg-violet-200' />
											<span
												className={
													post._count.likes > 0
														? 'font-bold text-emerald-600'
														: post._count.likes < 0
															? 'font-bold text-rose-500'
															: ''
												}
											>
												{post._count.likes > 0
													? `+${post._count.likes}`
													: post._count.likes}{' '}
												рейтинг
											</span>
										</div>
									</div>
								</div>
							)
						})}
				</div>
			) : (
				<div className='flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-100 bg-violet-50/20 py-10 text-center'>
					<p className='text-sm font-semibold tracking-wide text-violet-400/90'>
						Постов пока нет
					</p>
				</div>
			)}
		</>
	)
}
