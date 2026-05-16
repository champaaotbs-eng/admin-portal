import { type Dispatch, type SetStateAction, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllAdminBusCompanies } from 'services/admins/bus-company.service'
import { getRevenues, getRevenueStats } from 'services/admins/revenue.service'
import type { ICompany } from 'types/company'
import type { IRevenue } from 'types/revenue'

const PAGE_SIZE = 20

interface UseRevenueTabProps {
    search: string
    companyId: string
    dateFrom: string
    dateTo: string
    setSearch: Dispatch<SetStateAction<string>>
    setCompanyId: Dispatch<SetStateAction<string>>
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

const readRows = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) return payload as T[]
    if (!payload || typeof payload !== 'object') return []
    const v = payload as { result?: T[]; data?: T[] }
    return Array.isArray(v.result) ? v.result : Array.isArray(v.data) ? v.data : []
}

const readMeta = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return null
    return (payload as { meta?: { totalPages: number; totalItems: number } }).meta ?? null
}

const toRow = (r: IRevenue): RevenueRow => {
    const gross = r.grossAmount ?? 0
    const commission = r.commission ?? 0
    return {
        id: r.id,
        companyId: r.companyId,
        bookingId: r.bookingId,
        grossAmount: gross,
        commissionRate: gross > 0 ? Number(((commission / gross) * 100).toFixed(2)) : 0,
        commissionAmount: commission,
        netAmount: r.netAmount ?? Math.max(gross - commission, 0),
        createdAt: r.createdAt,
    }
}

export const useRevenueTab = ({ search, companyId, dateFrom, dateTo, setSearch, setCompanyId, setDateFrom, setDateTo }: UseRevenueTabProps) => {
    const [page, setPage] = useState(1)

    const revenuesQuery = useQuery({
        queryKey: ['admin-revenue', 'transactions', page, companyId, dateFrom, dateTo],
        queryFn: () => getRevenues({
            page,
            limit: PAGE_SIZE,
            companyId: companyId || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
        }),
    })

    const statsQuery = useQuery({
        queryKey: ['admin-revenue', 'stats', companyId, dateFrom, dateTo],
        queryFn: () => getRevenueStats(dateFrom || undefined, dateTo || undefined, companyId || undefined),
    })

    const companiesQuery = useQuery({
        queryKey: ['admin-revenue', 'companies'],
        queryFn: () => getAllAdminBusCompanies(),
    })

    const rawPayload = (revenuesQuery.data as any)?.data ?? revenuesQuery.data
    const rows = useMemo(() => readRows<IRevenue>(rawPayload).map(toRow), [rawPayload])
    const meta = useMemo(() => readMeta(rawPayload), [rawPayload])

    const statsData = (statsQuery.data as any)?.data ?? statsQuery.data

    const companies = useMemo(() => readRows<ICompany>((companiesQuery.data as any)?.data ?? companiesQuery.data), [companiesQuery.data])
    const companyMap = useMemo(() => new Map(companies.map(c => [c.busCompanyId, c.name])), [companies])

    const filtered = useMemo(() => {
        if (!search) return rows
        return rows.filter(r => companyMap.get(r.companyId)?.toLowerCase().includes(search.toLowerCase()))
    }, [rows, companyMap, search])

    const totals = {
        gross: statsData?.totalGross ?? 0,
        commission: statsData?.totalCommission ?? 0,
        net: statsData?.totalNet ?? 0,
    }

    const dailyRevenues = useMemo(() => (statsData?.daily ?? []).map((d: { date: string; gross: number; commission: number; net: number }) => ({
        ...d,
        label: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    })), [statsData])

    const clearFilters = () => {
        setSearch('')
        setCompanyId('')
        setDateFrom('')
        setDateTo('')
        setPage(1)
    }
    const hasFilter = search || companyId || dateFrom || dateTo

    return {
        filtered,
        totals,
        companyMap,
        companies,
        clearFilters,
        hasFilter,
        dailyRevenues,
        page,
        setPage,
        totalPages: meta?.totalPages ?? 1,
        totalItems: statsData?.totalCount ?? meta?.totalItems ?? 0,
        pageSize: PAGE_SIZE,
        isLoading: revenuesQuery.isLoading || statsQuery.isLoading || companiesQuery.isLoading,
        isError: revenuesQuery.isError || statsQuery.isError || companiesQuery.isError,
    }
}
