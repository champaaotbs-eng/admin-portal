import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAllAdminBusCompanies } from 'services/admins/bus-company.service'
import {
    createAdminSettlement,
    getAdminSettlements,
    markAdminSettlementPaid,
} from 'services/admins/settlement.service'
import type { ESettlementStatus, ISettlement } from 'types/revenue'
import type { ICompany } from 'types/company'

export type SettlementStatus = 'all' | 'pending' | 'paid'
const PAGE_SIZE = 20

export interface SettlementRow {
    id: string
    companyId: string
    periodFrom: string
    periodTo: string
    totalGross: number
    totalCommission: number
    totalNet: number
    status: Exclude<SettlementStatus, 'all'>
    bookingCount: number
    referenceCode: string
    createdAt: string
}

interface CreateSettlementPayload {
    companyId: string
    periodFrom: string
    periodTo: string
}

interface UseSettlementsTabProps {
    dialogOpen: boolean
    setDialogOpen: Dispatch<SetStateAction<boolean>>
    search: string
    setSearch: Dispatch<SetStateAction<string>>
    companyId: string
    setCompanyId: Dispatch<SetStateAction<string>>
    dateFrom: string
    setDateFrom: Dispatch<SetStateAction<string>>
    dateTo: string
    setDateTo: Dispatch<SetStateAction<string>>
    statusFilter: SettlementStatus
    setStatusFilter: Dispatch<SetStateAction<SettlementStatus>>
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

const readMeta = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return null
    return (payload as { meta?: { totalPages: number; totalItems: number } }).meta ?? null
}

const normalizeStatus = (status: unknown): SettlementRow['status'] => {
    const normalized = String(status ?? '').toLowerCase()
    return normalized === 'paid' ? 'paid' : 'pending'
}

const toSettlementRow = (settlement: ISettlement): SettlementRow => {
    const settlementId = settlement.settlementId ?? settlement.id
    const fallbackCode = settlementId
        ? `SETTLE-${settlementId.slice(-6).toUpperCase()}`
        : 'SETTLE-UNKNOWN'
    const unknownShape = settlement as unknown as { bookingCount?: number; referenceCode?: string }

    return {
        id: settlementId,
        companyId: settlement.companyId,
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

export const useSettlementsTab = ({
    dialogOpen,
    setDialogOpen,
    search,
    setSearch,
    companyId,
    setCompanyId,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    statusFilter,
    setStatusFilter,
}: UseSettlementsTabProps) => {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)

    const settlementsQuery = useQuery({
        queryKey: ['admin-revenue', 'settlements', page, companyId, dateFrom, dateTo, statusFilter],
        queryFn: () => getAdminSettlements({
            page,
            limit: PAGE_SIZE,
            companyId: companyId || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            status: statusFilter === 'all' ? undefined : statusFilter.toUpperCase() as ESettlementStatus,
        }),
    })

    const companiesQuery = useQuery({
        queryKey: ['admin-revenue', 'companies'],
        queryFn: () => getAllAdminBusCompanies(),
    })

    const markPaidMutation = useMutation({
        mutationFn: (settlementId: string) => markAdminSettlementPaid(settlementId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['admin-revenue', 'settlements'] })
        },
    })

    const createSettlementMutation = useMutation({
        mutationFn: (payload: CreateSettlementPayload) => createAdminSettlement(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['admin-revenue', 'settlements'] })
            setDialogOpen(false)
        },
    })

    const settlements = useMemo(() => {
        const payload = settlementsQuery.data?.data
        return readPaginationRows<ISettlement>(payload).map(toSettlementRow)
    }, [settlementsQuery.data])
    const meta = useMemo(() => readMeta(settlementsQuery.data?.data), [settlementsQuery.data])

    const companies = useMemo(() => {
        const payload = companiesQuery.data?.data
        return readPaginationRows<ICompany>(payload)
    }, [companiesQuery.data])

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return settlements.filter((settlement) => {
            const company = companies.find((item) => item.busCompanyId === settlement.companyId)
            if (q) {
                const matchesCompany = company?.name.toLowerCase().includes(q)
                const matchesCode = settlement.referenceCode.toLowerCase().includes(q)
                if (!matchesCompany && !matchesCode) return false
            }
            return true
        })
    }, [settlements, companies, search])

    const companyMap = useMemo(() => new Map(companies.map((company) => [company.busCompanyId, company.name])), [companies])

    const markPaid = async (settlementId: string) => {
        await markPaidMutation.mutateAsync(settlementId)
    }

    const createSettlement = async (payload: CreateSettlementPayload) => {
        await createSettlementMutation.mutateAsync(payload)
    }

    const openDialog = () => setDialogOpen(true)
    const closeDialog = () => setDialogOpen(false)
    const clearFilters = () => {
        setSearch('')
        setCompanyId('')
        setDateFrom('')
        setDateTo('')
        setStatusFilter('all')
        setPage(1)
    }
    const hasFilter = Boolean(search || companyId || dateFrom || dateTo || statusFilter !== 'all')

    return {
        dialogOpen, openDialog, closeDialog,
        settlements, filtered, companyMap,
        companies,
        companyId, setCompanyId,
        dateFrom, setDateFrom,
        dateTo, setDateTo,
        search, setSearch,
        statusFilter, setStatusFilter,
        clearFilters,
        hasFilter,
        page,
        setPage,
        totalPages: meta?.totalPages ?? 1,
        totalItems: meta?.totalItems ?? 0,
        pageSize: PAGE_SIZE,
        markPaid,
        createSettlement,
        isLoading: settlementsQuery.isLoading || companiesQuery.isLoading,
        isError: settlementsQuery.isError || companiesQuery.isError,
        isMarkingPaid: markPaidMutation.isPending,
        isCreatingSettlement: createSettlementMutation.isPending,
    }
}
