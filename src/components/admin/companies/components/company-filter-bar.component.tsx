import { Search } from 'lucide-react'
import { BusCompanyStatus } from 'types/company'

interface CompanyFilterBarProps {
    searchText: string
    statusFilter: BusCompanyStatus | ''
    onSearchChange: (value: string) => void
    onStatusChange: (value: BusCompanyStatus | '') => void
}

/**
 * Company list filter bar with search and status controls.
 */
export const CompanyFilterBar = ({
    searchText,
    statusFilter,
    onSearchChange,
    onStatusChange,
}: CompanyFilterBarProps) => {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchText}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Search by company name..."
                        className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) => onStatusChange(event.target.value as BusCompanyStatus | '')}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                    <option value="">All</option>
                    <option value={BusCompanyStatus.ACTIVE}>Active</option>
                    <option value={BusCompanyStatus.INACTIVE}>Inactive</option>
                    <option value={BusCompanyStatus.SUSPENDED}>Suspended</option>
                </select>
            </div>
        </div>
    )
}
