import { create } from 'zustand'
import { authService } from '../api/all-api'

interface UserStore {
    username: string | null,
    isLoading: boolean,
    checkAuth: () => Promise<void>,
    setUsername: (name: string) => void
}

export const useUserStore = create<UserStore>((set) => ({
    username: null,
    isLoading: true,
    checkAuth: async () => {
        try {
            const res = await authService.checkCookie();
            if (res?.username) {
                set({ username: res.username, isLoading: false })
            } else {
                console.log(res.data)
                set({ username: null, isLoading: false })
            }
        } catch (e) {
            console.log("Ошибка проверки кук:", e)
            set({ username: null, isLoading: false })
        }
    },

    setUsername: (name: string) => {
        set({ username: name })
    }
}));