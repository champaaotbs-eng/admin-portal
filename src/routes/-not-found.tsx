import { Link } from '@tanstack/react-router'

export const NotFound = () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-6xl font-bold text-primary">404</p>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">
            The page you are looking for does not exist.
        </p>
        <Link
            to="/auth/login"
            className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
            Back to login
        </Link>
    </div>
)