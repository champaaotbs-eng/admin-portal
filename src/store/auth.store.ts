import { Store } from '@tanstack/store'
import { useState, useEffect } from 'react'
import { type IAdmin } from 'types/admin'
import { refresh } from 'services/auth/auth.service'

// ─── State ────────────────────────────────────────────────────────────────────

const AUTH_STORAGE_KEY = 'auth_data'
let hasInitializedAuth = false

function loadAdminFromStorage(): IAdmin | null {
    if (typeof window === 'undefined') {
        return null
    }

    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY)
        return raw ? (JSON.parse(raw) as IAdmin) : null
    } catch {
        return null
    }
}

export interface AuthState {
    admin: IAdmin | null
    accessToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
}

export const authStore = new Store<AuthState>({
    admin: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
})

export async function initializeAuthAsync() {
    if (typeof window === 'undefined' || hasInitializedAuth) {
        return
    }

    hasInitializedAuth = true

    const storedAdmin = loadAdminFromStorage()
    if (storedAdmin) {
        authStore.setState((s) => ({
            ...s,
            admin: storedAdmin,
            isAuthenticated: true,
            isLoading: true,
        }))
    }

    try {
        await refresh()
    } catch {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_STORAGE_KEY)
        }

        authStore.setState((s) => ({
            ...s,
            admin: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
        }))
    }
}

async function initializeAuthOnReload() {
    return initializeAuthAsync()
}

// ─── Actions ────────────────────────────────────────────────────────────────────

export function setAuth(admin: IAdmin | null, accessToken: string | null) {
    if (typeof window !== 'undefined') {
        if (admin) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(admin))
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY)
        }
    }
    authStore.setState((s) => ({
        ...s,
        admin,
        accessToken,
        isAuthenticated: admin !== null,
        isLoading: false,
    }))
}

export function logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY)
    }

    authStore.setState((s) => ({
        ...s,
        admin: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
    }))
}

// ─── React Hook ───────────────────────────────────────────────────────────────

/**
 * React hook to subscribe to auth state changes.
 * Use this instead of @tanstack/react-store's useStore,
 * as that package expects a different atom API.
 */
export function useAuthStore(): AuthState {
    const [state, setState] = useState<AuthState>(authStore.state)

    useEffect(() => {
        initializeAuthOnReload();
        // subscibe returns unsubscribe fn
        return authStore.subscribe(() => {
            setState({ ...authStore.state })
        })
    }, [])

    return state
}
