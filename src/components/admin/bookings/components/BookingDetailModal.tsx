import { useTranslation } from 'react-i18next'
import { CheckCircle2, Clock, Calendar, User, Phone, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { formatDate, formatVnd } from '@/utils/format'
import type { AdminBookingRow } from '../hooks/use-bookings-page'

export function statusBadge(status: string, t: (k: string) => string) {
    const map: Record<string, 'success' | 'destructive' | 'warning' | 'secondary'> = {
        confirmed: 'success',
        paid: 'success',
        cancelled: 'destructive',
        expired: 'secondary',
        pending: 'warning',
        pending_payment: 'warning',
    }
    const variant = map[status] ?? 'secondary'
    return <Badge variant={variant} className="text-xs whitespace-nowrap">{t(`status.${status}`, { defaultValue: status })}</Badge>
}

export function paymentBadge(status: string, t: (k: string) => string) {
    const map: Record<string, 'success' | 'destructive' | 'warning' | 'secondary'> = {
        paid: 'success',
        unpaid: 'warning',
        pending: 'warning',
        completed: 'success',
        refunded: 'secondary',
        failed: 'destructive',
    }
    const variant = map[status] ?? 'secondary'
    return <Badge variant={variant} className="text-xs whitespace-nowrap">{t(`payment_status.${status}`, { defaultValue: status })}</Badge>
}

export const BookingDetailModal = ({ booking, onClose }: { booking: AdminBookingRow; onClose: () => void }) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.bookings' })
    const { t: tCommon } = useTranslation()
    const timeline = [
        { label: t('detail.timeline.booked'), time: formatDate(booking.createdAt), done: true },
        {
            label: t('detail.timeline.paid'),
            time: booking.paymentStatus === 'paid' ? formatDate(booking.createdAt) : '-',
            done: booking.paymentStatus === 'paid',
        },
        { label: t('detail.timeline.confirmed'), time: booking.status === 'confirmed' || booking.status === 'completed' ? formatDate(booking.createdAt) : '-', done: booking.status === 'confirmed' || booking.status === 'completed' },
        { label: t('detail.timeline.completed'), time: booking.status === 'completed' ? formatDate(booking.departureTime) : '-', done: booking.status === 'completed' },
    ]

    return (
        <Dialog open onClose={onClose} title={t('detail.title', { code: booking.bookingCode })}>
            <div className="space-y-6">
                <div className="flex gap-2 flex-wrap">
                    {statusBadge(booking.status, tCommon)}
                    {paymentBadge(booking.paymentStatus, tCommon)}
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-2 font-medium uppercase">{t('detail.trip_section')}</p>
                    <p className="whitespace-pre-line font-semibold">{booking.routeLabel}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        <Calendar className="inline h-3.5 w-3.5 mr-1" />
                        {formatDate(booking.departureTime)} — {booking.companyName}
                    </p>
                    <p className="text-sm font-medium mt-2">{t('detail.seats_summary', { count: booking.seatCount, amount: formatVnd(booking.totalAmount) })}</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-3 font-medium uppercase">{t('detail.passenger_section')}</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span>{booking.userName ?? t('detail.guest')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{booking.userPhone ?? '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{booking.userEmail}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground mb-3 font-medium uppercase">{t('detail.timeline_section')}</p>
                    <div className="space-y-3">
                        {timeline.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500/10' : 'bg-muted'}`}>
                                    {item.done
                                        ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                        : <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    }
                                </div>
                                <div>
                                    <p className={`text-sm ${item.done ? 'font-medium' : 'text-muted-foreground'}`}>{item.label}</p>
                                    <p className="text-xs text-muted-foreground">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={onClose}>{tCommon('common.close')}</Button>
                </div>
            </div>
        </Dialog>
    )
}
