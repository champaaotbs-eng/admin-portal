import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { CompanyFilterBar } from '../components/company-filter-bar.component'
import { CompanyTable } from '../components/company-table.component'
import { CompanyDetailModal } from '../components/company-detail-modal.component'
import { useCompanyList } from '../hooks/use-company-list.hook'

/**
 * Bus company management list page.
 */
export const CompanyListPage = () => {
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
                <h1 className="text-2xl font-bold text-slate-900">Bus Company Management</h1>
                <Button onClick={() => navigate({ to: '/admin/companies/new' })}>+ Add Company</Button>
            </div>

            <CompanyFilterBar
                searchText={searchText}
                statusFilter={statusFilter}
                onSearchChange={setSearchText}
                onStatusChange={setStatusFilter}
            />

            <div className="flex justify-end">
                <select
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                    {[10, 20, 50].map((size) => (
                        <option key={size} value={size}>{size} / page</option>
                    ))}
                </select>
            </div>

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
