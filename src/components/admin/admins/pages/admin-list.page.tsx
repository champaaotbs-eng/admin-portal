import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useAdminList } from '../hooks/use-admin-list.hook'
import { AdminSearchBar } from '../components/admin-search-bar.component'
import { AdminTable } from '../components/admin-table.component'
import { AdminDetailModal } from '../components/admin-detail-modal.component'

/**
 * Admin management list page.
 */
export const AdminListPage = () => {
    const navigate = useNavigate()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.admins' })

    const {
        admins,
        meta,
        isLoading,
        currentPage,
        setCurrentPage,
        pageSize,
        searchText,
        setSearchText,
        statusFilter,
        setStatusFilter,
        companyFilter,
        setCompanyFilter,
        companies,
        selectedAdminId,
        isDetailOpen,
        openDetail,
        closeDetail,
    } = useAdminList()

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{t('list.title')}</h1>
                <Button onClick={() => navigate({ to: '/admin/admins/new' })}>+ {t('list.add_admin')}</Button>
            </div>

            <AdminSearchBar
                search={searchText}
                onChange={setSearchText}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                companyFilter={companyFilter}
                companies={companies}
                onCompanyChange={setCompanyFilter}
            />

            <AdminTable
                admins={admins}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={meta.totalPages}
                totalItems={meta.totalItems}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onView={(admin) => {
                    if (admin.adminId) {
                        openDetail(admin.adminId)
                    }
                }}
                onEdit={(admin) => {
                    if (admin.adminId) {
                        navigate({ to: `/admin/admins/${admin.adminId}` })
                    }
                }}
            />

            <AdminDetailModal
                adminId={selectedAdminId}
                open={isDetailOpen}
                onClose={closeDetail}
                onEdit={(adminId) => navigate({ to: `/admin/admins/${adminId}` })}
            />
        </div>
    )
}
