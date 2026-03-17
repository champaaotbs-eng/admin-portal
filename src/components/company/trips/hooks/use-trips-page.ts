import { Dispatch, SetStateAction, useMemo } from 'react'
import { MOCK_TRIPS } from '../data'

interface UseTripsPageProps {
    search: string
    setSearch: Dispatch<SetStateAction<string>>
    statusFilter: string
    setStatusFilter: Dispatch<SetStateAction<string>>
    setDialogOpen: Dispatch<SetStateAction<boolean>>
}

export const useTripsPage = ({ search, setSearch, statusFilter, setStatusFilter, setDialogOpen }: UseTripsPageProps) => {
    const filtered = useMemo(() => {
        let list = MOCK_TRIPS
        if (search) {
            const q = search.toLowerCase()
            list = list.filter(t => t.route.toLowerCase().includes(q) || t.bus.includes(q) || t.driver.toLowerCase().includes(q))
        }
        if (statusFilter !== 'all') list = list.filter(t => t.status === statusFilter)
        return list
    }, [search, statusFilter])

    const stats = useMemo(() => ({
        total: MOCK_TRIPS.length,
        scheduled: MOCK_TRIPS.filter(t => t.status === 'scheduled').length,
        completed: MOCK_TRIPS.filter(t => t.status === 'completed').length,
        cancelled: MOCK_TRIPS.filter(t => t.status === 'cancelled').length,
    }), [])

    const openDialog = () => setDialogOpen(true)
    const closeDialog = () => setDialogOpen(false)
    const clearFilters = () => { setSearch(''); setStatusFilter('all') }
    const hasFilter = search || statusFilter !== 'all'

    return {
        filtered, stats,
        openDialog, closeDialog,
        clearFilters, hasFilter,
    }
}
