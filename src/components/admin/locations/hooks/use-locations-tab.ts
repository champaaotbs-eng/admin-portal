import { Dispatch, SetStateAction, useMemo } from 'react'
import { locations, provinces } from '../data'

interface UseLocationsTabProps {
    search: string
    provinceFilter: string
    setDialogOpen: Dispatch<SetStateAction<boolean>>
}

export const useLocationsTab = ({ search, provinceFilter, setDialogOpen }: UseLocationsTabProps) => {
    const filtered = useMemo(() => locations.filter(l =>
        (!search || l.name.toLowerCase().includes(search.toLowerCase()) || l.address.toLowerCase().includes(search.toLowerCase())) &&
        (!provinceFilter || l.provinceId === provinceFilter)
    ), [search, provinceFilter])

    const openDialog = () => setDialogOpen(true)
    const closeDialog = () => setDialogOpen(false)

    return { filtered, provinces, locations, openDialog, closeDialog }
}
