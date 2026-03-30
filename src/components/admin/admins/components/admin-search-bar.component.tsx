import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface AdminSearchBarProps {
    value: string
    onChange: (value: string) => void
}

/**
 * Search bar for admin list filtering.
 */
export const AdminSearchBar = ({ value, onChange }: AdminSearchBarProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.admins' })

    return (
        <div className="relative max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={t('search.placeholder')}
                className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
        </div>
    )
}
