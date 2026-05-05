import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { customerLogin } from 'services/auth/customer-auth.service'
import { setCustomerAuth } from 'store/customer-auth.store'
import { APP_ROUTES } from '@/constants/app-routes'

const schema = z.object({
    email: z.string().min(1, 'email_required').email('email_invalid'),
    password: z.string().min(6, 'password_min'),
})
type FormValues = z.infer<typeof schema>

export const Route = createFileRoute('/customer/login')({
    validateSearch: (s: Record<string, unknown>) => ({
        redirect: typeof s.redirect === 'string' ? s.redirect : undefined,
    }),
    component: CustomerLoginPage,
})

function CustomerLoginPage() {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.customer.login' })
    const navigate = useNavigate()
    const { redirect } = useSearch({ from: '/customer/login' })
    const [serverError, setServerError] = useState('')

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: 'onChange',
    })

    const onSubmit = async (values: FormValues) => {
        setServerError('')
        try {
            const res = await customerLogin({ email: values.email, password: values.password })
            const data = (res as any).data ?? res
            setCustomerAuth(data.user, data.accessToken)
            navigate({ to: redirect ?? APP_ROUTES.CUSTOMER.ROOT })
        } catch {
            setServerError(t('errors.invalid_credentials'))
        }
    }

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">{t('email_label')}</label>
                        <input
                            {...register('email')}
                            type="email"
                            placeholder={t('email_placeholder')}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        {errors.email && <p className="mt-1 text-xs text-destructive">{t(`errors.${errors.email.message}`)}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">{t('password_label')}</label>
                        <input
                            {...register('password')}
                            type="password"
                            placeholder={t('password_placeholder')}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        {errors.password && <p className="mt-1 text-xs text-destructive">{t(`errors.${errors.password.message}`)}</p>}
                    </div>

                    {serverError && <p className="text-sm text-destructive">{serverError}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                    >
                        {isSubmitting ? '...' : t('login_btn')}
                    </button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    {t('no_account')}{' '}
                    <Link to={APP_ROUTES.CUSTOMER.REGISTER} className="font-medium text-primary hover:underline">
                        {t('register_link')}
                    </Link>
                </p>
                <p className="text-center">
                    <Link to={APP_ROUTES.CUSTOMER.ROOT} className="text-sm text-muted-foreground hover:underline">
                        {t('back_to_search')}
                    </Link>
                </p>
            </div>
        </div>
    )
}
