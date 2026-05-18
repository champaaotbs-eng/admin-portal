import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, MapPin, Clock } from 'lucide-react'
import { getPublicTripById } from 'services/public/trip.service'
import { createPublicBooking } from 'services/public/booking.service'
import { initiatePayment } from 'services/public/payment.service'
import { useCustomerAuthStore } from 'store/customer-auth.store'
import { formatVnd, formatDate } from 'utils/format'
import { EPaymentMethod } from 'types/booking'
import { EStopType } from 'types/route'
import { EPaymentProvider } from 'types/payment'
import type { ISeatAvailability, ITripStop } from 'types/trip'
import { APP_ROUTES } from '@/constants/app-routes'
import { toast } from 'sonner'
import { RouteDirection } from '@/components/shared/route-direction'
import { StopTypePreview } from '@/components/shared/stop-type-preview'

export const Route = createFileRoute('/customer/trips/$tripId')({
    component: TripDetailPage,
})

// ─── Seat Map ────────────────────────────────────────────────────────────────

function SeatMap({
    seats,
    selected,
    onToggle,
}: {
    seats: ISeatAvailability[]
    selected: string[]
    onToggle: (id: string) => void
}) {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.customer.trip_detail' })

    const floors = [...new Set(seats.map(s => s.floor))].sort()
    const [activeFloor, setActiveFloor] = useState(floors[0] ?? 1)

    const floorSeats = seats.filter(s => s.floor === activeFloor)
    const maxRow = Math.max(...floorSeats.map(s => s.row), 0)
    const maxCol = Math.max(...floorSeats.map(s => s.col), 0)
    const grid = new Map(floorSeats.map(s => [`${s.row}-${s.col}`, s]))

    const seatTypeColor: Record<string, string> = {
        STANDARD: 'bg-blue-500/20 border-blue-400 text-blue-700 dark:text-blue-300',
        VIP: 'bg-amber-500/20 border-amber-400 text-amber-700 dark:text-amber-300',
        BED: 'bg-purple-500/20 border-purple-400 text-purple-700 dark:text-purple-300',
    }

    return (
        <div className="space-y-3">
            {floors.length > 1 && (
                <div className="flex gap-2">
                    {floors.map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFloor(f)}
                            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                                activeFloor === f
                                    ? 'bg-primary text-primary-foreground'
                                    : 'border border-input hover:bg-accent'
                            }`}
                        >
                            {t('floor_tab', { floor: f })}
                        </button>
                    ))}
                </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="inline-block h-4 w-4 rounded border border-border bg-muted" /> {t('seat_available')}</span>
                <span className="flex items-center gap-1"><span className="inline-block h-4 w-4 rounded border border-border bg-muted/30 opacity-40" /> {t('seat_booked')}</span>
                <span className="flex items-center gap-1"><span className="inline-block h-4 w-4 rounded border border-primary bg-primary/20" /> {t('seat_selected')}</span>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto">
                <div
                    className="inline-grid gap-1.5"
                    style={{ gridTemplateColumns: `repeat(${maxCol}, 2.5rem)` }}
                >
                    {Array.from({ length: maxRow }, (_, ri) => {
                        const row = ri + 1
                        return Array.from({ length: maxCol }, (_, ci) => {
                            const col = ci + 1
                            const seat = grid.get(`${row}-${col}`)

                            if (!seat) {
                                return <div key={`${row}-${col}`} className="h-10 w-10" />
                            }

                            const isSelected = selected.includes(seat.seatId)
                            const isBooked = !seat.isAvailable

                            return (
                                <button
                                    key={seat.seatId}
                                    disabled={isBooked}
                                    onClick={() => onToggle(seat.seatId)}
                                    title={`${seat.seatCode} — ${formatVnd(seat.price)}`}
                                    className={`h-10 w-10 rounded border text-xs font-medium transition-all ${
                                        isBooked
                                            ? 'cursor-not-allowed border-border bg-muted/30 text-muted-foreground opacity-40'
                                            : isSelected
                                            ? 'border-primary bg-primary/20 text-primary ring-1 ring-primary'
                                            : `border cursor-pointer hover:ring-1 hover:ring-primary/50 ${seatTypeColor[seat.seatType] ?? seatTypeColor.STANDARD}`
                                    }`}
                                >
                                    {seat.seatCode}
                                </button>
                            )
                        })
                    }).flat()}
                </div>
            </div>
        </div>
    )
}

// ─── Page ────────────────────────────────────────────────────────────────────

function TripDetailPage() {
    const { tripId } = Route.useParams()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.customer.trip_detail' })
    const { t: tSuccess } = useTranslation('translation', { keyPrefix: 'pages.customer.booking_success' })
    const navigate = useNavigate()
    const { isAuthenticated } = useCustomerAuthStore()

    const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([])
    const [pickupStopId, setPickupStopId] = useState('')
    const [dropoffStopId, setDropoffStopId] = useState('')
    const [paymentMethod, setPaymentMethod] = useState<EPaymentMethod>(EPaymentMethod.PAY_ON_BOARD)
    const [formError, setFormError] = useState('')

    const { data: tripData, isLoading, isError } = useQuery({
        queryKey: ['public-trip', tripId],
        queryFn: () => getPublicTripById(tripId),
    })

    const trip = (tripData as any)?.data ?? tripData

    const bookingMutation = useMutation({
        mutationFn: createPublicBooking,
        onSuccess: async (res) => {
            const booking = (res as any)?.data ?? res
            if (paymentMethod === EPaymentMethod.ONLINE) {
                try {
                    toast.loading(tSuccess('payment_initiated'))
                    const payRes = await initiatePayment({
                        bookingId: booking.bookingId,
                        provider: EPaymentProvider.VNPAY,
                        returnUrl: `${window.location.origin}/customer/my-bookings/${booking.bookingCode}`,
                    })
                    const payData = (payRes as any)?.data ?? payRes
                    if (payData?.paymentUrl) {
                        window.location.assign(payData.paymentUrl)
                        return
                    }
                } catch {
                    // payment initiation failed — still show booking confirmation
                }
            }
            navigate({ to: '/customer/my-bookings/$code', params: { code: booking.bookingCode } })
        },
        onError: () => {
            setFormError(t('errors.booking_failed'))
        },
    })

    const toggleSeat = (id: string) => {
        setSelectedSeatIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        )
    }

    const handleSubmit = () => {
        setFormError('')
        if (selectedSeatIds.length === 0) { setFormError(t('errors.select_seats')); return }
        if (!pickupStopId) { setFormError(t('errors.select_pickup')); return }
        if (!dropoffStopId) { setFormError(t('errors.select_dropoff')); return }
        if (pickupStopId === dropoffStopId) { setFormError(t('errors.same_stop')); return }

        bookingMutation.mutate({
            tripId,
            seatIds: selectedSeatIds,
            pickupStopId,
            dropoffStopId,
            paymentMethod,
            passengerName: '',
            passengerPhone: '',
        })
    }

    if (isLoading) return <div className="py-20 text-center text-muted-foreground">Loading…</div>
    if (isError || !trip) return <div className="py-20 text-center text-destructive">Trip not found.</div>

    const seats: ISeatAvailability[] = trip.seatAvailability ?? []
    const stops: ITripStop[] = trip.tripStops ?? []
    const pickupStops = stops.filter(s =>
        s.stopType === EStopType.PICKUP
    )
    const dropoffStops = stops.filter(s =>
        s.stopType === EStopType.DROPOFF
    )
    const pickupStopPreview = pickupStops.map((stop) => ({
        time: stop.pickupTime ? new Date(stop.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        name: stop.routeStop?.location?.name ?? stop.locationName ?? stop.tripStopId,
        address: stop.routeStop?.location?.address ?? stop.locationAddress,
    }))
    const dropoffStopPreview = dropoffStops.map((stop) => ({
        time: stop.dropoffTime ? new Date(stop.dropoffTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        name: stop.routeStop?.location?.name ?? stop.locationName ?? stop.tripStopId,
        address: stop.routeStop?.location?.address ?? stop.locationAddress,
    }))

    const selectedSeats = seats.filter(s => selectedSeatIds.includes(s.seatId))
    const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0)

    const from = trip.route?.fromLocationName ?? ''
    const to = trip.route?.toLocationName ?? ''

    return (
        <div className="space-y-6">
            {/* Back */}
            <Link to={APP_ROUTES.CUSTOMER.ROOT} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> {t('back')}
            </Link>

            {/* Trip info */}
            <div className="rounded-lg border border-border bg-card p-5">
                <h1 className="text-xl font-bold">{t('trip_info')}</h1>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <RouteDirection pickup={from} dropoff={to} emptyLabel="—" />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                            {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' → '}
                            {new Date(trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' · '}
                            {formatDate(trip.departureTime)}
                        </span>
                    </div>
                    {trip.busCompany?.name && (
                        <span className="text-muted-foreground">{t('company')}: {trip.busCompany.name}</span>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                {/* Seat map */}
                <div className="rounded-lg border border-border bg-card p-5 space-y-4">
                    <h2 className="font-semibold">{t('select_seats')}</h2>
                    {seats.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No seat data available.</p>
                    ) : (
                        <SeatMap seats={seats} selected={selectedSeatIds} onToggle={toggleSeat} />
                    )}
                </div>

                {/* Booking form */}
                <div className="rounded-lg border border-border bg-card p-5 space-y-5">
                    <h2 className="font-semibold">{t('booking_form')}</h2>

                    {/* Selected seats */}
                    <div>
                        <p className="mb-2 text-sm font-medium">{t('selected_seats')}</p>
                        {selectedSeats.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t('no_seats_selected')}</p>
                        ) : (
                            <div className="flex flex-wrap gap-1.5">
                                {selectedSeats.map(s => (
                                    <span key={s.seatId} className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                        {s.seatCode} ({formatVnd(s.price)})
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <StopTypePreview
                        pickupStops={pickupStopPreview}
                        dropoffStops={dropoffStopPreview}
                        pickupLabel={t('pickup_stop')}
                        dropoffLabel={t('dropoff_stop')}
                        emptyLabel="—"
                    />

                    {/* Pickup stop */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">{t('pickup_stop')}</label>
                        <select
                            value={pickupStopId}
                            onChange={e => setPickupStopId(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">{t('select_stop')}</option>
                            {pickupStops.map(stop => (
                                <option key={stop.tripStopId} value={stop.tripStopId}>
                                    {stop.routeStop?.location?.name ?? stop.tripStopId}
                                    {stop.pickupTime ? ` — ${new Date(stop.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Dropoff stop */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">{t('dropoff_stop')}</label>
                        <select
                            value={dropoffStopId}
                            onChange={e => setDropoffStopId(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">{t('select_stop')}</option>
                            {dropoffStops.map(stop => (
                                <option key={stop.tripStopId} value={stop.tripStopId}>
                                    {stop.routeStop?.location?.name ?? stop.tripStopId}
                                    {stop.dropoffTime ? ` — ${new Date(stop.dropoffTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Payment method */}
                    <div>
                        <p className="mb-2 text-sm font-medium">{t('payment_method')}</p>
                        <div className="space-y-2">
                            {[
                                { value: EPaymentMethod.PAY_ON_BOARD, label: t('payment_onboard'), desc: t('payment_onboard_desc') },
                                { value: EPaymentMethod.ONLINE, label: t('payment_online'), desc: t('payment_online_desc') },
                            ].map(opt => (
                                <label
                                    key={opt.value}
                                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                                        paymentMethod === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        value={opt.value}
                                        checked={paymentMethod === opt.value}
                                        onChange={() => setPaymentMethod(opt.value)}
                                        className="mt-0.5"
                                    />
                                    <div>
                                        <p className="text-sm font-medium">{opt.label}</p>
                                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                        <span className="text-sm font-medium">{t('total')}</span>
                        <span className="text-xl font-bold text-primary">{formatVnd(totalAmount)}</span>
                    </div>

                    {formError && <p className="text-sm text-destructive">{formError}</p>}

                    {/* CTA */}
                    {isAuthenticated ? (
                        <button
                            onClick={handleSubmit}
                            disabled={bookingMutation.isPending}
                            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                        >
                            {bookingMutation.isPending ? '...' : t('confirm_btn')}
                        </button>
                    ) : (
                        <div className="space-y-2 text-center">
                            <p className="text-sm text-muted-foreground">{t('login_to_book')}</p>
                            <Link
                                to={APP_ROUTES.CUSTOMER.LOGIN}
                                search={{ redirect: `/customer/trips/${tripId}` }}
                                className="block w-full rounded-md bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                            >
                                {t('go_to_login')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
