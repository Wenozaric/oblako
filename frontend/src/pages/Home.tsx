import '../style.css'

import { Header } from '../components/main/header'
import { PostCard } from '../components/main/PostCard'

function HomePage() {
	return (
		<div className='relative flex min-h-screen w-full flex-col overflow-x-hidden'>
			<div className='flex min-h-screen w-full flex-col bg-gradient-to-tr from-[#EFE3F2] via-[#FFFDFE] to-[#F5EEF7] bg-cover bg-fixed bg-center font-sans antialiased'>
				<Header />
				<div className='flex justify-center p-10'>
					<PostCard />
				</div>
			</div>
		</div>
	)
}

export default HomePage
