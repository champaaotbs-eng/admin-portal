import { setAuth } from '@/store/auth.store'
import { setCustomerAuth } from '@/store/customer-auth.store'
import type { ILogin, IResponseAuth } from './auth.types'
import { api } from 'utils/axios.instance'

export const login = async (payload: ILogin) => {
    const response = await api.post<IResponseAuth>('/v1/auth/admin/login', payload)

    if (response.data && response.statusCode) {
        const admin = response.data.admin || null
        const accessToken = response.data.accessToken || null
        setAuth(admin, accessToken)
    }

    return response
}

export const refresh = async () => {
    const response = await api.get<IResponseAuth>('/v1/auth/refresh', { withCredentials: true })

    if (response.statusCode && response.data) {
        const data = response.data as any
        const accessToken = data.accessToken || null

        if (data.admin) {
            setAuth(data.admin, accessToken)
        } else if (data.user) {
            setCustomerAuth(data.user, accessToken)
        }
    }
    return response
}
