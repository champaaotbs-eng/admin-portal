import { Link } from '@tanstack/react-router'
import { ROLE_I18N_KEYS } from '@/constants/roles'
import { APP_ROUTES } from '@/constants/app-routes'
import { Bus, Globe } from 'lucide-react'
import { useAppHeader } from './hooks/use-app-header'

export const AppHeader = () => {
    const { admin, isAuthenticated, currentLang, handleLogout, toggleLang, t } = useAppHeader()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 font-bold text-primary">
                    <Bus className="h-6 w-6" />
                    <span>VéXe.vn</span>
                </Link>

                <div className="flex-1" />

                {/* Language switcher */}
                <button
                    onClick={toggleLang}
                    title={t('lang.switch')}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                    <Globe className="h-4 w-4" />
                    <span className="uppercase">{currentLang}</span>
                </button>

                {isAuthenticated && admin ? (
                    <div className="flex items-center gap-4">
                        <span className="hidden text-sm text-muted-foreground sm:inline">
                            {admin.fullName}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-destructive hover:underline"
                        >
                            {t('nav.logout')}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Link
                            to={APP_ROUTES.LOGIN}
                            className="text-sm font-medium hover:text-primary"
                        >
                            {t('nav.login')}
                        </Link>
                    </div>
                )}
            </div>
        </header>
    )
}
