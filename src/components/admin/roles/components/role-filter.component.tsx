import { useTranslation } from 'react-i18next'

type StatusFilter = 'all' | 'active' | 'inactive'

interface RoleFilterProps {
    searchText: string
    statusFilter: StatusFilter
    onSearchChange: (value: string) => void
    onStatusChange: (value: StatusFilter) => void
}

/**
 * Role filter controls (search and status).
 */
export const RoleFilter = ({
    searchText,
    statusFilter,
    onSearchChange,
    onStatusChange,
}: RoleFilterProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.roles.filter' })

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                <input
                    type="text"
                    value={searchText}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder={t('search_placeholder')}
                    className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <select
                    value={statusFilter}
                    onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                    <option value="all">{t('all')}</option>
                    <option value="active">{t('active')}</option>
                    <option value="inactive">{t('inactive')}</option>
                </select>
            </div>
        </div>
    )
}
