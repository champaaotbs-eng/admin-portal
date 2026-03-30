import { useMemo } from 'react'
import { Building2, Eye, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
    const { t } = useTranslation('translation', { keyPrefix: 'pages.companies' })
    const { t: tCommon } = useTranslation()

    const columns = useMemo<PaginatedTableColumn<ICompany>[]>(
        () => [
            {
                id: 'index',
                header: '#',
                renderCell: (_company, index) => <span>{(currentPage - 1) * pageSize + index + 1}</span>,
            },
            {
                id: 'logo',
                header: t('form.logo'),
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
                header: t('table.name'),
                renderCell: (company) => <span className="font-medium text-slate-900">{company.name}</span>,
            },
            {
                id: 'email',
                header: t('table.email'),
                renderCell: (company) => <span>{company.email ?? '—'}</span>,
            },
            {
                id: 'phone',
                header: t('table.phone'),
                renderCell: (company) => <span>{company.phone ?? '—'}</span>,
            },
            {
                id: 'serviceFee',
                header: t('table.service_fee'),
                renderCell: (company) => <span>{company.serviceFee}%</span>,
            },
            {
                id: 'status',
                header: t('table.status'),
                renderCell: (company) => <CompanyStatusBadge status={company.status} />,
            },
            {
                id: 'actions',
                header: tCommon('common.actions'),
                headerClassName: 'text-center',
                cellClassName: 'text-center',
                renderCell: (company) => (
                    <div className="flex items-center justify-center gap-1">
                        <button
                            type="button"
                            onClick={() => onView(company)}
                            className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                            aria-label={t('action_detail')}
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onEdit(company)}
                            className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                            aria-label={t('edit_company_form_title')}
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
            data={companies}
            rowKey={(company) => company.busCompanyId}
            isLoading={isLoading}
            emptyMessage={t('no_results')}
            pagination={{
                currentPage,
                totalPages,
                totalItems,
                pageSize,
                onPageChange,
            }}
        />
    )
}
