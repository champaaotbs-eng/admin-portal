import { Store } from '@tanstack/store'
import { useState, useEffect } from 'react'

export interface ICustomerUser {
    userId: string
    fullName: string
    email: string
    phone: string | null
    address: string | null
}

const CUSTOMER_AUTH_KEY = 'customer_auth_data'

function loadCustomerFromStorage(): ICustomerUser | null {
    if (typeof window === 'undefined') return null
    try {
        const raw = localStorage.getItem(CUSTOMER_AUTH_KEY)
        return raw ? (JSON.parse(raw) as ICustomerUser) : null
    } catch {
        return null
    }
}

export interface CustomerAuthState {
    user: ICustomerUser | null
    accessToken: string | null
    isAuthenticated: boolean
}

const storedUser = loadCustomerFromStorage()

export const customerAuthStore = new Store<CustomerAuthState>({
    user: storedUser,
    accessToken: null,
    isAuthenticated: storedUser !== null,
})

export function setCustomerAuth(user: ICustomerUser | null, accessToken: string | null) {
    if (typeof window !== 'undefined') {
        if (user) {
            localStorage.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(user))
        } else {
            localStorage.removeItem(CUSTOMER_AUTH_KEY)
        }
    }
    customerAuthStore.setState((s) => ({
        ...s,
        user,
        accessToken,
        isAuthenticated: user !== null,
    }))
}

export function logoutCustomer() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(CUSTOMER_AUTH_KEY)
    }
    customerAuthStore.setState((s) => ({
        ...s,
        user: null,
        accessToken: null,
        isAuthenticated: false,
    }))
}

export function useCustomerAuthStore(): CustomerAuthState {
    const [state, setState] = useState<CustomerAuthState>(customerAuthStore.state)

    useEffect(() => {
        return customerAuthStore.subscribe(() => {
            setState({ ...customerAuthStore.state })
        })
    }, [])

    return state
}
