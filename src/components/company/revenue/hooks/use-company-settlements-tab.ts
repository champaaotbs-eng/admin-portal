import { type Dispatch, type SetStateAction, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCompanySettlements } from 'services/company/settlement.service'
import type { ESettlementStatus, ISettlement } from 'types/revenue'

export type CompanySettlementStatus = 'all' | 'pending' | 'paid'

const PAGE_SIZE = 20

export interface CompanySettlementRow {
    id: string
    periodFrom: string
    periodTo: string
    totalGross: number
    totalCommission: number
    totalNet: number
    status: Exclude<CompanySettlementStatus, 'all'>
    bookingCount: number
    referenceCode: string
    createdAt: string
}

interface UseCompanySettlementsTabProps {
    search: string
    dateFrom: string
    dateTo: string
    statusFilter: CompanySettlementStatus
    setSearch: Dispatch<SetStateAction<string>>
    setDateFrom: Dispatch<SetStateAction<string>>
    setDateTo: Dispatch<SetStateAction<string>>
    setStatusFilter: Dispatch<SetStateAction<CompanySettlementStatus>>
}

const readPaginationRows = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) return payload as T[]
    if (!payload || typeof payload !== 'object') return []

    const value = payload as { data?: T[]; result?: T[] }
    if (Array.isArray(value.data)) return value.data
    if (Array.isArray(value.result)) return value.result
    return []
}

const readMeta = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return null
    return (payload as { meta?: { totalPages: number; totalItems: number } }).meta ?? null
}

const normalizeStatus = (status: unknown): CompanySettlementRow['status'] => {
    const normalized = String(status ?? '').toLowerCase()
    return normalized === 'paid' ? 'paid' : 'pending'
}

const toSettlementRow = (settlement: ISettlement): CompanySettlementRow => {
    const settlementId = settlement.settlementId ?? settlement.id
    const fallbackCode = settlementId
        ? `SETTLE-${settlementId.slice(-6).toUpperCase()}`
        : 'SETTLE-UNKNOWN'
    const unknownShape = settlement as unknown as { bookingCount?: number; referenceCode?: string }

    return {
        id: settlementId,
        periodFrom: settlement.periodFrom,
        periodTo: settlement.periodTo,
        totalGross: settlement.totalGross,
        totalCommission: settlement.totalCommission,
        totalNet: settlement.totalNet,
        status: normalizeStatus(settlement.status),
        bookingCount: unknownShape.bookingCount ?? 0,
        referenceCode: unknownShape.referenceCode ?? fallbackCode,
        createdAt: settlement.createdAt,
    }
}

export const useCompanySettlementsTab = ({
    search,
    dateFrom,
    dateTo,
    statusFilter,
    setSearch,
    setDateFrom,
    setDateTo,
    setStatusFilter,
}: UseCompanySettlementsTabProps) => {
    const [page, setPage] = useState(1)

    const settlementsQuery = useQuery({
        queryKey: ['company-revenue', 'settlements', page, dateFrom, dateTo, statusFilter],
        queryFn: () => getCompanySettlements({
            page,
            limit: PAGE_SIZE,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            status: statusFilter === 'all' ? undefined : statusFilter.toUpperCase() as ESettlementStatus,
        }),
    })

    const settlements = useMemo(() => {
        const payload = settlementsQuery.data?.data
        return readPaginationRows<ISettlement>(payload).map(toSettlementRow)
    }, [settlementsQuery.data])
    const meta = useMemo(() => readMeta(settlementsQuery.data?.data), [settlementsQuery.data])

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return settlements

        return settlements.filter((settlement) => settlement.referenceCode.toLowerCase().includes(query))
    }, [search, settlements])

    const clearFilters = () => {
        setSearch('')
        setDateFrom('')
        setDateTo('')
        setStatusFilter('all')
        setPage(1)
    }

    return {
        settlements,
        filtered,
        clearFilters,
        hasFilter: Boolean(search || dateFrom || dateTo || statusFilter !== 'all'),
        page,
        setPage,
        totalPages: meta?.totalPages ?? 1,
        totalItems: meta?.totalItems ?? 0,
        pageSize: PAGE_SIZE,
        isLoading: settlementsQuery.isLoading,
        isError: settlementsQuery.isError,
    }
}
