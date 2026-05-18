import { api } from 'utils/axios.instance'

export interface ICompanyDashboardMetrics {
    weekRevenue: number
    monthRevenue: number
    bookingsToday: number
    totalBuses: number
}

export interface ICompanyDashboardRouteRevenue {
    routeId: string
    label: string
    value: number
}

export interface ICompanyDashboardRevenuePoint {
    date: string
    label: string
    gross: number
    net: number
}

export interface ICompanyDashboardTrip {
    id: string
    route: string
    departureTime: string
    seats: number
    sold: number
    status: string
}

export interface ICompanyDashboardResponse {
    metrics: ICompanyDashboardMetrics
    fleetStatusCounts: Record<string, number>
    routeRevenueSeries: ICompanyDashboardRouteRevenue[]
    dailyRevenueSeries: ICompanyDashboardRevenuePoint[]
    recentTrips: ICompanyDashboardTrip[]
}

export const getCompanyDashboard = async () => {
    return api.get<ICompanyDashboardResponse>('/v1/company/dashboard')
}
