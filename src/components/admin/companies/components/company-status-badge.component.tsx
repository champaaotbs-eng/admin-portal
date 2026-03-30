import { BusCompanyStatus } from 'types/company'

interface CompanyStatusBadgeProps {
    status: BusCompanyStatus
}

/**
 * Show company status as colored pill.
 */
export const CompanyStatusBadge = ({ status }: CompanyStatusBadgeProps) => {
    const styles: Record<BusCompanyStatus, string> = {
        [BusCompanyStatus.ACTIVE]: 'bg-emerald-100 text-emerald-700',
        [BusCompanyStatus.INACTIVE]: 'bg-slate-100 text-slate-700',
        [BusCompanyStatus.SUSPENDED]: 'bg-amber-100 text-amber-700',
    }

    return (
        <span className={['inline-flex rounded-full px-2.5 py-1 text-xs font-medium', styles[status]].join(' ')}>
            {status}
        </span>
    )
}
