import { authStore } from "store/auth.store"

export const BASE_API_URL = `${import.meta.env.VITE_BASE_API_URL}/api`

export const fetchAPI = async <T>(endpoint: string, options: RequestInit = {}): Promise<IResponse<T>> => {
    const { accessToken } = authStore.state
    const isFormData = options.body instanceof FormData
    const defaultHeaders: HeadersInit = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    }

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        }
    }

    try {
        const response = await fetch(`${BASE_API_URL}${endpoint}`, config)
        const data = await response.json();

        return {
            status: response.ok,
            statusCode: response.status,
            message: data.message,
            data: data.data
        }

    } catch (error) {
        return {
            status: false,
            statusCode: 500,
            message: 'An error occurred while fetching data.',
        }
    }
}