import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { customerRegister } from 'services/auth/customer-auth.service'
import { setCustomerAuth } from 'store/customer-auth.store'
import { APP_ROUTES } from '@/constants/app-routes'

const schema = z.object({
    fullName: z.string().min(1, 'full_name_required'),
    email: z.string().min(1, 'email_required').email('email_invalid'),
    phone: z.string().min(1, 'phone_required'),
    password: z.string().min(6, 'password_min'),
})
type FormValues = z.infer<typeof schema>

export const Route = createFileRoute('/customer/register')({
    component: CustomerRegisterPage,
})

function CustomerRegisterPage() {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.customer.register' })
    const navigate = useNavigate()
    const [serverError, setServerError] = useState('')

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: 'onChange',
    })

    const onSubmit = async (values: FormValues) => {
        setServerError('')
        try {
            const res = await customerRegister({
                fullName: values.fullName,
                email: values.email,
                phone: values.phone,
                password: values.password,
            })
            const data = (res as any).data ?? res
            setCustomerAuth(data.user, data.accessToken)
            navigate({ to: APP_ROUTES.CUSTOMER.ROOT })
        } catch (err: any) {
            setServerError(err?.localizedMessage ?? t('errors.email_required'))
        }
    }

    const fields: Array<{ key: keyof FormValues; type?: string; label: string; placeholder: string }> = [
        { key: 'fullName', label: t('full_name_label'), placeholder: t('full_name_placeholder') },
        { key: 'email', type: 'email', label: t('email_label'), placeholder: t('email_placeholder') },
        { key: 'phone', type: 'tel', label: t('phone_label'), placeholder: t('phone_placeholder') },
        { key: 'password', type: 'password', label: t('password_label'), placeholder: t('password_placeholder') },
    ]

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {fields.map(f => (
                        <div key={f.key}>
                            <label className="mb-1 block text-sm font-medium">{f.label}</label>
                            <input
                                {...register(f.key)}
                                type={f.type ?? 'text'}
                                placeholder={f.placeholder}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            {errors[f.key] && (
                                <p className="mt-1 text-xs text-destructive">
                                    {t(`errors.${errors[f.key]!.message}`)}
                                </p>
                            )}
                        </div>
                    ))}

                    {serverError && <p className="text-sm text-destructive">{serverError}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                    >
                        {isSubmitting ? '...' : t('register_btn')}
                    </button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    {t('have_account')}{' '}
                    <Link to={APP_ROUTES.CUSTOMER.LOGIN} className="font-medium text-primary hover:underline">
                        {t('login_link')}
                    </Link>
                </p>
            </div>
        </div>
    )
}
