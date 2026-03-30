import { useMemo } from 'react'
import { Building2, Eye, Pencil } from 'lucide-react'
import type { ICompany } from 'types/company'
import { PaginatedTable, type PaginatedTableColumn } from 'components/shared/pagination-table'
import { CompanyStatusBadge } from './company-status-badge.component'

interface CompanyTableProps {
    companies: ICompany[]
    isLoading: boolean
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
    onPageChange: (page: number) => void
    onView: (company: ICompany) => void
    onEdit: (company: ICompany) => void
}

/**
 * Paginated table for bus companies.
 */
export const CompanyTable = ({
    companies,
    isLoading,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    onView,
    onEdit,
}: CompanyTableProps) => {
    const columns = useMemo<PaginatedTableColumn<ICompany>[]>(
        () => [
            {
                id: 'index',
                header: '#',
                renderCell: (_company, index) => <span>{(currentPage - 1) * pageSize + index + 1}</span>,
            },
            {
                id: 'logo',
                header: 'Logo',
                renderCell: (company) =>
                    company.logoUrl ? (
                        <img src={company.logoUrl} alt={company.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <Building2 className="h-4 w-4" />
                        </div>
                    ),
            },
            {
                id: 'name',
                header: 'Company Name',
                renderCell: (company) => <span className="font-medium text-slate-900">{company.name}</span>,
            },
            {
                id: 'email',
                header: 'Email',
                renderCell: (company) => <span>{company.email ?? '—'}</span>,
            },
            {
                id: 'phone',
                header: 'Phone',
                renderCell: (company) => <span>{company.phone ?? '—'}</span>,
            },
            {
                id: 'serviceFee',
                header: 'Service Fee',
                renderCell: (company) => <span>{company.serviceFee}%</span>,
            },
            {
                id: 'status',
                header: 'Status',
                renderCell: (company) => <CompanyStatusBadge status={company.status} />,
            },
            {
                id: 'actions',
                header: 'Actions',
                headerClassName: 'text-center',
                cellClassName: 'text-center',
                renderCell: (company) => (
                    <div className="flex items-center justify-center gap-1">
                        <button
                            type="button"
                            onClick={() => onView(company)}
                            className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                            aria-label="View company"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onEdit(company)}
                            className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                            aria-label="Edit company"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [currentPage, onEdit, onView, pageSize],
    )

    return (
        <PaginatedTable
            columns={columns}
            data={companies}
            rowKey={(company) => company.busCompanyId}
            isLoading={isLoading}
            emptyMessage="No companies found"
            pagination={{
                currentPage,
                totalPages,
                totalItems,
                pageSize,
                onPageChange,
                labels: {
                    previous: 'Previous',
                    next: 'Next',
                    page: 'Page',
                    showing: 'Showing',
                    noItems: 'No items',
                },
            }}
        />
    )
}
