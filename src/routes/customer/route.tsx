import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from '@tanstack/react-router'
import { Bus, Globe, LogOut, User } from 'lucide-react'
import { useEffect } from 'react'
import { useCustomerAuthStore, logoutCustomer, customerAuthStore } from '@/store/customer-auth.store'
import { APP_ROUTES } from '@/constants/app-routes'
import i18n from '#/i18n'
import { refresh } from 'services/auth/auth.service'

export const Route = createFileRoute('/customer')({
    component: CustomerLayout,
})

function CustomerHeader() {
    const { t } = useTranslation()
    const { user, isAuthenticated } = useCustomerAuthStore()
    const navigate = useNavigate()

    const toggleLang = () => {
        const next = i18n.language === 'en' ? 'vi' : 'en'
        i18n.changeLanguage(next)
    }

    const handleLogout = () => {
        logoutCustomer()
        navigate({ to: APP_ROUTES.CUSTOMER.ROOT })
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
                <Link to={APP_ROUTES.CUSTOMER.ROOT} className="flex items-center gap-2 font-bold text-primary">
                    <Bus className="h-6 w-6" />
                    <span>{t('app.brand')}</span>
                </Link>

                <div className="flex-1" />

                <button
                    onClick={toggleLang}
                    title={t('lang.switch')}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                    <Globe className="h-4 w-4" />
                    <span className="uppercase">{i18n.language}</span>
                </button>

                {isAuthenticated && user ? (
                    <div className="flex items-center gap-3">
                        <Link
                            to={APP_ROUTES.CUSTOMER.MY_BOOKINGS}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">{user.fullName}</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 text-sm text-destructive hover:underline"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('nav.logout')}</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link to={APP_ROUTES.CUSTOMER.LOGIN} className="text-sm font-medium hover:text-primary">
                            {t('nav.login')}
                        </Link>
                        <Link
                            to={APP_ROUTES.CUSTOMER.REGISTER}
                            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            {t('pages.customer.register.register_btn')}
                        </Link>
                    </div>
                )}
            </div>
        </header>
    )
}

function CustomerLayout() {
    useEffect(() => {
        // If we have a stored user but no access token, refresh silently
        if (customerAuthStore.state.user && !customerAuthStore.state.accessToken) {
            refresh().catch(() => logoutCustomer())
        }
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground">
            <CustomerHeader />
            <main className="mx-auto max-w-7xl px-4 py-6">
                <Outlet />
            </main>
        </div>
    )
}
