import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export interface PaginatedTableColumn<T> {
    id: string
    header: string
    headerClassName?: string
    cellClassName?: string
    renderCell: (item: T, index: number) => React.ReactNode
}

interface PaginatedTableProps<T> {
    columns: PaginatedTableColumn<T>[]
    data: T[]
    rowKey: (item: T, index: number) => string
    isLoading?: boolean
    emptyMessage?: string
    skeletonRows?: number
    pagination?: {
        currentPage: number
        totalPages: number
        totalItems: number
        pageSize: number
        onPageChange: (page: number) => void
        labels?: {
            previous?: string
            next?: string
            page?: string
            showing?: string
            noItems?: string
        }
    }
}

/**
 * Reusable table component with loading, empty state and pagination.
 */
export function PaginatedTable<T>({
    columns,
    data,
    rowKey,
    isLoading = false,
    emptyMessage = 'No data found',
    skeletonRows = 5,
    pagination,
}: PaginatedTableProps<T>) {
    const { t } = useTranslation()
    const startItem = pagination ? (pagination.currentPage - 1) * pagination.pageSize + 1 : 0
    const endItem = pagination ? Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems) : 0
    const resolvedEmptyMessage = emptyMessage === 'No data found' ? t('common.no_results') : emptyMessage

    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-[860px] w-full">
                <thead>
                    <tr className="bg-slate-50 text-left text-sm font-semibold text-slate-500 border-b border-slate-200">
                        {columns.map((column) => (
                            <th key={column.id} className={['px-4 py-3', column.headerClassName ?? ''].join(' ')}>
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                            <tr key={`skeleton-${rowIndex}`} className={rowIndex % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'}>
                                <td colSpan={columns.length} className="px-4 py-3">
                                    <div className="h-6 w-full animate-pulse rounded bg-slate-100" />
                                </td>
                            </tr>
                        ))
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-14 text-center text-sm text-slate-600">
                                {resolvedEmptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr key={rowKey(item, index)} className={index % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'}>
                                {columns.map((column) => (
                                    <td key={column.id} className={['px-4 py-3 text-sm text-slate-700', column.cellClassName ?? ''].join(' ')}>
                                        {column.renderCell(item, index)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {pagination ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
                    <span>
                        {pagination.totalItems > 0
                            ? (pagination.labels?.showing
                                ? `${pagination.labels.showing} ${startItem}-${endItem} ${pagination.labels?.page ?? t('common.all')} ${pagination.totalItems}`
                                : t('common.showing', { shown: `${startItem}-${endItem}`, total: pagination.totalItems }))
                            : (pagination.labels?.noItems ?? t('common.no_results'))}
                    </span>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
                            disabled={pagination.currentPage <= 1}
                        >
                            {pagination.labels?.previous ?? t('common.prev')}
                        </Button>
                        <span className="px-2">
                            {pagination.labels?.page
                                ? `${pagination.labels.page} ${pagination.currentPage} / ${Math.max(1, pagination.totalPages)}`
                                : t('common.page', { page: pagination.currentPage, total: Math.max(1, pagination.totalPages) })}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                            disabled={pagination.currentPage >= pagination.totalPages}
                        >
                            {pagination.labels?.next ?? t('common.next')}
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
