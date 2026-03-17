import { useMemo, Dispatch, SetStateAction } from 'react'
import { MOCK_COMPANIES } from '@/data/mock'
import type { Settlement } from '@/types'

export type SettlementStatus = 'all' | 'pending' | 'paid'

interface UseSettlementsTabProps {
    dialogOpen: boolean
    setDialogOpen: Dispatch<SetStateAction<boolean>>
    settlements: Settlement[]
    setSettlements: Dispatch<SetStateAction<Settlement[]>>
    search: string
    setSearch: Dispatch<SetStateAction<string>>
    statusFilter: SettlementStatus
    setStatusFilter: Dispatch<SetStateAction<SettlementStatus>>
}

export const useSettlementsTab = ({ dialogOpen, setDialogOpen, settlements, setSettlements, search, setSearch, statusFilter, setStatusFilter }: UseSettlementsTabProps) => {
    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return settlements.filter(s => {
            const company = MOCK_COMPANIES.find(c => c.id === s.companyId)
            if (q && !company?.name.toLowerCase().includes(q)) return false
            if (statusFilter !== 'all' && s.status !== statusFilter) return false
            return true
        })
    }, [settlements, search, statusFilter])

    const companyMap = useMemo(() => new Map(MOCK_COMPANIES.map(c => [c.id, c.name])), [])

    const markPaid = (id: string) => {
        setSettlements(ss => ss.map(s => s.id === id ? { ...s, status: 'paid' as const } : s))
    }

    const openDialog = () => setDialogOpen(true)
    const closeDialog = () => setDialogOpen(false)

    return {
        dialogOpen, openDialog, closeDialog,
        settlements, filtered, companyMap,
        search, setSearch,
        statusFilter, setStatusFilter,
        markPaid,
    }
}
