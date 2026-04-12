import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useDebounce } from 'components/shared/hooks/use-debounce'

interface IStationFilterBarProps {
    onSearch: (search: string) => void
    onFilterStatus: (isActive: boolean | undefined) => void
    onAddClick: () => void
}

export const StationFilterBar = ({ onSearch, onFilterStatus, onAddClick }: IStationFilterBarProps) => {
    const { t } = useTranslation()
    const [searchValue, setSearchValue] = useState('')
    const [statusValue, setStatusValue] = useState<'all' | 'active' | 'inactive'>('all')
    const debouncedSearch = useDebounce(searchValue, 400)

    useEffect(() => {
        onSearch(debouncedSearch.trim())
    }, [debouncedSearch, onSearch])

    useEffect(() => {
        if (statusValue === 'all') {
            onFilterStatus(undefined)
            return
        }

        onFilterStatus(statusValue === 'active')
    }, [onFilterStatus, statusValue])

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder={t('stations.search_placeholder')}
                    className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>

            <select
                value={statusValue}
                onChange={(event) => setStatusValue(event.target.value as 'all' | 'active' | 'inactive')}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
                <option value="all">{t('stations.filter_status_all')}</option>
                <option value="active">{t('stations.filter_status_active')}</option>
                <option value="inactive">{t('stations.filter_status_inactive')}</option>
            </select>

            <Button type="button" onClick={onAddClick}>
                <Plus className="h-4 w-4" />
                {t('stations.add_button')}
            </Button>
        </div>
    )
}
