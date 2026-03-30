import axios from "axios";
import { refresh } from "services/auth/auth.service";
import { authStore } from "store/auth.store";

const rawBaseUrl = String(import.meta.env.VITE_BASE_API_URL ?? '').replace(/\/+$/, '')
export const BASE_API_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`

export const instance = axios.create({
    baseURL: BASE_API_URL,
    timeout: 10000,
    withCredentials: true,
});

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
        if (response?.data) return response?.data

        return response;
    },
    async function (error) {
        // Any status codes that fall outside the range of 2xx cause this function to trigger
        // Do something with response error
        const status = error?.response?.status
        const requestUrl = String(error?.config?.url ?? '')
        const isAuthEndpoint = requestUrl.includes('/v1/auth/admin/login') || requestUrl.includes('/v1/auth/refresh')

        if (status === 401 && !isAuthEndpoint) {
            try {
                await refresh()
            } catch {
                // Let caller handle the original request failure.
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
