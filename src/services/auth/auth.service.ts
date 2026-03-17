import { setAuth } from "store/auth.store"
import type { ILogin, IResponseAuth } from "./auth.types"
import { fetchAPI } from "lib/fetch-api"

export const login = async (payload: ILogin) => {
    const response = await fetchAPI<IResponseAuth>('/v1/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify(payload)
    })

    if (response.status && response.data) {
        setAuth(response.data.admin || null, response.data.accessToken || null)
    }
    return response;
}

export const refresh = async (refreshToken: string) => {
    const response = await fetchAPI<IResponseAuth>('auth/refresh', {
        method: 'POST'
    })

}
