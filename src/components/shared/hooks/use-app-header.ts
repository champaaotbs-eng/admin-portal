import { useNavigate } from '@tanstack/react-router'
import { useAuthStore, logout } from '@/store/auth.store'
import { APP_ROUTES } from '@/constants/app-routes'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { SUPPORTED_LANGS, DEFAULT_LANG, LANG_STORAGE_KEY, type SupportedLang } from '#/i18n'

export const useAppHeader = () => {
    const { admin, isAuthenticated } = useAuthStore()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()

    useEffect(() => {
        const saved = localStorage.getItem(LANG_STORAGE_KEY) as SupportedLang | null
        if (saved && SUPPORTED_LANGS.includes(saved) && saved !== i18n.language) {
            void i18n.changeLanguage(saved)
        }
    }, [])

    const handleLogout = () => {
        logout()
        navigate({ to: APP_ROUTES.HOME })
    }

    const toggleLang = () => {
        const next: SupportedLang = i18n.language === 'vi' ? 'en' : 'vi'
        localStorage.setItem(LANG_STORAGE_KEY, next)
        void i18n.changeLanguage(next)
    }

    const currentLang = SUPPORTED_LANGS.includes(i18n.language as SupportedLang)
        ? (i18n.language as SupportedLang)
        : DEFAULT_LANG

    return { admin, isAuthenticated, currentLang, handleLogout, toggleLang, t }
}
