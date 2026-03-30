import { createFileRoute, Link } from '@tanstack/react-router'
import { APP_ROUTES } from '@/constants/app-routes'
import { Button } from '@/components/ui/button'

const ForbiddenPage = () => {
    return (
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
            <div className="max-w-md text-center space-y-3">
                <h1 className="text-3xl font-bold">403</h1>
                <p className="text-sm text-muted-foreground">You do not have permission to access this page.</p>
                <Button asChild>
                    <Link to={APP_ROUTES.ADMIN.ROOT}>Back to dashboard</Link>
                </Button>
            </div>
        </div>
    )
}

export const Route = createFileRoute('/403')({
    component: ForbiddenPage,
})
