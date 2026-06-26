import { useState } from 'react'

import loginImage from '../images/login.jpg'
import { TvMinimalPlay } from 'lucide-react'

import axios from 'axios'
import { authService } from '../api/all-api'

import { useUserStore } from '../stores/useUserStore'
import {
	exportPublicKey,
	generateKeyPair,
	savePrivateKey,
} from '../utils/localDb'
import { useNavigate } from 'react-router-dom'

const RegisterPage = () => {
	const navigate = useNavigate()

	const [regEmail, setRegEmail] = useState<string>('')
	const [regUsername, setRegUsername] = useState<string>('')
	const [regPassword, setRegPassword] = useState<string>('')
	const [confirmRegPassword, setConfirmRegPassword] = useState<string>('')

	const [lastError, setLastError] = useState<boolean>(false)

	const [messageError, setMessageError] = useState('')

	const [auth, setAuth] = useState<boolean>(false)

	const setUsername = useUserStore((state) => state.setUsername)

	const formAbort = async (e: any) => {
		e.preventDefault()
		if (regPassword !== confirmRegPassword) {
			setMessageError('Пароли не совпадают')
			setLastError(true)
		} else {
			try {
				// создание ключа e2e
				const keyPair = await generateKeyPair()
				await savePrivateKey(keyPair.privateKey)
				const publkicKeyString = await exportPublicKey(keyPair.publicKey)
				const res = await authService.register({
					email: regEmail,
					password: regPassword,
					publicKey: publkicKeyString,
					username: regUsername,
				})
				if (res) {
					console.log('успешно')
					console.log(res.username)
					setAuth(true)
					setTimeout(() => setUsername(res.username), 1000)
				}
			} catch (error: any) {
				if (axios.isAxiosError(error)) {
					const errorData = error.response?.data
					let finalMessage = 'Произошла ошибка при регистрации'

					if (errorData) {
						const rawString = JSON.stringify(errorData).toLowerCase()
						let detectedField = ''
						if (rawString.includes('email')) detectedField = 'в почте'
						else if (rawString.includes('password')) detectedField = 'в пароле'
						else if (rawString.includes('username'))
							detectedField = 'в никнейме'

						if (
							rawString.includes('invalid_format') ||
							rawString.includes('format') ||
							rawString.includes('email')
						) {
							if (detectedField === 'в почте' || rawString.includes('email')) {
								finalMessage = 'Неверный формат почты'
							} else {
								finalMessage = `Неверный формат ${detectedField}`
							}
						} else if (
							rawString.includes('too_small') ||
							rawString.includes('too_short') ||
							rawString.includes('short')
						) {
							const match =
								rawString.match(/"mini[^"]*":\s*(\d+)/) ||
								rawString.match(/(\d+)\s*char/)
							const minLength = match
								? match[1]
								: detectedField === 'в никнейме'
									? '3'
									: '8'
							finalMessage = `Ошибка ${detectedField || 'валидации'}: минимум ${minLength} симв.`
						} else if (
							rawString.includes('too_big') ||
							rawString.includes('too_long') ||
							rawString.includes('long')
						) {
							finalMessage = `Ошибка ${detectedField || 'валидации'}: превышена макс. длина`
						}
						else if (
							typeof errorData.message === 'string' &&
							!errorData.message.includes('Invalid')
						) {
							finalMessage = errorData.message
						} else if (typeof errorData.error === 'string') {
							finalMessage = errorData.error
						}

						else if (detectedField) {
							finalMessage = `Проверьте корректность данных ${detectedField}`
						}
					} else {
						finalMessage = error.message
					}

					setMessageError(finalMessage)
					setLastError(true)
				} else if (error instanceof Error) {
					setMessageError(error.message)
					setLastError(true)
				}
			}
		}
	}

	return (
		<div
			className='flex min-h-[100dvh] w-full items-center overflow-x-hidden bg-cover bg-center'
			style={{ backgroundImage: `url(${loginImage})` }}
		>
			<div className='flex min-h-[100dvh] w-full min-w-[320px] overflow-y-auto bg-white p-6 pt-12 sm:p-12 sm:pt-20 md:h-[100vh] md:w-[30vw] md:min-w-[450px] md:p-20 md:pt-40'>
				<div className='w-[100%]'>
					<form onSubmit={(e) => formAbort(e)}>
						<TvMinimalPlay size='45px' color='#7c55f1' />
						<div className='pt-2 text-2xl font-semibold tracking-wide'>
							Зарегистрировать аккаунт
						</div>

						<div className='flex items-center pt-1'>
							<div className='tracking-wide text-gray-700'>
								Уже есть аккаунт?
							</div>
							<div
								className='ml-2 cursor-pointer font-semibold text-[#7c55f1] transition-all duration-200 hover:text-purple-500'
								onClick={() => navigate('/login')}
							>
								Войти
							</div>
						</div>

						<div className='pt-5'>
							<div className='pb-1 text-xl font-semibold'>Никнейм</div>
							<input
								className='w-full rounded-xl border-[1px] border-gray-300 p-[5px] pl-2 transition-all duration-200 focus:border-[#7c55f1] focus:outline-none md:w-[80%]'
								placeholder='Ваше имя'
								onChange={(e) => {
									setLastError(false)
									setRegUsername(e.target.value)
								}}
								value={regUsername}
							></input>
							<div className='mt-1.5 flex flex-col gap-1'>
								<div className='flex items-center gap-2'>
									<span className='h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300' />
									<span className='text-xs text-gray-500'>
										От 3 до 20 символов
									</span>
								</div>

								<div className='flex items-center gap-2'>
									<span className='h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300' />
									<span className='text-xs text-gray-500'>
										Только латиница и цифры
									</span>
								</div>
							</div>
						</div>

						<div className='pt-3'>
							<div className='pb-1 text-xl font-semibold'>Почта</div>
							<input
								className='w-full rounded-xl border-[1px] border-gray-300 p-[5px] pl-2 transition-all duration-200 focus:border-[#7c55f1] focus:outline-none md:w-[80%]'
								placeholder='email@example.com'
								onChange={(e) => {
									setLastError(false)
									setRegEmail(e.target.value)
								}}
								value={regEmail}
								autoComplete='username'
								type='email'
								name='email'
							></input>
						</div>

						<div className='pt-3'>
							<div className='pb-1 text-xl font-semibold'>Пароль</div>
							<input
								className='w-full rounded-xl border-[1px] border-gray-300 p-[5px] pl-2 transition-all duration-200 focus:border-[#7c55f1] focus:outline-none md:w-[80%]'
								placeholder='••••••••'
								onChange={(e) => {
									setLastError(false)
									setRegPassword(e.target.value)
								}}
								value={regPassword}
								type='password'
								autoComplete='new-password'
								name='password'
							></input>

							<div className='mt-1.5 flex flex-col gap-1'>
								<div className='flex items-center gap-2'>
									<span className='h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300' />
									<span className='text-xs text-gray-500'>
										От 8 до 20 символов
									</span>
								</div>
							</div>
						</div>

						<div className='pt-3 pb-8'>
							<div className='pb-1 text-xl font-semibold'>
								Подтвердите пароль
							</div>
							<input
								className='flex w-full rounded-xl border-[1px] border-gray-300 p-[5px] pl-2 transition-all duration-200 focus:border-[#7c55f1] focus:outline-none md:w-[80%]'
								placeholder='••••••••'
								onChange={(e) => {
									setLastError(false)
									setConfirmRegPassword(e.target.value)
								}}
								value={confirmRegPassword}
								type='password'
								autoComplete='new-password'
								name='confirm-password'
							></input>
						</div>

						<button
							className={`transtion-all w-full rounded-full bg-[#7c55f1] p-3 text-lg font-semibold tracking-wide text-white duration-200 hover:bg-[#9373f4] active:scale-[0.98] md:w-[80%]`}
							type='submit'
						>
							Зарегистрироваться
						</button>
						
						<div
							style={{
								maxHeight: lastError ? '100px' : '0px',
								opacity: lastError ? 1 : 0,
								marginTop: lastError ? '16px' : '0px',
								transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
							}}
							className='w-full overflow-hidden md:w-[80%]'
						>
							<div className='rounded-xl border border-rose-200/60 bg-rose-50/70 px-4 py-2.5 text-sm font-medium text-rose-600 shadow-sm backdrop-blur-md'>
								{messageError}
							</div>
						</div>

						<div
							className={`pt-2 font-semibold text-green-700 opacity-[0.9] transition-all duration-300 ${
								auth
									? 'visible translate-y-0 opacity-90'
									: 'invisible translate-y-2 opacity-0'
							} `}
						>
							Успешная регистрация, перенаправляем вас на главную страницу
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default RegisterPage
