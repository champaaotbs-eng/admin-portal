import { useMemo, type Dispatch, type SetStateAction } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminBusCompanies } from 'services/admins/bus-company.service'
import {
    createAdminSettlement,
    getAdminSettlements,
    markAdminSettlementPaid,
} from 'services/admins/settlement.service'
import type { ISettlement } from 'types/revenue'
import type { ICompany } from 'types/company'

export type SettlementStatus = 'all' | 'pending' | 'paid'

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

const normalizeStatus = (status: unknown): SettlementRow['status'] => {
    const normalized = String(status ?? '').toLowerCase()
    return normalized === 'paid' ? 'paid' : 'pending'
}

const toSettlementRow = (settlement: ISettlement): SettlementRow => {
    const fallbackCode = `SETTLE-${settlement.settlementId.slice(-6).toUpperCase()}`
    const unknownShape = settlement as unknown as { bookingCount?: number; referenceCode?: string }

    return {
        id: settlement.settlementId,
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

export const useSettlementsTab = ({ dialogOpen, setDialogOpen, search, setSearch, statusFilter, setStatusFilter }: UseSettlementsTabProps) => {
    const queryClient = useQueryClient()

    const settlementsQuery = useQuery({
        queryKey: ['admin-revenue', 'settlements'],
        queryFn: () => getAdminSettlements({ page: 1, limit: 1000 }),
    })

    const companiesQuery = useQuery({
        queryKey: ['admin-revenue', 'companies'],
        queryFn: () => getAdminBusCompanies({ page: 1, limit: 1000 }),
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

    const companies = useMemo(() => {
        const payload = companiesQuery.data?.data
        return readPaginationRows<ICompany>(payload)
    }, [companiesQuery.data])

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return settlements.filter((settlement) => {
            const company = companies.find((item) => item.busCompanyId === settlement.companyId)
            if (q && !company?.name.toLowerCase().includes(q)) return false
            if (statusFilter !== 'all' && settlement.status !== statusFilter) return false
            return true
        })
    }, [settlements, companies, search, statusFilter])

    const companyMap = useMemo(() => new Map(companies.map((company) => [company.busCompanyId, company.name])), [companies])

    const markPaid = async (settlementId: string) => {
        await markPaidMutation.mutateAsync(settlementId)
    }

    const createSettlement = async (payload: CreateSettlementPayload) => {
        await createSettlementMutation.mutateAsync(payload)
    }

    const openDialog = () => setDialogOpen(true)
    const closeDialog = () => setDialogOpen(false)

    return {
        dialogOpen, openDialog, closeDialog,
        settlements, filtered, companyMap,
        companies,
        search, setSearch,
        statusFilter, setStatusFilter,
        markPaid,
        createSettlement,
        isLoading: settlementsQuery.isLoading || companiesQuery.isLoading,
        isError: settlementsQuery.isError || companiesQuery.isError,
        isMarkingPaid: markPaidMutation.isPending,
        isCreatingSettlement: createSettlementMutation.isPending,
    }
}
