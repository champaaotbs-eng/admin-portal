import axios from "axios";
import i18n from '@/i18n'
import { refresh } from "services/auth/auth.service";
import { authStore, logout } from "store/auth.store";

const rawBaseUrl = String(import.meta.env.VITE_BASE_API_URL ?? '').replace(/\/+$/, '')
export const BASE_API_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`

export const instance = axios.create({
    baseURL: BASE_API_URL,
    timeout: 10000,
    withCredentials: true,
});

let refreshPromise: Promise<unknown> | null = null
let hasForcedLoginRedirect = false

const resolveErrorKey = (error: any): string | null => {
    const message = error?.response?.data?.message

    if (typeof message === 'string' && message.length > 0) {
        return message
    }

    if (Array.isArray(message)) {
        const firstString = message.find((item) => typeof item === 'string' && item.length > 0)
        return firstString ?? null
    }

    return null
}

const resolveLocalizedMessage = (error: any) => {
    const status = error?.response?.status
    const key = resolveErrorKey(error)

    if (key && i18n.exists(`errors.${key}`)) {
        return i18n.t(`errors.${key}`)
    }

    if (status === 401) {
        return i18n.t('errors.unauthorized')
    }

    return i18n.t('errors.internal_server_error')
}

instance.interceptors.request.use(
    function (config) {
        const { accessToken } = authStore.state
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`
        }
        return config;
    },
    function (error) {
        // Do something with the request error
        return Promise.reject(error);
    },
);

// Add a response interceptor
instance.interceptors.response.use(
    function (response) {
        hasForcedLoginRedirect = false

        if (response?.data) return response?.data

        return response;
    },
    async function (error) {
        // Any status codes that fall outside the range of 2xx cause this function to trigger
        // Do something with response error
        const status = error?.response?.status
        const requestUrl = String(error?.config?.url ?? '')
        const isAuthEndpoint = requestUrl.includes('/v1/auth/admin/login') || requestUrl.includes('/v1/auth/refresh')
        const originalRequest = error?.config as (typeof error.config & { _retryAfterRefresh?: boolean }) | undefined

        error.localizedMessage = resolveLocalizedMessage(error)

        if (status === 401 && !isAuthEndpoint) {
            try {
                if (!refreshPromise) {
                    refreshPromise = refresh().finally(() => {
                        refreshPromise = null
                    })
                }

                await refreshPromise

                if (originalRequest && !originalRequest._retryAfterRefresh) {
                    originalRequest._retryAfterRefresh = true
                    return instance.request(originalRequest)
                }
            } catch {
                logout()

                if (
                    typeof window !== 'undefined'
                    && window.location.pathname !== '/auth/login'
                    && !hasForcedLoginRedirect
                ) {
                    hasForcedLoginRedirect = true
                    window.location.replace('/auth/login')
                }
            }
        }

        return Promise.reject(error);
    },
);

export const api = {
    get: <T>(...args: Parameters<typeof instance.get>): Promise<IResponse<T>> =>
        instance.get<any, IResponse<T>>(...args),

    post: <T>(...args: Parameters<typeof instance.post>): Promise<IResponse<T>> =>
        instance.post<any, IResponse<T>>(...args),

    put: <T>(...args: Parameters<typeof instance.put>): Promise<IResponse<T>> =>
        instance.put<any, IResponse<T>>(...args),

    patch: <T>(...args: Parameters<typeof instance.patch>): Promise<IResponse<T>> =>
        instance.patch<any, IResponse<T>>(...args),

    delete: <T>(...args: Parameters<typeof instance.delete>): Promise<IResponse<T>> =>
        instance.delete<any, IResponse<T>>(...args),
}
