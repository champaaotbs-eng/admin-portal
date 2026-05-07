import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TripList } from '@/components/shared/trips/trip-list'
import { TripDetailsModal } from '@/components/shared/trips/trip-details-modal'
import { getAdminTrips, getAdminTripById } from '@/services/admins/trip.service'
import type { ITrip } from '@/types/trip'

const QUERY_KEY = ['admin-trips']

export const AdminTripsPage = () => {
  const { t: tCommon } = useTranslation()
  const { t: tTrips } = useTranslation('translation', { keyPrefix: 'pages.trips' })

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewTrip, setViewTrip] = useState<ITrip | null>(null)

  const limit = 10

  const { data, isLoading } = useQuery({
    queryKey: [...QUERY_KEY, page, search, statusFilter],
    queryFn: () =>
      getAdminTrips({
        page,
        limit,
        status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
      }),
    select: (res) => res.data,
  })

  const trips = useMemo(() => {
    const list = data?.result || []
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter(
      (t) =>
        t.tripId.toLowerCase().includes(q) ||
        t.fromLocationName?.toLowerCase().includes(q) ||
        t.toLocationName?.toLowerCase().includes(q) ||
        t.busCompanyName?.toLowerCase().includes(q)
    )
  }, [data?.result, search])

  const hasFilter = search || statusFilter !== 'all'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{tTrips('title')}</h1>
        <p className="text-sm text-muted-foreground">{tTrips('admin_description')}</p>
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
      />

      <TripDetailsModal
        trip={viewTrip}
        open={!!viewTrip}
        onClose={() => setViewTrip(null)}
        getTripDetails={getAdminTripById}
      />
    </div>
  )
}
