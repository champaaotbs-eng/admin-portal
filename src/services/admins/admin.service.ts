import { MOCK_COMPANIES, MOCK_BUSES } from '@/data/mock'
import type { BusCompany, Bus, AdminStats, BusType, IPagination, IRequestPagination } from '@/types'
import { getAllUsers } from '../auth.service'
import { getAllTrips } from '../trip.service'
import { getAllTickets } from '../booking.service'
import { api } from 'utils/axios.instance'
import type { IAdmin } from 'types/admin'

export const getAllAdmins = async (query: IRequestPagination<IAdmin>) => {
    const urlQuery = new URLSearchParams()

    urlQuery.set('page', String(query.page))
    urlQuery.set('limit', String(query.limit))
    if (query.filters) {
        urlQuery.set('filters', JSON.stringify(query.filters))
    }
    const response = await api.get<IPagination<IAdmin>>(`/v1/admins?${urlQuery.toString()}`);
    return response;
}

export const getAvailableAdmins = async () => {
    const response = await api.get<IAdmin[]>(`/v1/admins/company-admins/available`);
    return response;
}

export const getAdminById = async (adminId: string) => {
    const response = await api.get<IAdmin>(`/v1/admins/${adminId}`);
    return response;
}

export const createAdmin = async (payload: Partial<IAdmin>) => {
    const response = await api.post<IAdmin>('/v1/admins', payload);
    return response;
}

export const updateAdmin = async (adminId: string, payload: Partial<IAdmin>) => {
    const response = await api.patch<IAdmin>(`/v1/admins/${adminId}`, payload);
    return response;
}

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

const companies: BusCompany[] = [...MOCK_COMPANIES]
let nextCompanyId = companies.length + 1

const buses: Bus[] = [...MOCK_BUSES]
let nextBusId = buses.length + 1

// ─── Companies ───────────────────────────────────────────────────────────────

export async function getAllCompanies(): Promise<BusCompany[]> {
    await delay(200)
    return [...companies]
}

export async function getCompanyById(id: string): Promise<BusCompany | null> {
    await delay(100)
    return companies.find((c) => c.id === id) ?? null
}

export interface CreateCompanyPayload {
    name: string
    phone: string
    email: string
    address: string
    serviceFee?: number
}

export interface UpdateCompanyPayload {
    name: string
    phone: string
    email: string
    address: string
    serviceFee: number
}

export async function createCompany(
    payload: CreateCompanyPayload,
): Promise<BusCompany> {
    await delay()
    const company: BusCompany = {
        id: `c${nextCompanyId++}`,
        ...payload,
        isActive: true,
        serviceFee: payload.serviceFee ?? 5,
        status: 'active',
        createdAt: new Date().toISOString(),
    }
    companies.push(company)
    return company
}

export async function updateCompany(
    id: string,
    payload: UpdateCompanyPayload,
): Promise<BusCompany | null> {
    await delay()
    const company = companies.find((c) => c.id === id)
    if (!company) return null
    Object.assign(company, payload)
    return { ...company }
}

export async function toggleCompanyStatus(
    companyId: string,
): Promise<BusCompany | null> {
    await delay(200)
    const company = companies.find((c) => c.id === companyId)
    if (!company) return null
    company.isActive = !company.isActive
    return { ...company }
}

// ─── Buses ────────────────────────────────────────────────────────────────────

export async function getAllBuses(): Promise<Bus[]> {
    await delay(200)
    return [...buses]
}

export async function getBusesByCompany(companyId: string): Promise<Bus[]> {
    await delay(100)
    return buses.filter((b) => b.companyId === companyId)
}

export interface CreateBusPayload {
    companyId: string
    plateNumber: string
    name: string
    totalSeats: number
    type: BusType
}

export async function createBus(payload: CreateBusPayload): Promise<Bus> {
    await delay()
    const bus: Bus = {
        id: `b${nextBusId++}`,
        ...payload,
        isActive: true,
    }
    buses.push(bus)
    return bus
}

export async function toggleBusStatus(busId: string): Promise<Bus | null> {
    await delay(200)
    const bus = buses.find((b) => b.id === busId)
    if (!bus) return null
    bus.isActive = !bus.isActive
    return { ...bus }
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
    const [users, trips, tickets] = await Promise.all([
        getAllUsers(),
        getAllTrips(),
        getAllTickets(),
    ])

    const totalRevenueVnd = tickets
        .filter((t) => t.status === 'confirmed' || t.status === 'completed')
        .reduce((sum, t) => sum + t.totalPrice, 0)

    return {
        totalUsers: users.length,
        totalCompanies: companies.filter((c) => c.isActive).length,
        totalTrips: trips.length,
        totalTickets: tickets.length,
        totalRevenueVnd,
    }
}
