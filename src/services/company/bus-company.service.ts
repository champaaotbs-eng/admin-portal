import { fetchAPI } from 'lib/fetch-api'
import type { BusCompany } from '@/types'

export type BusCompanyApiStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export interface PaginationMeta {
    page: number
    limit: number
    totalPages: number
    totalItems: number
}

export interface BusCompanyApiItem {
    id: string
    name: string
    phone?: string
    email?: string
    address?: string
    serviceFee: number
    logoUrl?: string
    status: BusCompanyApiStatus
    createdAt: string
}

export interface BusCompanyAdminApiItem {
    adminId: string
    companyId: string
    position: 'OWNER' | 'STAFF'
    createdAt: string
    fullName: string
    username: string
    avatarUrl?: string
    isActive: boolean
}

interface PaginationResponse<T> {
    meta: {
        page: number
        limit: number
        totalPages: number
        totalItems: number
    }
    result: T[]
}

export interface GetCompaniesResult {
    items: BusCompany[]
    meta: PaginationMeta
}

export interface AdminApiItem {
    adminId: string
    username: string
    fullName: string
    roleId: string
    avatarUrl?: string
    isActive: boolean
    createdAt: string
}

export interface AddBusCompanyAdminPayload {
    adminId: string
    position: 'OWNER' | 'STAFF'
}

export interface GetCompaniesParams {
    page?: number
    limit?: number
    search?: string
    status?: 'all' | 'active' | 'inactive'
    sortKey?: 'name' | 'email' | 'serviceFee' | 'status' | 'createdAt' | null
    sortDir?: 'asc' | 'desc'
}

export interface CreateBusCompanyPayload {
    name: string
    email: string
    phone: string
    address: string
    serviceFee?: number
    ownerId?: string
}

export interface UpdateBusCompanyPayload {
    name: string
    email: string
    phone: string
    address: string
    serviceFee: number
    status?: BusCompanyApiStatus
}

function toUiCompany(item: BusCompanyApiItem): BusCompany {
    const isActive = item.status === 'ACTIVE'
    return {
        id: item.id,
        name: item.name,
        email: item.email ?? '',
        phone: item.phone ?? '',
        address: item.address ?? '',
        serviceFee: item.serviceFee,
        logoUrl: item.logoUrl,
        status: isActive ? 'active' : 'locked',
        isActive,
        createdAt: item.createdAt,
    }
}

const defaultPaginationMeta: PaginationMeta = {
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
}

function mapSortKey(sortKey: GetCompaniesParams['sortKey']) {
    if (!sortKey) return null
    if (sortKey === 'status') return 'status'
    return sortKey
}

export async function getAllCompanies(params: GetCompaniesParams = {}): Promise<GetCompaniesResult> {
    const page = params.page ?? 1
    const limit = params.limit ?? 10

    const filters: Record<string, string> = {}
    if (params.search?.trim()) {
        filters.name = params.search.trim()
    }
    if (params.status === 'active') {
        filters.status = 'ACTIVE'
    }
    if (params.status === 'inactive') {
        filters.status = 'INACTIVE'
    }

    const sortKey = mapSortKey(params.sortKey)
    const sort = sortKey
        ? [{ orderBy: sortKey, order: (params.sortDir === 'desc' ? 'DESC' : 'ASC') as 'ASC' | 'DESC' }]
        : []

    const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    })

    if (Object.keys(filters).length > 0) {
        query.set('filters', JSON.stringify(filters))
    }
    if (sort.length > 0) {
        query.set('sort', JSON.stringify(sort))
    }

    const response = await fetchAPI<PaginationResponse<BusCompanyApiItem>>(`/v1/bus-companies?${query.toString()}`)
    if (!response.status || !response.data) {
        return {
            items: [],
            meta: defaultPaginationMeta,
        }
    }

    return {
        items: response.data.result.map(toUiCompany),
        meta: response.data.meta,
    }
}

export async function getCompanyById(id: string): Promise<BusCompany | null> {
    const response = await fetchAPI<BusCompanyApiItem>(`/v1/bus-companies/${id}`)
    if (!response.status || !response.data) return null
    return toUiCompany(response.data)
}

export async function createCompany(payload: CreateBusCompanyPayload): Promise<BusCompany> {
    const response = await fetchAPI<BusCompanyApiItem>('/v1/bus-companies', {
        method: 'POST',
        body: JSON.stringify(payload),
    })

    if (!response.status || !response.data) {
        throw new Error(Array.isArray(response.message) ? response.message.join(', ') : response.message || 'Failed to create company')
    }

    return toUiCompany(response.data)
}

export async function updateCompany(id: string, payload: UpdateBusCompanyPayload): Promise<BusCompany | null> {
    const response = await fetchAPI<BusCompanyApiItem>(`/v1/bus-companies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    })

    if (!response.status || !response.data) return null
    return toUiCompany(response.data)
}

export async function deleteCompany(id: string): Promise<boolean> {
    const response = await fetchAPI<void>(`/v1/bus-companies/${id}`, {
        method: 'DELETE',
    })

    return response.status
}

export async function toggleCompanyStatus(company: BusCompany): Promise<BusCompany | null> {
    const nextStatus: BusCompanyApiStatus = company.isActive ? 'INACTIVE' : 'ACTIVE'
    return updateCompany(company.id, {
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        serviceFee: Number(company.serviceFee) || 0,
        status: nextStatus,
    })
}

export async function getCompanyAdmins(companyId: string): Promise<BusCompanyAdminApiItem[]> {
    const response = await fetchAPI<BusCompanyAdminApiItem[]>(`/v1/bus-companies/${companyId}/admins`)
    if (!response.status || !response.data) return []
    return response.data
}

export async function addCompanyAdmin(companyId: string, payload: AddBusCompanyAdminPayload): Promise<BusCompanyAdminApiItem | null> {
    const response = await fetchAPI<BusCompanyAdminApiItem>(`/v1/bus-companies/${companyId}/admins`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })

    if (!response.status || !response.data) return null
    return response.data
}

export async function removeCompanyAdmin(companyId: string, adminId: string): Promise<boolean> {
    const response = await fetchAPI<void>(`/v1/bus-companies/${companyId}/admins/${adminId}`, {
        method: 'DELETE',
    })

    return response.status
}

export async function getAllAdmins(search?: string): Promise<AdminApiItem[]> {
    const query = new URLSearchParams()
    query.set('page', '1')
    query.set('limit', '1000')

    if (search?.trim()) {
        const filters = { fullName: search.trim() }
        query.set('filters', JSON.stringify(filters))
    }

    const response = await fetchAPI<PaginationResponse<AdminApiItem>>(`/v1/admins?${query.toString()}`)
    if (!response.status || !response.data) return []
    return response.data.result
}
