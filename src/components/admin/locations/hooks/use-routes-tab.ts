import { Dispatch, SetStateAction, useMemo } from 'react'
import { routes } from '../data'

interface UseRoutesTabProps {
    search: string
    setDialogOpen: Dispatch<SetStateAction<boolean>>
}

export const useRoutesTab = ({ search, setDialogOpen }: UseRoutesTabProps) => {
    const filtered = useMemo(() => routes.filter(r =>
        !search ||
        r.fromLabel.toLowerCase().includes(search.toLowerCase()) ||
        r.toLabel.toLowerCase().includes(search.toLowerCase())
    ), [search])

    const openDialog = () => setDialogOpen(true)
    const closeDialog = () => setDialogOpen(false)

    return { filtered, openDialog, closeDialog }
}
