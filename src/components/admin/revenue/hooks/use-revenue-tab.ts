import { Dispatch, SetStateAction, useMemo } from 'react'
import { MOCK_REVENUES, MOCK_DAILY_REVENUES } from '@/data/mock-extended'
import { MOCK_COMPANIES } from '@/data/mock'

interface UseRevenueTabProps {
    search: string
    dateFrom: string
    dateTo: string
    setSearch: Dispatch<SetStateAction<string>>
    setDateFrom: Dispatch<SetStateAction<string>>
    setDateTo: Dispatch<SetStateAction<string>>
}

export const useRevenueTab = ({ search, dateFrom, dateTo, setSearch, setDateFrom, setDateTo }: UseRevenueTabProps) => {
    const filtered = useMemo(() => MOCK_REVENUES.filter(r => {
        if (search) {
            const company = MOCK_COMPANIES.find(c => c.id === r.companyId)
            if (!company?.name.toLowerCase().includes(search.toLowerCase())) return false
        }
        if (dateFrom && r.createdAt < dateFrom) return false
        if (dateTo && r.createdAt > dateTo + 'T23:59:59') return false
        return true
    }), [search, dateFrom, dateTo])

    const totals = useMemo(() => ({
        gross: filtered.reduce((s, r) => s + r.grossAmount, 0),
        commission: filtered.reduce((s, r) => s + r.commissionAmount, 0),
        net: filtered.reduce((s, r) => s + r.netAmount, 0),
    }), [filtered])

    const companyMap = useMemo(() => new Map(MOCK_COMPANIES.map(c => [c.id, c.name])), [])

    const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo('') }
    const hasFilter = search || dateFrom || dateTo

    return { filtered, totals, companyMap, clearFilters, hasFilter, dailyRevenues: MOCK_DAILY_REVENUES }
}
