import { Controller } from 'react-hook-form'
import { AlertCircle, LogIn as LoginIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLogin } from './use-login'

export const LoginPage = () => {
    const { control, handleSubmit, errors, loginMutation, errorMessage, t } = useLogin()

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
            <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
                <div className="mb-6 text-center">
                    <div className="mb-3 flex justify-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <LoginIcon className="h-6 w-6 text-primary" />
                        </span>
                    </div>
                    <h1 className="text-2xl font-semibold">Admin Portal</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{t('description')}</p>
                </div>

                <form onSubmit={handleSubmit((data) => loginMutation.mutate(data))} className="flex flex-col gap-4">
                    <Controller
                        name="username"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                label={t('username_label')}
                                type="text"
                                placeholder={t('username_placeholder')}
                                autoComplete="username"
                            />
                        )}
                    />
                    {errors.username && (
                        <p className="text-red-500 text-xs flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.username.message}
                        </p>
                    )}

                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                label={t('password_label')}
                                type="password"
                                placeholder={t('password_placeholder')}
                                autoComplete="current-password"
                            />
                        )}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-xs flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.password.message}
                        </p>
                    )}

                    {errorMessage && (
                        <p className="text-red-500 text-xs flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {t(`errors.${errorMessage}`)}
                        </p>
                    )}

                    <Button type="submit" loading={loginMutation.isPending} className="mt-2 w-full">
                        {t('login_btn')}
                    </Button>
                </form>
            </div>
        </div>
    )
}
