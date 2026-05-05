import { api } from 'utils/axios.instance'
import type { ICustomerUser } from 'store/customer-auth.store'

export interface ICustomerLoginPayload {
    email: string
    password: string
}

export interface ICustomerRegisterPayload {
    fullName: string
    email: string
    password: string
    phone: string
    address?: string
}

export interface ICustomerAuthResponse {
    accessToken: string
    user: ICustomerUser
}

export const customerLogin = async (payload: ICustomerLoginPayload) => {
    const response = await api.post<ICustomerAuthResponse>('/auth/user/login', {
        email: payload.email,
        password: payload.password,
    })
    return response
}

export const customerRegister = async (payload: ICustomerRegisterPayload) => {
    const response = await api.post<ICustomerAuthResponse>('/auth/user/register', {
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
        address: payload.address ?? '',
    })
    return response
}
