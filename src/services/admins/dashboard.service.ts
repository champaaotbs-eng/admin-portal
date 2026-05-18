import { api } from 'utils/axios.instance'

export interface IAdminDashboardMetrics {
    bookingsToday: number
    bookingsLast7Days: number
    grossRevenue: number
    totalCommission: number
    activeCompanies: number
    totalCompanies: number
    tripsToday: number
    activeTrips: number
}

export interface IAdminDashboardRevenuePoint {
    date: string
    label: string
    gross: number
    commission: number
    bookings: number
}

export interface IAdminDashboardCompanyRevenue {
    companyId: string
    label: string
    value: number
}

export interface IAdminDashboardBooking {
    id: string
    bookingCode: string
    routeLabel: string
    totalAmount: number
    status: string
    paymentStatus: string
    createdAt: string
}

export interface IAdminDashboardSettlement {
    id: string
    companyName: string
    periodFrom: string
    totalNet: number
    bookingCount: number
}

export interface IAdminDashboardResponse {
    metrics: IAdminDashboardMetrics
    bookingStatusCounts: Record<string, number>
    dailyRevenueSeries: IAdminDashboardRevenuePoint[]
    companyRevenueSeries: IAdminDashboardCompanyRevenue[]
    recentBookings: IAdminDashboardBooking[]
    pendingSettlements: IAdminDashboardSettlement[]
}

export const getAdminDashboard = async () => {
    return api.get<IAdminDashboardResponse>('/v1/admin/dashboard')
}
