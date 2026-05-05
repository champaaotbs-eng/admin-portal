import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { getMyPublicBookings } from 'services/public/booking.service'
import { useCustomerAuthStore } from 'store/customer-auth.store'
import { formatVnd, formatDate } from 'utils/format'
import { APP_ROUTES } from '@/constants/app-routes'
import { statusBadge } from 'components/admin/bookings/components/BookingDetailModal'
import type { IBooking } from 'types/booking'

export const Route = createFileRoute('/customer/my-bookings/')({
    component: MyBookingsPage,
})

function MyBookingsPage() {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.customer.my_bookings' })
    const { t: tCommon } = useTranslation()
    const navigate = useNavigate()
    const { isAuthenticated } = useCustomerAuthStore()

    useEffect(() => {
        if (!isAuthenticated) {
            navigate({ to: APP_ROUTES.CUSTOMER.LOGIN, search: { redirect: APP_ROUTES.CUSTOMER.MY_BOOKINGS } })
        }
    }, [isAuthenticated, navigate])

    const { data, isLoading } = useQuery({
        queryKey: ['my-bookings'],
        queryFn: () => getMyPublicBookings({ limit: 50 }),
        enabled: isAuthenticated,
    })

    const bookings: IBooking[] = (() => {
        const payload = (data as any)?.data ?? data
        if (Array.isArray(payload)) return payload
        if (Array.isArray(payload?.data)) return payload.data
        if (Array.isArray(payload?.result)) return payload.result
        return []
    })()

    if (!isAuthenticated) return null

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <Link
                    to={APP_ROUTES.CUSTOMER.ROOT}
                    className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"
                >
                    {t('search_trips')}
                </Link>
            </div>

            {isLoading && <p className="text-muted-foreground">{tCommon('common.loading')}</p>}

            {!isLoading && bookings.length === 0 && (
                <div className="py-16 text-center space-y-3">
                    <p className="text-muted-foreground">{t('empty')}</p>
                    <Link
                        to={APP_ROUTES.CUSTOMER.ROOT}
                        className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                        {t('search_trips')}
                    </Link>
                </div>
            )}

            {bookings.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('booking_code')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('route')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('date')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('seats')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('amount')}</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('status')}</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => {
                                const from = (b.trip as any)?.route?.fromLocationName ?? ''
                                const to = (b.trip as any)?.route?.toLocationName ?? ''
                                return (
                                    <tr key={b.bookingId} className="border-t border-border hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono text-xs font-medium">{b.bookingCode}</td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-36 truncate">
                                            {from && to ? `${from} → ${to}` : (b.trip as any)?.tripId ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                            {(b.trip as any)?.departureTime ? formatDate((b.trip as any).departureTime) : formatDate(b.createdAt)}
                                        </td>
                                        <td className="px-4 py-3 text-center">{b.seats?.length ?? 0}</td>
                                        <td className="px-4 py-3 font-medium whitespace-nowrap">{formatVnd(b.totalAmount)}</td>
                                        <td className="px-4 py-3">{statusBadge(b.status.toLowerCase() as any, tCommon)}</td>
                                        <td className="px-4 py-3">
                                            <Link
                                                to="/customer/my-bookings/$code"
                                                params={{ code: b.bookingCode }}
                                                className="text-xs font-medium text-primary hover:underline"
                                            >
                                                {t('view')}
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
