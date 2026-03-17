import type { RoleEnum } from "./role"

export interface User {
    id: string
    name: string
    username: string
    email: string
    password: string // hashed in real app
    role: RoleEnum
    companyId?: string // only for bus_company role
    phone?: string
    avatarUrl?: string
    provider?: string // social login provider
    isVerified?: boolean
    isActive: boolean
    createdAt: string
}