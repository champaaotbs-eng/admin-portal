import { Dispatch, SetStateAction, useMemo } from 'react'
import { MOCK_STAFF, COMPANY_ROLES } from '../data'
import type { CompanyRole, StaffItem } from '../data'

interface UseStaffPageProps {
    search: string
    setSearch: Dispatch<SetStateAction<string>>
    roleFilter: CompanyRole | 'all'
    setRoleFilter: Dispatch<SetStateAction<CompanyRole | 'all'>>
    setDialogOpen: Dispatch<SetStateAction<boolean>>
    setSelected: Dispatch<SetStateAction<StaffItem | null>>
}

export const useStaffPage = ({ search, setSearch, roleFilter, setRoleFilter, setDialogOpen, setSelected }: UseStaffPageProps) => {
    const filtered = useMemo(() => {
        let list = MOCK_STAFF
        if (search) {
            const q = search.toLowerCase()
            list = list.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q))
        }
        if (roleFilter !== 'all') list = list.filter(s => s.role === roleFilter)
        return list
    }, [search, roleFilter])

    const stats = useMemo(() => ({
        total: MOCK_STAFF.length,
        active: MOCK_STAFF.filter(s => s.isActive).length,
        byRole: COMPANY_ROLES.reduce((acc, r) => ({
            ...acc, [r]: MOCK_STAFF.filter(s => s.role === r).length,
        }), {} as Record<CompanyRole, number>),
    }), [])

    const openAdd = () => { setSelected(null); setDialogOpen(true) }
    const openEdit = (staff: StaffItem) => { setSelected(staff); setDialogOpen(true) }
    const closeDialog = () => setDialogOpen(false)
    const clearFilters = () => { setSearch(''); setRoleFilter('all') }
    const hasFilter = search || roleFilter !== 'all'

    return {
        filtered, stats,
        openAdd, openEdit, closeDialog,
        clearFilters, hasFilter,
    }
}
