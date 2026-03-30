import { logout as storeLogout } from '@/store/auth.store'
import type { User } from 'types/user'
import { instance } from 'utils/axios.instance'

interface PaginationResponse<T> {
    meta: {
        page: number
        limit: number
        totalPages: number
        totalItems: number
    }
    result: T[]
}

interface AdminApiItem {
    adminId: string
    username: string
    fullName: string
    roleId?: string | number
    email?: string
    phone?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

interface CreateAdminApiPayload {
    username: string
    fullName: string
    password: string
    roleId?: string
    email?: string
    phone?: string
    isActive?: boolean
}

interface UpdateAdminApiPayload {
    username?: string
    fullName?: string
    roleId?: string
    email?: string
    phone?: string
    isActive?: boolean
}

const localStatusOverrides = new Map<string, boolean>()
const localContactOverrides = new Map<string, { email?: string; phone?: string }>()

const mapAdminToUser = (admin: AdminApiItem): User => {
    const localContact = localContactOverrides.get(admin.adminId)
    const statusOverride = localStatusOverrides.get(admin.adminId)

    return {
        id: admin.adminId,
        name: admin.fullName,
        username: admin.username,
        email: localContact?.email ?? admin.email ?? '',
        password: '',
        role: String(admin.roleId ?? ''),
        phone: localContact?.phone ?? admin.phone,
        isActive: statusOverride ?? admin.isActive,
        createdAt: admin.createdAt,
    }
}

async function patchAdmin(id: string, payload: UpdateAdminApiPayload): Promise<AdminApiItem | null> {
    const response = await instance.patch<AdminApiItem>(`/v1/admins/${id}`, payload)

    if (!response.status || !response.data) {
        return null
    }

    return response.data
}

export interface AuthError {
    message: string
}

export function logout() {
    storeLogout()
}

export async function getAllUsers(): Promise<User[]> {
    const response = await instance.get<PaginationResponse<AdminApiItem>>('/v1/admins?page=1&limit=1000')
    if (!response.status || !response.data) {
        return []
    }

    return response.data.result.map(mapAdminToUser)
}

export async function toggleUserStatus(userId: string): Promise<User | null> {
    const users = await getAllUsers()
    const target = users.find((user) => user.id === userId)
    if (!target) {
        return null
    }

    const nextStatus = !target.isActive
    const updatedAdmin = await patchAdmin(userId, { isActive: nextStatus })

    if (updatedAdmin) {
        return mapAdminToUser(updatedAdmin)
    }

    localStatusOverrides.set(userId, nextStatus)
    return { ...target, isActive: nextStatus }
}

export function isAuthError(val: unknown): val is AuthError {
    return typeof val === 'object' && val !== null && 'message' in val
}

export interface CreateUserPayload {
    name: string
    username: string
    email: string
    phone?: string
    password: string
    role: string
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
    const requestPayload: CreateAdminApiPayload = {
        username: payload.username,
        fullName: payload.name,
        password: payload.password,
        roleId: payload.role || undefined,
        email: payload.email || undefined,
        phone: payload.phone || undefined,
        isActive: true,
    }

    const response = await instance.post<AdminApiItem>('/v1/admins', requestPayload)

    if (!response.status || !response.data) {
        throw new Error('Failed to create user')
    }

    if (payload.email || payload.phone) {
        localContactOverrides.set(response.data.adminId, {
            email: payload.email,
            phone: payload.phone,
        })
    }

    return mapAdminToUser(response.data)
}

export interface UpdateUserPayload {
    name: string
    email: string
    phone?: string
    role: string
    isActive?: boolean
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User | null> {
    const requestPayload: UpdateAdminApiPayload = {
        fullName: payload.name,
        roleId: payload.role || undefined,
        email: payload.email || undefined,
        phone: payload.phone || undefined,
        isActive: payload.isActive,
    }

    const updatedAdmin = await patchAdmin(id, requestPayload)
    if (!updatedAdmin) {
        return null
    }

    localContactOverrides.set(id, {
        email: payload.email,
        phone: payload.phone,
    })

    return mapAdminToUser(updatedAdmin)
}
