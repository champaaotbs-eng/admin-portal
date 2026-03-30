import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ADMIN_STATUS } from '../constants/admin-status.constant'

interface AdminSearchBarProps {
    search: string
    statusFilter: string
    onChange: (value: string) => void
    onStatusChange: (value: string) => void
}

/**
 * Search bar for admin list filtering.
 */
export const AdminSearchBar = ({ search, statusFilter, onChange, onStatusChange }: AdminSearchBarProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.admins' })

    return (

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder={t('search.placeholder')}
                        className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) => onStatusChange(event.target.value as string | '')}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                    <option value="">{t('status.all')}</option>
                    <option value={ADMIN_STATUS.ACTIVE}>{t('status.active')}</option>
                    <option value={ADMIN_STATUS.INACTIVE}>{t('status.inactive')}</option>
                </select>
            </div>
        </div>

    )
}
