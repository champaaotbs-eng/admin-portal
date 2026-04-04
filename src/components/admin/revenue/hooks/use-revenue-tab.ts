import { type Dispatch, type SetStateAction, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAdminBusCompanies } from 'services/admins/bus-company.service'
import { getAdminRevenues } from 'services/admins/revenue.service'
import type { ICompany } from 'types/company'
import type { IRevenue } from 'types/revenue'

interface UseRevenueTabProps {
    search: string
    dateFrom: string
    dateTo: string
    setSearch: Dispatch<SetStateAction<string>>
    setDateFrom: Dispatch<SetStateAction<string>>
    setDateTo: Dispatch<SetStateAction<string>>
}

interface RevenueRow {
    id: string
    companyId: string
    bookingId: string
    grossAmount: number
    commissionRate: number
    commissionAmount: number
    netAmount: number
    createdAt: string
}

interface DailyRevenueRow {
    date: string
    label: string
    gross: number
    commission: number
    net: number
}

const readPaginationRows = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) {
        return payload as T[]
    }

    if (!payload || typeof payload !== 'object') {
        return []
    }

    const value = payload as { data?: T[]; result?: T[] }
    if (Array.isArray(value.data)) return value.data
    if (Array.isArray(value.result)) return value.result
    return []
}

const toRevenueRow = (revenue: IRevenue): RevenueRow => {
    const grossAmount = revenue.grossAmount ?? 0
    const commissionAmount = revenue.commission ?? 0
    const netAmount = revenue.netAmount ?? Math.max(grossAmount - commissionAmount, 0)

    return {
        id: revenue.revenueId,
        companyId: revenue.companyId,
        bookingId: revenue.bookingId,
        grossAmount,
        commissionRate: grossAmount > 0 ? Number(((commissionAmount / grossAmount) * 100).toFixed(2)) : 0,
        commissionAmount,
        netAmount,
        createdAt: revenue.createdAt,
    }
}

export const useRevenueTab = ({ search, dateFrom, dateTo, setSearch, setDateFrom, setDateTo }: UseRevenueTabProps) => {
    const revenuesQuery = useQuery({
        queryKey: ['admin-revenue', 'transactions'],
        queryFn: () => getAdminRevenues({ page: 1, limit: 1000 }),
    })

    const companiesQuery = useQuery({
        queryKey: ['admin-revenue', 'companies'],
        queryFn: () => getAdminBusCompanies({ page: 1, limit: 1000 }),
    })

    const revenues = useMemo(() => {
        const payload = revenuesQuery.data?.data
        return readPaginationRows<IRevenue>(payload).map(toRevenueRow)
    }, [revenuesQuery.data])

    const companies = useMemo(() => {
        const payload = companiesQuery.data?.data
        return readPaginationRows<ICompany>(payload)
    }, [companiesQuery.data])

    const companyMap = useMemo(() => new Map(companies.map((company) => [company.busCompanyId, company.name])), [companies])

    const filtered = useMemo(() => revenues.filter((revenue) => {
        if (search) {
            const companyName = companyMap.get(revenue.companyId)
            if (!companyName?.toLowerCase().includes(search.toLowerCase())) return false
        }
        if (dateFrom && revenue.createdAt < dateFrom) return false
        if (dateTo && revenue.createdAt > `${dateTo}T23:59:59`) return false
        return true
    }), [revenues, companyMap, search, dateFrom, dateTo])

    const totals = useMemo(() => ({
        gross: filtered.reduce((sum, revenue) => sum + revenue.grossAmount, 0),
        commission: filtered.reduce((sum, revenue) => sum + revenue.commissionAmount, 0),
        net: filtered.reduce((sum, revenue) => sum + revenue.netAmount, 0),
    }), [filtered])

    const dailyRevenues = useMemo(() => {
        const map = new Map<string, DailyRevenueRow>()

        for (const revenue of filtered) {
            const date = revenue.createdAt.slice(0, 10)
            const current = map.get(date) ?? {
                date,
                label: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                gross: 0,
                commission: 0,
                net: 0,
            }

            current.gross += revenue.grossAmount
            current.commission += revenue.commissionAmount
            current.net += revenue.netAmount

            map.set(date, current)
        }

        return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
    }, [filtered])

    const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo('') }
    const hasFilter = search || dateFrom || dateTo

    return {
        filtered,
        totals,
        companyMap,
        clearFilters,
        hasFilter,
        dailyRevenues,
        isLoading: revenuesQuery.isLoading || companiesQuery.isLoading,
        isError: revenuesQuery.isError || companiesQuery.isError,
    }
}
