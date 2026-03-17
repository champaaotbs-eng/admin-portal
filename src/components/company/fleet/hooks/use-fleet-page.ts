import { Dispatch, SetStateAction, useMemo } from 'react'
import { MOCK_FLEET } from '../data'
import type { BusType, FleetItem } from '../data'

interface UseFleetPageProps {
    search: string
    setSearch: Dispatch<SetStateAction<string>>
    typeFilter: BusType | 'all'
    setTypeFilter: Dispatch<SetStateAction<BusType | 'all'>>
    setDialogOpen: Dispatch<SetStateAction<boolean>>
    setSelected: Dispatch<SetStateAction<FleetItem | null>>
}

export const useFleetPage = ({ search, setSearch, typeFilter, setTypeFilter, setDialogOpen, setSelected }: UseFleetPageProps) => {
    const filtered = useMemo(() => {
        let list = MOCK_FLEET
        if (search) list = list.filter(b => b.plateNumber.toLowerCase().includes(search.toLowerCase()) || b.name.toLowerCase().includes(search.toLowerCase()))
        if (typeFilter !== 'all') list = list.filter(b => b.type === typeFilter)
        return list
    }, [search, typeFilter])

    const stats = useMemo(() => ({
        total: MOCK_FLEET.length,
        active: MOCK_FLEET.filter(b => b.status === 'active').length,
        maintenance: MOCK_FLEET.filter(b => b.status === 'maintenance').length,
        inactive: MOCK_FLEET.filter(b => b.status === 'inactive').length,
    }), [])

    const openAdd = () => { setSelected(null); setDialogOpen(true) }
    const openEdit = (bus: FleetItem) => { setSelected(bus); setDialogOpen(true) }
    const closeDialog = () => setDialogOpen(false)
    const clearFilters = () => { setSearch(''); setTypeFilter('all') }
    const hasFilter = search || typeFilter !== 'all'

    return {
        filtered, stats,
        openAdd, openEdit, closeDialog,
        clearFilters, hasFilter,
    }
}
