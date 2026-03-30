import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { APP_ROUTES } from '@/constants/app-routes'
import { Button } from '@/components/ui/button'

const ForbiddenPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.forbidden' })

    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
            <div className="max-w-md text-center space-y-3">
                <h1 className="text-3xl font-bold">403</h1>
                <p className="text-sm text-muted-foreground">{t('description')}</p>
                <Button asChild>
                    <Link to={APP_ROUTES.ADMIN.ROOT}>{t('back_to_dashboard')}</Link>
                </Button>
            </div>
        </div>
    )
}

export const Route = createFileRoute('/403')({
    component: ForbiddenPage,
})
