import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { IRole } from 'types/role'
import { Button } from '@/components/ui/button'
import { RoleFilter } from '../components/role-filter.component'
import { RoleTable } from '../components/role-table.component'
import { RoleDetailModal } from '../components/role-detail.modal'
import { useRoleList } from '../hooks/use-role-list.hook'
import { useDebounce } from 'components/shared/hooks/use-debounce'

/**
 * Role list page.
 */
export const RoleListPage = () => {
    const navigate = useNavigate()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.roles' })
    const [searchText, setSearchText] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [page, setPage] = useState(1)
    const [deleteTargetRole, setDeleteTargetRole] = useState<IRole | null>(null)
    const [viewingRole, setViewingRole] = useState<IRole | null>(null)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const debouncedSearchText = useDebounce(searchText, 400)
    const debouncedStatusFilter = useDebounce(statusFilter, 250)

    const {
        roles,
        isLoading,
        limit,
        totalPages,
        totalItems,
        deleteRoleById,
        isDeleting,
    } = useRoleList({
        page,
        searchText: debouncedSearchText,
        statusFilter: debouncedStatusFilter,
    })

    useEffect(() => {
        setPage(1)
    }, [debouncedSearchText, debouncedStatusFilter])

    useEffect(() => {
        if (!toast) return
        const timer = window.setTimeout(() => setToast(null), 3000)
        return () => window.clearTimeout(timer)
    }, [toast])

    const isViewModalOpen = Boolean(viewingRole)
    const isDeleteDialogOpen = Boolean(deleteTargetRole)

    const openViewModal = (role: IRole) => {
        setViewingRole(role)
    }

    const closeViewModal = () => {
        setViewingRole(null)
    }

    const openDeleteDialog = (role: IRole) => {
        setDeleteTargetRole(role)
    }

    const closeDeleteDialog = () => {
        setDeleteTargetRole(null)
    }

    const handlePageChange = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages) return
        setPage(nextPage)
    }

    const confirmDelete = async () => {
        if (!deleteTargetRole?.roleId) return

        const result = await deleteRoleById(deleteTargetRole.roleId)
        if (result.success) {
            setToast({ type: 'success', message: t('messages.delete_success') })
            setDeleteTargetRole(null)
            return
        }

        setToast({ type: 'error', message: result.message })
    }

    return (
        <div className="space-y-6">
            {toast ? (
                <div className="fixed right-4 top-4 z-50">
                    <div
                        className={[
                            'rounded-md border px-4 py-3 text-sm shadow-md',
                            toast.type === 'success'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-rose-200 bg-rose-50 text-rose-700',
                        ].join(' ')}
                    >
                        {toast.message}
                    </div>
                </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{t('list.title')}</h1>
                <Button onClick={() => navigate({ to: '/admin/roles/new' })}>+ {t('list.add_role')}</Button>
            </div>

            <RoleFilter
                searchText={searchText}
                statusFilter={statusFilter}
                onSearchChange={setSearchText}
                onStatusChange={setStatusFilter}
            />

            <RoleTable
                roles={roles}
                isLoading={isLoading}
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={limit}
                onPageChange={handlePageChange}
                onView={openViewModal}
                onEdit={(role) => role.roleId && navigate({ to: `/admin/roles/${role.roleId}` })}
                onDelete={openDeleteDialog}
            />

            <RoleDetailModal
                open={isViewModalOpen}
                role={viewingRole}
                onClose={closeViewModal}
                onEdit={(role) => {
                    closeViewModal()
                    if (role.roleId) {
                        navigate({ to: `/admin/roles/${role.roleId}` })
                    }
                }}
            />

            {isDeleteDialogOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                    <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-lg">
                        <h2 className="text-lg font-semibold text-slate-900">{t('delete.title')}</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            {t('delete.message', { role: deleteTargetRole?.roleName ?? '' })}
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={closeDeleteDialog} disabled={isDeleting}>
                                {t('actions.cancel')}
                            </Button>
                            <Button type="button" variant="destructive" loading={isDeleting} onClick={confirmDelete}>
                                {t('actions.delete')}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
