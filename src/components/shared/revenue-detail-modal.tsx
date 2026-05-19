import { Building2, Calendar, Mail, Phone, Ticket, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { formatDate, formatVnd } from '@/utils/format'
import type { IRevenue } from '@/types/revenue'

interface RevenueDetailModalProps {
    revenueId: string
    initialRevenue: IRevenue
    loadRevenue: (revenueId: string) => Promise<IRevenue>
    onClose: () => void
    showCompany?: boolean
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="space-y-1 rounded-lg bg-muted/30 p-3">
        <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
    </div>
)

export const RevenueDetailModal = ({
    revenueId,
    initialRevenue,
    loadRevenue,
    onClose,
    showCompany = false,
}: RevenueDetailModalProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.revenue' })
    const { t: tCommon } = useTranslation()
    const scopeKey = showCompany ? 'admin' : 'company'
    const { data, isLoading } = useQuery({
        queryKey: ['revenue-detail', scopeKey, revenueId],
        queryFn: () => loadRevenue(revenueId),
        placeholderData: initialRevenue,
        refetchOnMount: 'always',
        staleTime: 0,
    })

    const revenue = data ?? initialRevenue

    const tripInfo = revenue.tripInfo
    const companyInfo = revenue.companyInfo
    const customerInfo = revenue.customerInfo
    const bookingCode = revenue.bookingCode ?? revenue.bookingId
    const routeLabel = tripInfo?.fromLocationName && tripInfo?.toLocationName
        ? `${tripInfo.fromLocationName} → ${tripInfo.toLocationName}`
        : '—'
    const feeRate = revenue.fee ?? (revenue.grossAmount > 0 ? Number(((revenue.commission / revenue.grossAmount) * 100).toFixed(2)) : 0)
    return (
        <Dialog open onClose={onClose} title={t('detail.title', { code: bookingCode })} className="max-w-4xl">
            <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <DetailRow label={t('table.booking_code')} value={bookingCode} />
                    <DetailRow label={t('table.gross')} value={formatVnd(revenue.grossAmount)} />
                    <DetailRow label={t('table.commission')} value={formatVnd(revenue.commission)} />
                    <DetailRow label={t('table.net')} value={formatVnd(revenue.netAmount)} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <DetailRow label={t('detail.fee_rate')} value={`${feeRate}%`} />
                    <DetailRow label={t('detail.created_at')} value={formatDate(revenue.createdAt)} />
                    <DetailRow label={t('detail.departure_time')} value={tripInfo?.departureTime ? formatDate(tripInfo.departureTime) : '—'} />
                    <DetailRow label={t('detail.arrival_time')} value={tripInfo?.arrivalTime ? formatDate(tripInfo.arrivalTime) : '—'} />
                </div>
                {isLoading && <p className="text-sm text-muted-foreground">{tCommon('common.loading')}</p>}

                {showCompany && (
                    <div className="rounded-lg border border-border/60 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                            <Building2 className="h-4 w-4 text-primary" />
                            <span>{t('detail.company_section')}</span>
                        </div>
                        <DetailRow
                            label={t('table.company')}
                            value={companyInfo?.companyName ?? revenue.companyName ?? tripInfo?.busCompanyName ?? revenue.companyId}
                        />
                    </div>
                )}

                <div className="rounded-lg border border-border/60 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        <Ticket className="h-4 w-4 text-primary" />
                        <span>{t('detail.trip_section')}</span>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-3">
                        <DetailRow label={t('detail.route')} value={routeLabel} />
                        <div className="rounded-lg bg-muted/30 p-3">
                            <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">{t('detail.pickup_section')}</p>
                            <p className="text-sm font-medium">{tripInfo?.pickupStop?.locationName ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">{tripInfo?.pickupStop?.locationAddress ?? '—'}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                <Calendar className="mr-1 inline h-3.5 w-3.5" />
                                {tripInfo?.pickupStop?.pickupTime ? formatDate(tripInfo.pickupStop.pickupTime) : '—'}
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted/30 p-3">
                            <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">{t('detail.dropoff_section')}</p>
                            <p className="text-sm font-medium">{tripInfo?.dropoffStop?.locationName ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">{tripInfo?.dropoffStop?.locationAddress ?? '—'}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                <Calendar className="mr-1 inline h-3.5 w-3.5" />
                                {tripInfo?.dropoffStop?.dropoffTime ? formatDate(tripInfo.dropoffStop.dropoffTime) : '—'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-border/60 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                        <User className="h-4 w-4 text-primary" />
                        <span>{t('detail.customer_section')}</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg bg-muted/30 p-3 text-sm">
                            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">{t('detail.customer_name')}</p>
                            <p className="flex items-center gap-2 font-medium"><User className="h-3.5 w-3.5 text-muted-foreground" />{customerInfo?.passengerName ?? revenue.passengerName ?? '—'}</p>
                        </div>
                        <div className="rounded-lg bg-muted/30 p-3 text-sm">
                            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">{t('detail.customer_phone')}</p>
                            <p className="flex items-center gap-2 font-medium"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{customerInfo?.passengerPhone ?? revenue.passengerPhone ?? '—'}</p>
                        </div>
                        <div className="rounded-lg bg-muted/30 p-3 text-sm">
                            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">{t('detail.customer_email')}</p>
                            <p className="flex items-center gap-2 break-all font-medium"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{customerInfo?.passengerEmail ?? revenue.passengerEmail ?? '—'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={onClose}>{tCommon('common.close')}</Button>
                </div>
            </div>
        </Dialog>
    )
}
