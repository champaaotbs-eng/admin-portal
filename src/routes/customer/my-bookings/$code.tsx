import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Clock, MapPin, ChevronRight } from 'lucide-react'
import { getPublicBookingByCode, cancelPublicBooking } from 'services/public/booking.service'
import { initiatePayment } from 'services/public/payment.service'
import { EBookingStatus, EPaymentMethod } from 'types/booking'
import { EPaymentProvider } from 'types/payment'
import { formatVnd, formatDate } from 'utils/format'
import { statusBadge } from 'components/admin/bookings/components/BookingDetailModal'
import { APP_ROUTES } from '@/constants/app-routes'
import { toast } from 'sonner'

export const Route = createFileRoute('/customer/my-bookings/$code')({
    component: BookingDetailPage,
})

function BookingDetailPage() {
    const { code } = Route.useParams()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.customer.booking_detail' })
    const { t: tSuccess } = useTranslation('translation', { keyPrefix: 'pages.customer.booking_success' })
    const { t: tCommon } = useTranslation()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [showCancel, setShowCancel] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [cancelError, setCancelError] = useState('')

    const { data, isLoading, isError } = useQuery({
        queryKey: ['booking-detail', code],
        queryFn: () => getPublicBookingByCode(code),
    })

    const booking = (data as any)?.data ?? data

    const cancelMutation = useMutation({
        mutationFn: () => cancelPublicBooking(booking.bookingId),
        onSuccess: () => {
            toast.success(t('cancelled_msg'))
            queryClient.invalidateQueries({ queryKey: ['booking-detail', code] })
            queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
            setShowCancel(false)
        },
        onError: () => setCancelError(t('errors.cancel_failed')),
    })

    const handleCancel = () => {
        if (cancelReason.length < 5) { setCancelError(t('errors.cancel_reason_min')); return }
        setCancelError('')
        cancelMutation.mutate()
    }

    const handlePay = async (provider: EPaymentProvider) => {
        try {
            toast.loading(tSuccess('payment_initiated'))
            const res = await initiatePayment({
                bookingId: booking.bookingId,
                provider,
                returnUrl: `${window.location.origin}/customer/my-bookings/${code}`,
            })
            const d = (res as any)?.data ?? res
            if (d?.paymentUrl) window.location.assign(d.paymentUrl)
        } catch {
            toast.error('Payment initiation failed.')
        }
    }

    if (isLoading) return <div className="py-20 text-center text-muted-foreground">{tCommon('common.loading')}</div>
    if (isError || !booking) return <div className="py-20 text-center text-destructive">Booking not found.</div>

    const isPendingPayment = booking.status === EBookingStatus.PENDING_PAYMENT
    const canCancel = [EBookingStatus.PENDING_PAYMENT, EBookingStatus.RESERVED, EBookingStatus.CONFIRMED].includes(booking.status)
    const from = (booking.trip as any)?.route?.fromLocationName ?? ''
    const to = (booking.trip as any)?.route?.toLocationName ?? ''
    const depTime = (booking.trip as any)?.departureTime

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link to={APP_ROUTES.CUSTOMER.MY_BOOKINGS} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> {t('back')}
            </Link>

            {/* Header card */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold">{t('title', { code: booking.bookingCode })}</h1>
                        <p className="text-sm text-muted-foreground">{tCommon('pages.bookings.table.booking_date')}: {formatDate(booking.createdAt)}</p>
                    </div>
                    {statusBadge(booking.status.toLowerCase() as any, tCommon)}
                </div>

                {/* Booking code highlight */}
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    <div>
                        <p className="text-xs text-muted-foreground">{tSuccess('code_label')}</p>
                        <p className="font-mono text-lg font-bold tracking-widest">{booking.bookingCode}</p>
                    </div>
                </div>

                {/* Trip info */}
                {(from || to || depTime) && (
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase">{t('trip_section')}</p>
                        {from && to && (
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{from}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="font-medium">{to}</span>
                            </div>
                        )}
                        {depTime && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{new Date(depTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {formatDate(depTime)}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Seats */}
                {booking.seats?.length > 0 && (
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase">{t('seats_section')}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {booking.seats.map((s: any) => (
                                <span key={s.bookingSeatId} className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                                    {s.seat?.seatCode ?? s.seatId} — {formatVnd(s.price)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between">
                    <span className="font-medium">{tSuccess('amount_label')}</span>
                    <span className="text-xl font-bold text-primary">{formatVnd(booking.totalAmount)}</span>
                </div>

                {/* Expiry */}
                {booking.expiresAt && isPendingPayment && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                        {tSuccess('expires_label')}: {new Date(booking.expiresAt).toLocaleString()}
                    </p>
                )}

                {/* Pay on board note */}
                {booking.paymentMethod === EPaymentMethod.PAY_ON_BOARD && (
                    <p className="text-sm text-muted-foreground">{tSuccess('onboard_note')}</p>
                )}
            </div>

            {/* Payment actions */}
            {isPendingPayment && booking.paymentMethod === EPaymentMethod.ONLINE && (
                <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                        onClick={() => handlePay(EPaymentProvider.VNPAY)}
                        className="flex-1 rounded-md bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                        {tSuccess('pay_now')}
                    </button>
                    <button
                        onClick={() => handlePay(EPaymentProvider.MOMO)}
                        className="flex-1 rounded-md border border-pink-500 bg-pink-50 px-4 py-2.5 text-sm font-semibold text-pink-600 hover:bg-pink-100 dark:bg-pink-950 dark:text-pink-300"
                    >
                        {tSuccess('pay_momo')}
                    </button>
                </div>
            )}

            {/* Cancel */}
            {canCancel && (
                <div className="rounded-lg border border-border p-4 space-y-3">
                    {!showCancel ? (
                        <button
                            onClick={() => setShowCancel(true)}
                            className="text-sm font-medium text-destructive hover:underline"
                        >
                            {t('cancel_btn')}
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm">{t('cancel_confirm')}</p>
                            <div>
                                <label className="mb-1 block text-sm font-medium">{t('cancel_reason_label')}</label>
                                <textarea
                                    value={cancelReason}
                                    onChange={e => setCancelReason(e.target.value)}
                                    placeholder={t('cancel_reason_placeholder')}
                                    rows={2}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                {cancelError && <p className="mt-1 text-xs text-destructive">{cancelError}</p>}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelMutation.isPending}
                                    className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60"
                                >
                                    {cancelMutation.isPending ? '...' : t('cancel_submit')}
                                </button>
                                <button
                                    onClick={() => { setShowCancel(false); setCancelReason(''); setCancelError('') }}
                                    className="rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
                                >
                                    {tCommon('common.cancel')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
