import { Store } from '@tanstack/store'
import { useState, useEffect } from 'react'
import type { IAdmin } from 'services/admin/admin.types'

// ─── State ────────────────────────────────────────────────────────────────────

const AUTH_STORAGE_KEY = 'auth_data'

function loadAdminFromStorage(): IAdmin | null {
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

const storedAdmin = loadAdminFromStorage()

export const authStore = new Store<AuthState>({
    admin: storedAdmin,
    accessToken: null,
    isAuthenticated: storedAdmin !== null,
    isLoading: storedAdmin !== null,
})

// ─── Actions ────────────────────────────────────────────────────────────────────

export function setAuth(admin: IAdmin | null, accessToken: string | null) {
    if (admin) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(admin))
    } else {
        localStorage.removeItem(AUTH_STORAGE_KEY)
    }
    authStore.setState((s) => ({
        ...s,
        admin,
        accessToken,
        isAuthenticated: admin !== null,
        isLoading: false,
    }))
}

export function setUser(admin: IAdmin | null) {
    if (admin) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(admin))
    } else {
        localStorage.removeItem(AUTH_STORAGE_KEY)
    }
    authStore.setState((s) => ({
        ...s,
        admin,
        isAuthenticated: admin !== null,
        isLoading: false,
    }))
}

export function logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY)
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
        // subscribe returns unsubscribe fn
        return authStore.subscribe(() => {
            setState({ ...authStore.state })
        })
    }, [])

    return state
}
