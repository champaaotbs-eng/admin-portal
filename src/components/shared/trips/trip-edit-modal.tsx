import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ITrip } from '@/types/trip'

interface TripFormData {
  departureTime: string
  arrivalTime: string
  basePrice: string
  isPublished: boolean
  status?: string
}

interface TripEditModalProps {
  trip: ITrip | null
  open: boolean
  onClose: () => void
  onSubmit: (tripId: string, data: TripFormData) => void
  isSubmitting?: boolean
}

const toDateTimeLocal = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const TripEditModal = ({ trip, open, onClose, onSubmit, isSubmitting }: TripEditModalProps) => {
  const { t: tCommon } = useTranslation()
  const { t: tTrips } = useTranslation('translation', { keyPrefix: 'pages.trips' })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TripFormData>()

  useEffect(() => {
    if (trip && open) {
      reset({
        departureTime: toDateTimeLocal(trip.departureTime),
        arrivalTime: toDateTimeLocal(trip.arrivalTime),
        basePrice: String(trip.basePrice),
        isPublished: trip.isPublished,
        status: trip.status,
      })
    }
  }, [trip, open, reset])

  const handleFormSubmit = (data: TripFormData) => {
    if (trip) {
      onSubmit(trip.tripId, data)
    }
  }

  if (!trip) return null

  return (
    <Dialog open={open} onClose={onClose} title={tTrips('edit_trip')} className="max-w-2xl">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">{tTrips('departure_time')}</label>
            <input
              type="datetime-local"
              {...register('departureTime', { required: tCommon('common.required') })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.departureTime && (
              <p className="mt-1 text-xs text-destructive">{errors.departureTime.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{tTrips('arrival_time')}</label>
            <input
              type="datetime-local"
              {...register('arrivalTime', { required: tCommon('common.required') })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.arrivalTime && (
              <p className="mt-1 text-xs text-destructive">{errors.arrivalTime.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{tTrips('base_price')} (VND)</label>
            <input
              type="number"
              step="1000"
              {...register('basePrice', {
                required: tCommon('common.required'),
                min: { value: 0, message: tCommon('common.must_be_positive') },
              })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.basePrice && (
              <p className="mt-1 text-xs text-destructive">{errors.basePrice.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{tTrips('status')}</label>
            <select
              {...register('status')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="SCHEDULED">{tCommon('status.scheduled')}</option>
              <option value="ACTIVE">{tCommon('status.active')}</option>
              <option value="COMPLETED">{tCommon('status.completed')}</option>
              <option value="CANCELLED">{tCommon('status.cancelled')}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublished"
            {...register('isPublished')}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="isPublished" className="text-sm font-medium">
            {tTrips('published')}
          </label>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? tCommon('common.loading') : tCommon('common.save')}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            {tCommon('common.cancel')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
