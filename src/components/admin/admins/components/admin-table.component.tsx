import { useMemo } from 'react'
import { Eye, Pencil } from 'lucide-react'
import type { IAdmin } from 'types/admin'
import { PaginatedTable, type PaginatedTableColumn } from 'components/shared/pagination-table'
import { useTranslation } from 'react-i18next'
import { AdminStatusBadge } from './admin-status-badge.component'

interface AdminTableProps {
    admins: IAdmin[]
    isLoading: boolean
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
    onPageChange: (page: number) => void
    onView: (admin: IAdmin) => void
    onEdit: (admin: IAdmin) => void
}

/**
 * Paginated admin table with actions.
 */
export const AdminTable = ({
    admins,
    isLoading,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    onView,
    onEdit,
}: AdminTableProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.admins' })

    const columns = useMemo<PaginatedTableColumn<IAdmin>[]>(
        () => [
            {
                id: 'index',
                header: '#',
                renderCell: (_admin, index) => <span>{(currentPage - 1) * pageSize + index + 1}</span>,
            },
            {
                id: 'username',
                header: t('table.username'),
                renderCell: (admin) => <span className="font-medium text-slate-900">{admin.username ?? '—'}</span>,
            },
            {
                id: 'fullName',
                header: t('table.full_name'),
                renderCell: (admin) => <span>{admin.fullName}</span>,
            },
            {
                id: 'role',
                header: t('table.role'),
                renderCell: (admin) => <span>{admin.role?.roleName ?? t('table.unknown_role')}</span>,
            },
            {
                id: 'status',
                header: t('table.status'),
                renderCell: (admin) => <AdminStatusBadge isActive={(admin as { isActive?: boolean }).isActive ?? true} />,
            },
            {
                id: 'actions',
                header: t('table.actions'),
                headerClassName: 'text-center',
                cellClassName: 'text-center',
                renderCell: (admin) => (
                    <div className="flex items-center justify-center gap-1">
                        <button
                            type="button"
                            aria-label={t('actions.view')}
                            onClick={() => onView(admin)}
                            className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            aria-label={t('actions.edit')}
                            onClick={() => onEdit(admin)}
                            className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [currentPage, onEdit, onView, pageSize, t],
    )

    return (
        <PaginatedTable
            columns={columns}
            data={admins}
            rowKey={(admin, index) => admin.adminId ?? `${admin.username ?? 'admin'}-${index}`}
            isLoading={isLoading}
            emptyMessage={t('empty')}
            pagination={{
                currentPage,
                totalPages,
                totalItems,
                pageSize,
                onPageChange,
                labels: {
                    previous: t('pagination.previous'),
                    next: t('pagination.next'),
                    page: t('pagination.page'),
                    showing: t('pagination.showing'),
                    noItems: t('pagination.no_items'),
                },
            }}
        />
    )
}
