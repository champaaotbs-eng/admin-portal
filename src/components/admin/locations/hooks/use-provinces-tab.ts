import { useMemo } from 'react'
import { provinces } from '../data'

interface UseProvincesTabProps {
    search: string
}

export const useProvincesTab = ({ search }: UseProvincesTabProps) => {
    const filtered = useMemo(
        () => provinces.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())),
        [search]
    )
    return { filtered }
}
