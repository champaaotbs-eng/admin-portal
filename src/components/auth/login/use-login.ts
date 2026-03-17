import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAuthError, type LoginPayload } from '@/services/auth.service'
import { APP_ROUTES } from '@/constants/app-routes'
import { loginValidationSchema } from './validation-schema'
import { login } from 'services/auth/auth.service'
import type { ILogin } from 'services/auth/auth.types'

export const useLogin = () => {
    const navigate = useNavigate()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.login' })

    const schema = loginValidationSchema(t)

    const { control, handleSubmit, formState: { errors } } = useForm<ILogin>({
        resolver: zodResolver(schema),
        defaultValues: {
            username: '',
            password: ''
        },
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: () => {
            navigate({
                to: APP_ROUTES.ADMIN.ROOT,
                replace: true,
            })
        },
        onError: (error) => {
            console.error('Login failed:', error)
        }
    })

    const errorMessage = loginMutation.data && isAuthError(loginMutation.data)
        ? loginMutation.data.message
        : null

    return { control, handleSubmit, errors, loginMutation, errorMessage, t }
}
