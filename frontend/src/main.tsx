import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { ProtectAuth } from './components/protectAuth'

import HomePage from './pages/Home.tsx'
import LoginPage from './pages/Login.tsx'
import RegisterPage from './pages/Register.tsx'
import ProfilePage from './pages/Profile.tsx'
import Chat from './pages/Chat.tsx'
import NotFound from './pages/NotFound.tsx'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<ProtectAuth>
				<Routes>
					<Route path='/' element={<HomePage />}></Route>

					<Route path='/login' element={<LoginPage />}></Route>
					<Route path='/register' element={<RegisterPage />}></Route>

					<Route path='/chat' element={<Chat />}></Route>

					<Route path='/profile' element={<ProfilePage />}></Route>
					<Route path='/profile/:idUser' element={<ProfilePage />}></Route>

					<Route path='*' element={<NotFound />}></Route>

				</Routes>
			</ProtectAuth>
		</BrowserRouter>
	</StrictMode>,
)
