import { useMemo } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { IRole } from 'types/role'
import { PaginatedTable, type PaginatedTableColumn } from 'components/shared/pagination-table'
import { RoleStatusBadge } from './role-status-badge.component'

interface RoleTableProps {
    roles: IRole[]
    isLoading: boolean
    page: number
    totalPages: number
    totalItems: number
    pageSize: number
    onPageChange: (page: number) => void
    onView: (role: IRole) => void
    onEdit: (role: IRole) => void
    onDelete: (role: IRole) => void
}

/**
 * Role table with row actions.
 */
export const RoleTable = ({
    roles,
    isLoading,
    page,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    onView,
    onEdit,
    onDelete,
}: RoleTableProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.roles' })

    const columns = useMemo<PaginatedTableColumn<IRole>[]>(() => [
        {
            id: 'index',
            header: '#',
            renderCell: (_role, index) => <span>{(page - 1) * pageSize + index + 1}</span>,
        },
        {
            id: 'name',
            header: t('table.role_name'),
            renderCell: (role) => <span className="font-medium text-slate-900">{role.roleName}</span>,
        },
        {
            id: 'description',
            header: t('table.description'),
            renderCell: (role) => <span className="text-slate-600">{role.description}</span>,
        },
        {
            id: 'status',
            header: t('table.status'),
            renderCell: (role) => <RoleStatusBadge isActive={role.isActive} />,
        },
        {
            id: 'actions',
            header: t('table.actions'),
            headerClassName: 'text-center',
            cellClassName: 'text-center',
            renderCell: (role) => (
                <div className="flex items-center justify-center gap-1">
                    <button
                        type="button"
                        aria-label={t('actions.view')}
                        onClick={() => onView(role)}
                        className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        aria-label={t('actions.edit')}
                        onClick={() => onEdit(role)}
                        className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        aria-label={t('actions.delete')}
                        onClick={() => onDelete(role)}
                        className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-rose-600"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ], [onDelete, onEdit, onView, page, pageSize])

    return (
        <PaginatedTable
            columns={columns}
            data={roles}
            rowKey={(role, index) => role.roleId ?? `${role.roleName}-${index}`}
            isLoading={isLoading}
            emptyMessage={t('empty')}
            pagination={{
                currentPage: page,
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
