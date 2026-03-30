import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { CompanyFilterBar } from '../components/company-filter-bar.component'
import { CompanyTable } from '../components/company-table.component'
import { CompanyDetailModal } from '../components/company-detail-modal.component'
import { useCompanyList } from '../hooks/use-company-list.hook'

/**
 * Bus company management list page.
 */
export const CompanyListPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.companies' })
    const navigate = useNavigate()
    const {
        companies,
        meta,
        isLoading,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        searchText,
        setSearchText,
        statusFilter,
        setStatusFilter,
        selectedCompanyId,
        isDetailOpen,
        openDetail,
        closeDetail,
    } = useCompanyList()

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
                <Button onClick={() => navigate({ to: '/admin/companies/new' })}>{`+ ${t('add_company')}`}</Button>
            </div>

            <CompanyFilterBar
                searchText={searchText}
                statusFilter={statusFilter}
                onSearchChange={setSearchText}
                onStatusChange={setStatusFilter}
            />

            <CompanyTable
                companies={companies}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={meta.totalPages}
                totalItems={meta.totalItems}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onView={(company) => openDetail(company.busCompanyId)}
                onEdit={(company) => navigate({ to: `/admin/companies/${company.busCompanyId}` })}
            />

            <CompanyDetailModal companyId={selectedCompanyId} open={isDetailOpen} onClose={closeDetail} />
        </div>
    )
}
