import { useState } from 'react'
import { Plus, Search, Building2, Pencil, ToggleLeft, ToggleRight, Eye, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { formatDate } from '@/utils/format'
import { useTranslation } from 'react-i18next'
import { SortIcon } from './components/SortIcon'
import { CompanyForm } from './components/CompanyForm'
import { CompanyDetail } from './components/CompanyDetail'
import { useCompaniesPage } from './hooks/use-companies-page'
import type { SortKey, SortDir, StatusFilter } from './hooks/use-companies-page'
import type { BusCompany } from '@/types'

export const AdminCompaniesPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.companies' })
    const { t: tCommon } = useTranslation()

    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [sortKey, setSortKey] = useState<SortKey | null>(null)
    const [sortDir, setSortDir] = useState<SortDir>('asc')
    const [page, setPage] = useState(1)
    const pageSize = 10
    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
    const [editTarget, setEditTarget] = useState<BusCompany | null>(null)
    const [detailCompany, setDetailCompany] = useState<BusCompany | null>(null)

    const {
        companies, pagination, isLoading, isFetching, isSaving, defaultValues,
        closeDialog, toggleSort, handleFormSubmit, toggleMutation, deleteMutation,
    } = useCompaniesPage({
        search,
        statusFilter,
        sortKey,
        setSortKey,
        sortDir,
        setSortDir,
        page,
        pageSize,
        setPage,
        dialogMode,
        setDialogMode,
        editTarget,
        setEditTarget,
    })

    const statusOptions: [StatusFilter, string][] = [
        ['all', t('filter_all')],
        ['active', t('filter_active')],
        ['inactive', t('filter_inactive')],
    ]

    const sortableColumns: [SortKey, string][] = [
        ['name', t('table.name')],
        ['email', t('table.email')],
        ['serviceFee', t('table.service_fee')],
        ['status', t('table.status')],
        ['createdAt', t('table.created_at')],
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('count_description', { count: pagination.totalItems })}
                    </p>
                </div>
                <Button size="sm" onClick={() => { setEditTarget(null); setDialogMode('create') }}>
                    <Plus className="h-4 w-4" />
                    {t('add_company')}
                </Button>
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value)
                            setPage(1)
                        }}
                        placeholder={t('search_placeholder')}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
                <div className="flex rounded-md border border-border overflow-hidden text-sm">
                    {statusOptions.map(([value, label]) => (
                        <button
                            key={value}
                            onClick={() => {
                                setStatusFilter(value)
                                setPage(1)
                            }}
                            className={`px-3 py-2 ${statusFilter === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`overflow-x-auto rounded-lg border border-border transition-opacity duration-150 ${isFetching ? 'opacity-60' : ''}`}>
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground w-8" />
                            {sortableColumns.map(([key, label]) => (
                                <th
                                    key={key}
                                    onClick={() => toggleSort(key)}
                                    className="cursor-pointer select-none px-4 py-3 text-left font-medium text-muted-foreground hover:text-foreground whitespace-nowrap"
                                >
                                    {label}
                                    <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
                                </th>
                            ))}
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map(c => (
                            <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                                <td className="px-4 py-3">
                                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <Building2 className="h-4 w-4 text-orange-500" />
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium">{c.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                                <td className="px-4 py-3 text-center">{c.serviceFee}%</td>
                                <td className="px-4 py-3">
                                    <Badge variant={c.isActive ? 'success' : 'destructive'}>
                                        {c.isActive ? t('filter_active') : t('filter_inactive')}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(c.createdAt)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setDetailCompany(c)}
                                            className="text-muted-foreground hover:text-primary"
                                            title={tCommon('common.view')}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => { setEditTarget(c); setDialogMode('edit') }}
                                            className="text-muted-foreground hover:text-foreground"
                                            title={tCommon('common.edit')}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => toggleMutation.mutate(c)}
                                            className="text-muted-foreground hover:text-foreground"
                                            title={c.isActive ? t('deactivate') : t('activate')}
                                        >
                                            {c.isActive
                                                ? <ToggleRight className="h-5 w-5 text-green-500" />
                                                : <ToggleLeft className="h-5 w-5" />}
                                        </button>
                                        <button
                                            onClick={() => {
                                                const ok = window.confirm(t('delete_company_confirm', { defaultValue: 'Delete this company?' }))
                                                if (ok) deleteMutation.mutate(c.id)
                                            }}
                                            className="text-muted-foreground hover:text-destructive"
                                            title={tCommon('common.delete')}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {companies.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                    {t('no_results')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{tCommon('common.page', { page: pagination.page, total: pagination.totalPages })}</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>{tCommon('common.prev')}</Button>
                        <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}>{tCommon('common.next')}</Button>
                    </div>
                </div>
            )}

            <Dialog
                open={dialogMode !== null}
                onClose={closeDialog}
                title={dialogMode === 'create' ? t('add_company_title') : t('edit_company_title')}
            >
                <CompanyForm
                    key={editTarget?.id ?? 'create'}
                    defaultValues={defaultValues}
                    onSubmit={handleFormSubmit}
                    onCancel={closeDialog}
                    isSaving={isSaving}
                    mode={dialogMode ?? 'create'}
                />
            </Dialog>

            {detailCompany && (
                <CompanyDetail company={detailCompany} onClose={() => setDetailCompany(null)} />
            )}
        </div>
    )
}
