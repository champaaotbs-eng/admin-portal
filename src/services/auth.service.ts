import { MOCK_USERS } from '@/data/mock'
import { logout as storeLogout } from '@/store/auth.store'
import type { User } from 'types/user'


// Simulate async delay
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

export interface LoginPayload {
    username: string
    password: string
}

export interface AuthError {
    message: string
}

// In-memory user list (seeded from mock)
const users: User[] = [...MOCK_USERS]

// ─── Login ────────────────────────────────────────────────────────────────────


// ─── Logout ───────────────────────────────────────────────────────────────────

export function logout() {
    storeLogout()
}

// ─── Get all users (admin) ────────────────────────────────────────────────────

export async function getAllUsers(): Promise<User[]> {
    await delay(200)
    return [...users]
}

export async function toggleUserStatus(userId: string): Promise<User | null> {
    await delay(200)
    const user = users.find((u) => u.id === userId)
    if (!user) return null
    user.isActive = !user.isActive
    return { ...user }
}

export function isAuthError(val: unknown): val is AuthError {
    return typeof val === 'object' && val !== null && 'message' in val
}

// ─── Create user (admin) ──────────────────────────────────────────────────────

export interface CreateUserPayload {
    name: string
    username: string
    email: string
    phone?: string
    password: string
    role: string
    companyId?: string
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
    await delay()
    const user: User = {
        id: `u${Date.now()}`,
        ...payload,
        isActive: true,
        createdAt: new Date().toISOString(),
    }
    users.push(user)
    return user
}

// ─── Update user (admin) ──────────────────────────────────────────────────────

export interface UpdateUserPayload {
    name: string
    email: string
    phone?: string
    role: string
    companyId?: string
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User | null> {
    await delay()
    const user = users.find((u) => u.id === id)
    if (!user) return null
    Object.assign(user, payload)
    return { ...user }
}
