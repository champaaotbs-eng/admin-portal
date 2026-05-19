import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import type { IAdmin } from 'types/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { PaginatedTable, type PaginatedTableColumn } from '@/components/shared/pagination-table'
import { formatDate } from '@/utils/format'
import { useAuthStore } from '@/store/auth.store'
import { StaffForm } from './components/StaffForm'
import { useStaffPage } from './hooks/use-staff-page'
import type { StaffFormData } from './validation-schema'

const PAGE_SIZE = 10

export const CompanyStaffPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.staff' })
    const { t: tCommon } = useTranslation()
    const { admin } = useAuthStore()

    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selected, setSelected] = useState<IAdmin | null>(null)

    const {
        staff,
        meta,
        stats,
        roles,
        isLoading,
        isLoadingRoles,
        isSubmitting,
        isRemoving,
        submitStaff,
        removeStaff,
    } = useStaffPage({
        search,
        roleFilter,
        page,
        pageSize: PAGE_SIZE,
    })

    useEffect(() => {
        setPage(1)
    }, [roleFilter, search])

    const openAdd = () => {
        setSelected(null)
        setDialogOpen(true)
    }

    const openEdit = (staffItem: IAdmin) => {
        setSelected(staffItem)
        setDialogOpen(true)
    }

    const closeDialog = () => {
        setDialogOpen(false)
        setSelected(null)
    }

    const clearFilters = () => {
        setSearch('')
        setRoleFilter('all')
    }

    const hasFilter = search.trim().length > 0 || roleFilter !== 'all'

    const handleSubmit = async (values: StaffFormData) => {
        await submitStaff(selected, values)
        closeDialog()
    }

    const handleDelete = async (staffItem: IAdmin) => {
        if (staffItem.adminId === admin?.adminId) {
            return
        }
        if (!window.confirm(t('messages.confirm_delete', { name: staffItem.fullName }))) {
            return
        }
        await removeStaff(staffItem)
    }

    const columns = useMemo<PaginatedTableColumn<IAdmin>[]>(() => [
        {
            id: 'username',
            header: t('table.username'),
            renderCell: (item) => (
                <div>
                    <div className="font-medium text-slate-900">{item.username || '—'}</div>
                    <div className="text-xs text-slate-500">{item.fullName}</div>
                </div>
            ),
        },
        {
            id: 'role',
            header: t('table.role'),
            renderCell: (item) => (
                <span className="inline-flex rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    {item.role?.roleName ?? t('unknown_role')}
                </span>
            ),
        },
        {
            id: 'status',
            header: t('table.status'),
            renderCell: (item) => (
                <Badge variant={item.isActive ? 'success' : 'secondary'} className="text-xs">
                    {item.isActive ? tCommon('status.active') : tCommon('status.inactive')}
                </Badge>
            ),
        },
        {
            id: 'createdAt',
            header: t('table.joined_at'),
            renderCell: (item) => <span className="text-xs text-slate-500">{formatDate(item.createdAt)}</span>,
        },
        {
            id: 'actions',
            header: tCommon('common.actions'),
            headerClassName: 'w-36',
            renderCell: (item) => (
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        aria-label={t('actions.edit')}
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => void handleDelete(item)}
                        disabled={item.adminId === admin?.adminId || isRemoving}
                        className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-rose-600 disabled:opacity-40"
                        aria-label={t('actions.delete')}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ], [admin?.adminId, isRemoving, t, tCommon])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <Button onClick={openAdd} disabled={isLoadingRoles}>
                    <Plus className="h-4 w-4" /> {t('add_staff')}
                </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">{t('stats.total')}</p>
                        <p className="text-3xl font-bold">{stats.total}</p>
                        <p className="text-xs text-green-600">{`${stats.active} ${t('stats.active_suffix')}`}</p>
                    </CardContent>
                </Card>
                {roles.map((role) => (
                    <Card key={role.roleId}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{role.roleName}</p>
                            <p className="text-3xl font-bold">{stats.byRole[role.roleId] ?? 0}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative min-w-56 flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t('search_placeholder')}
                        className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="all">{t('roles.all')}</option>
                    {roles.map((role) => (
                        <option key={role.roleId} value={role.roleId}>{role.roleName}</option>
                    ))}
                </select>

                {hasFilter ? (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                ) : null}
            </div>

            <PaginatedTable
                columns={columns}
                data={staff}
                rowKey={(item) => item.adminId}
                isLoading={isLoading}
                emptyMessage={t('empty')}
                pagination={{
                    currentPage: meta?.page ?? page,
                    totalPages: meta?.totalPages ?? 1,
                    totalItems: meta?.totalItems ?? 0,
                    pageSize: meta?.limit ?? PAGE_SIZE,
                    onPageChange: setPage,
                }}
            />

            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                title={selected ? t('edit_staff_title') : t('add_staff_title')}
            >
                <StaffForm
                    mode={selected ? 'edit' : 'create'}
                    roles={roles}
                    defaultValues={selected ? {
                        username: selected.username ?? '',
                        fullName: selected.fullName,
                        roleId: selected.role?.roleId ?? '',
                        password: '',
                        isActive: selected.isActive,
                    } : undefined}
                    onSubmit={(values) => void handleSubmit(values)}
                    onCancel={closeDialog}
                    isSubmitting={isSubmitting}
                />
            </Dialog>
        </div>
    )
}
