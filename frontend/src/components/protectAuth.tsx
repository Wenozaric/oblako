import { useEffect, type ReactNode } from 'react'
import { useLocation, Navigate } from 'react-router'
import { useUserStore } from '../stores/useUserStore'

interface Probs {
	children: ReactNode
}

export const ProtectAuth = ({ children }: Probs) => {
	const url = useLocation()
	const username = useUserStore((state) => state.username)
	const bb = useUserStore((state) => state.checkAuth)

	useEffect(() => {
		bb()
	}, [])

	const isLoading = useUserStore((state) => state.isLoading)

	if (isLoading) {
		return (
			<div className='flex min-h-screen items-center justify-center bg-white'>
				<div className='h-10 w-10 animate-spin rounded-full border-b-2 border-[#7c55f1]'></div>
			</div>
		)
	} else {
		const path = url.pathname

		if (path !== '/login' && path !== '/register') {
			if (!username) {
				return <Navigate to='/register' replace />
			}
		} else {
			if (username) {
				return <Navigate to='/' replace />
			}
		}

		return <>{children}</>
	}
}
