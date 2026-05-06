import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { TripList } from '@/components/shared/trips/trip-list'
import { TripDetailsModal } from '@/components/shared/trips/trip-details-modal'
import { TripEditModal } from '@/components/shared/trips/trip-edit-modal'
import { TripForm } from '@/components/company/trips/components/TripForm'
import { getCompanyTrips, getCompanyTripById, createCompanyTrip, updateCompanyTrip, cancelCompanyTrip } from '@/services/company/trip.service'
import { useAuthStore } from '@/store/auth.store'
import type { ITrip } from '@/types/trip'
import type { TripFormData } from '@/components/company/trips/validation-schema'

const QUERY_KEY = ['company-trips']

export const CompanyTripsPage = () => {
  const { t: tCommon } = useTranslation()
  const { t: tTrips } = useTranslation('translation', { keyPrefix: 'pages.trips' })
  const queryClient = useQueryClient()
  const { admin } = useAuthStore()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewTrip, setViewTrip] = useState<ITrip | null>(null)
  const [editTrip, setEditTrip] = useState<ITrip | null>(null)
  const [deleteTrip, setDeleteTrip] = useState<ITrip | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: [...QUERY_KEY, page, search, statusFilter],
    queryFn: () =>
      getCompanyTrips({
        page,
        limit,
        busCompanyId: admin?.busCompanyId,
        status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
      }),
    select: (res) => res.data,
    enabled: !!admin?.busCompanyId,
  })

  const trips = useMemo(() => {
    const list = data?.result || []
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter(
      (t) =>
        t.tripId.toLowerCase().includes(q) ||
        t.fromLocationName?.toLowerCase().includes(q) ||
        t.toLocationName?.toLowerCase().includes(q)
    )
  }, [data?.result, search])

  const updateMutation = useMutation({
    mutationFn: ({ tripId, data }: { tripId: string; data: any }) =>
      updateCompanyTrip(tripId, {
        departureTime: new Date(data.departureTime).toISOString(),
        arrivalTime: new Date(data.arrivalTime).toISOString(),
        basePrice: Number(data.basePrice),
        isPublished: data.isPublished,
        seatPrices: data.seatPrices?.map((s: any) => ({ seatId: s.seatId, price: s.price })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Trip updated')
      setEditTrip(null)
    },
    onError: (err: any) => {
      toast.error(err?.localizedMessage || 'Update failed')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (tripId: string) => cancelCompanyTrip(tripId, { cancelReason: 'Cancelled by company' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Trip cancelled')
      setDeleteTrip(null)
    },
    onError: (err: any) => {
      toast.error(err?.localizedMessage || 'Cancel failed')
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: TripFormData) =>
      createCompanyTrip({
        routeId: data.routeId,
        busVersionId: data.busVersionId || undefined,
        busCompanyId: admin?.busCompanyId ?? '',
        departureTime: new Date(data.departureTime).toISOString(),
        arrivalTime: new Date(data.arrivalTime).toISOString(),
        basePrice: Number(data.basePrice),
        isPublished: data.isPublished ?? true,
        seatPrices: data.seatPrices?.map(s => ({ seatId: s.seatId, price: s.price })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success(tTrips('create_success'))
      setCreateOpen(false)
    },
    onError: (err: any) => {
      toast.error(err?.localizedMessage || tCommon('common.error', 'Something went wrong'))
    },
  })

  const hasFilter = search || statusFilter !== 'all'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{tTrips('my_trips')}</h1>
        <p className="text-sm text-muted-foreground">{tTrips('company_description')}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tTrips('search_placeholder')}
            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
        >
          <option value="all">{tCommon('status.all')}</option>
          <option value="SCHEDULED">{tCommon('status.scheduled')}</option>
          <option value="ACTIVE">{tCommon('status.active')}</option>
          <option value="COMPLETED">{tCommon('status.completed')}</option>
          <option value="CANCELLED">{tCommon('status.cancelled')}</option>
        </select>
        {hasFilter && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch('')
              setStatusFilter('all')
            }}
          >
            <X className="h-3.5 w-3.5" /> {tCommon('common.clear')}
          </Button>
        )}
        <Button onClick={() => setCreateOpen(true)} disabled={!admin?.busCompanyId}>
          {tTrips('add_trip')}
        </Button>
      </div>

      <TripList
        trips={trips}
        currentPage={page}
        totalPages={data?.meta?.totalPages || 1}
        pageSize={limit}
        totalItems={data?.meta?.totalItems || 0}
        isLoading={isLoading}
        onPageChange={setPage}
        onView={setViewTrip}
        onEdit={setEditTrip}
        onDelete={setDeleteTrip}
      />

      <TripDetailsModal
        trip={viewTrip}
        open={!!viewTrip}
        onClose={() => setViewTrip(null)}
        getTripDetails={getCompanyTripById}
      />

      <TripEditModal
        trip={editTrip}
        open={!!editTrip}
        onClose={() => setEditTrip(null)}
        onSubmit={(tripId, data) => updateMutation.mutate({ tripId, data })}
        isSubmitting={updateMutation.isPending}
        getTripDetails={getCompanyTripById}
      />

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={tTrips('add_trip_title')}
        className="max-w-2xl"
      >
        <TripForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setCreateOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </Dialog>

      {deleteTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold">{tTrips('cancel_trip')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {tTrips('cancel_confirmation')}
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(deleteTrip.tripId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? tCommon('common.loading') : tTrips('cancel_trip')}
              </Button>
              <Button variant="outline" onClick={() => setDeleteTrip(null)}>
                {tCommon('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
