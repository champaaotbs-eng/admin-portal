import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { MapPin, Calendar, Clock, Bus, Phone, DollarSign, Info, AlertTriangle, User, Mail } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { RouteDirection } from '@/components/shared/route-direction'
import { StopTypePreview } from '@/components/shared/stop-type-preview'
import { formatDate, formatTime, formatVnd } from '@/utils/format'
import type { ITrip, ISeatAvailability } from '@/types/trip'
import { getTripDisplayStatus } from '@/types/trip'

interface TripDetailsModalProps {
  trip: ITrip | null
  open: boolean
  onClose: () => void
  getTripDetails: (tripId: string) => Promise<IResponse<ITrip>>
}

const SeatPreview = ({ seats }: { seats: ITrip['seatAvailability'] }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'pages.trips' })
  const [selected, setSelected] = useState<ISeatAvailability | null>(null)

  if (!seats?.length) return <p className="text-sm text-muted-foreground">{t('no_seat_layout')}</p>

  const floors = [...new Set(seats.map((s) => s.floor))].sort()

  return (
    <div className="flex gap-4">
      {/* Left: seat layout */}
      <div className="flex-1 space-y-4 overflow-x-auto">
        {floors.map((floor) => {
          const floorSeats = seats.filter((s) => s.floor === floor)
          const maxRow = Math.max(...floorSeats.map((s) => s.row))
          const maxCol = Math.max(...floorSeats.map((s) => s.col))
          const available = floorSeats.filter((s) => s.isAvailable).length
          const occupied = floorSeats.length - available

          return (
            <div key={floor} className="rounded-lg border p-4">
              <p className="mb-3 text-sm font-medium">{t('floor')} {floor}</p>
              <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `repeat(${maxCol + 1}, minmax(0, 1fr))` }}>
                {Array.from({ length: (maxRow + 1) * (maxCol + 1) }).map((_, idx) => {
                  const row = Math.floor(idx / (maxCol + 1))
                  const col = idx % (maxCol + 1)
                  const seat = floorSeats.find((s) => s.row === row && s.col === col)
                  if (!seat) return <div key={idx} className="h-9 w-9" />
                  const isSelected = selected?.seatId === seat.seatId
                  return (
                    <button
                      key={seat.seatId}
                      type="button"
                      onClick={() => setSelected(isSelected ? null : seat)}
                      className={`flex h-9 w-9 items-center justify-center rounded border text-[10px] font-medium transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : seat.isAvailable
                          ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400'
                          : 'border-gray-300 bg-gray-200 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                      }`}
                    >
                      {seat.seatCode}
                    </button>
                  )
                })}
              </div>
              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded border border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950" />
                  <span>{t('available')} ({available})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded border border-gray-300 bg-gray-200 dark:border-gray-700 dark:bg-gray-800" />
                  <span>{t('occupied')} ({occupied})</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Right: seat detail */}
      <div className="w-52 shrink-0 rounded-lg border p-4 text-sm">
        {selected ? (
          <div className="space-y-2">
            <p className="font-semibold">{selected.seatCode}</p>
            <p className="text-muted-foreground">{formatVnd(selected.price)}</p>
            <p className={selected.isAvailable ? 'text-green-600' : 'text-gray-500'}>
              {selected.isAvailable ? t('available') : t('occupied')}
            </p>
            {selected.booking && (
              <div className="mt-3 space-y-1.5 border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground">{t('booking_info')}</p>
                <p className="font-mono text-xs">{selected.booking.bookingCode}</p>
                {selected.booking.passengerName && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <User className="h-3 w-3 text-muted-foreground" />
                    {selected.booking.passengerName}
                  </div>
                )}
                {selected.booking.passengerEmail && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    {selected.booking.passengerEmail}
                  </div>
                )}
                {selected.booking.passengerPhone && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    {selected.booking.passengerPhone}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t('select_seat_to_view')}</p>
        )}
      </div>
    </div>
  )
}

export const TripDetailsModal = ({ trip, open, onClose, getTripDetails }: TripDetailsModalProps) => {
  const { t: tCommon } = useTranslation()
  const { t: tTrips } = useTranslation('translation', { keyPrefix: 'pages.trips' })

  const { data: detailsData, isLoading } = useQuery({
    queryKey: ['trip-details', trip?.tripId],
    queryFn: () => getTripDetails(trip!.tripId),
    enabled: !!trip?.tripId && open,
    select: (res) => res.data ?? null,
  })

  const details = detailsData ?? trip

  if (!details) return null

  const fromLocation = details.fromLocationName || tTrips('unknown_location')
  const toLocation = details.toLocationName || tTrips('unknown_location')
  const busCompanyName = details.busCompanyName || tCommon('common.not_available')
  const hasBusInfo = Boolean(details.busVersionId || details.busName || details.busLicensePlate || details.driverPhone)
  const sortedStops = details.tripStops
    ? [...details.tripStops].sort((a, b) => (a.stopOrder ?? a.sortOrder ?? 0) - (b.stopOrder ?? b.sortOrder ?? 0))
    : []
  const stopLabel = (stop: ITrip['tripStops'][number]) => {
    const locationName = stop.routeStop?.location?.name || stop.locationName || tTrips('unknown_location')
    const locationAddress = stop.routeStop?.location?.address || stop.locationAddress
    const time = stop.pickupTime || stop.dropoffTime
    return {
      time: time ? formatTime(time) : '',
      name: locationName,
      address: locationAddress,
    }
  }
  const pickupStopLabels = sortedStops.filter((stop) => stop.stopType === 'PICKUP').map(stopLabel)
  const dropoffStopLabels = sortedStops.filter((stop) => stop.stopType === 'DROPOFF').map(stopLabel)

  return (
    <Dialog open={open} onClose={onClose} title={tTrips('trip_details')} className="max-w-4xl max-h-[90vh] overflow-y-auto">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{tCommon('common.loading')}</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">{tTrips('route')}</p>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <RouteDirection
                  pickup={fromLocation}
                  dropoff={toLocation}
                  pickupLabel={tTrips('stop_type_pickup')}
                  dropoffLabel={tTrips('stop_type_dropoff')}
                />
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">{tTrips('status')}</p>
              <div className="flex items-center gap-2">
                <Badge>{tCommon(`status.${getTripDisplayStatus(details).toLowerCase()}`)}</Badge>
                {details.hasBookings && (
                  <span className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {tTrips('has_bookings')}
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">{tTrips('departure')}</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDate(details.departureTime)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatTime(details.departureTime)}
                </div>
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">{tTrips('arrival')}</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDate(details.arrivalTime)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatTime(details.arrivalTime)}
                </div>
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">{tTrips('base_price')}</p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                {formatVnd(details.basePrice)}
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">{tTrips('company')}</p>
              <p className="text-sm">{busCompanyName}</p>
            </div>
          </div>

          {hasBusInfo && (
            <div>
              <p className="mb-2 text-sm font-medium">{tTrips('bus_information')}</p>
              <div className="rounded-lg border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Bus className="h-4 w-4 text-muted-foreground" />
                    <span>{details.busName || tCommon('common.not_available')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{tTrips('license_plate')}:</span>
                    <span className="font-mono">{details.busLicensePlate || tCommon('common.not_available')}</span>
                  </div>
                  {details.driverPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{details.driverPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {sortedStops.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-medium">{tTrips('trip_stops')} ({sortedStops.length})</p>
              <StopTypePreview
                pickupStops={pickupStopLabels}
                dropoffStops={dropoffStopLabels}
                pickupLabel={tTrips('stop_type_pickup')}
                dropoffLabel={tTrips('stop_type_dropoff')}
                emptyLabel={tCommon('common.not_available')}
              />
            </div>
          )}

          {details.seatAvailability && (
            <div>
              <p className="mb-3 text-sm font-medium">{tTrips('seat_availability')}</p>
              <SeatPreview seats={details.seatAvailability} />
            </div>
          )}

          {details.cancelReason && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">{tTrips('cancellation_reason')}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{details.cancelReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Dialog>
  )
}
