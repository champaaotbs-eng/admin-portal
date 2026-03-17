import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'

export type SortKey = 'name' | 'email' | 'serviceFee' | 'status' | 'createdAt'
export type SortDir = 'asc' | 'desc'

interface SortIconProps {
    col: SortKey
    sortKey: SortKey | null
    sortDir: SortDir
}

export const SortIcon = ({ col, sortKey, sortDir }: SortIconProps) => {
    if (sortKey !== col) return <ChevronsUpDown className="inline h-3 w-3 ml-1 opacity-40" />
    return sortDir === 'asc'
        ? <ChevronUp className="inline h-3 w-3 ml-1" />
        : <ChevronDown className="inline h-3 w-3 ml-1" />
}
