import { useMemo } from 'react'
import { Eye, Pencil, Trash2, MapPin, Calendar, Clock, Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { PaginatedTable, type PaginatedTableColumn } from '@/components/shared/pagination-table'
import { formatDate, formatTime } from '@/utils/format'
import type { ITrip } from '@/types/trip'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  scheduled: 'default',
  active: 'secondary',
  completed: 'outline',
  cancelled: 'destructive',
}

interface TripListProps {
  trips: ITrip[]
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  isLoading?: boolean
  onPageChange: (page: number) => void
  onView: (trip: ITrip) => void
  onEdit?: (trip: ITrip) => void
  onDelete?: (trip: ITrip) => void
}

export const TripList = ({
  trips,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  isLoading,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: TripListProps) => {
  const { t: tCommon } = useTranslation()
  const { t: tTrips } = useTranslation('translation', { keyPrefix: 'pages.trips' })

  const columns = useMemo<PaginatedTableColumn<ITrip>[]>(
    () => [
      {
        id: 'index',
        header: '#',
        renderCell: (_trip, index) => <span>{(currentPage - 1) * pageSize + index + 1}</span>,
      },
      {
        id: 'id',
        header: tTrips('table.id'),
        renderCell: (trip) => (
          <span className="font-mono text-xs text-muted-foreground">{trip.tripId.slice(0, 8)}</span>
        ),
      },
      {
        id: 'route',
        header: tTrips('table.route'),
        renderCell: (trip) => (
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="whitespace-normal break-words">
              {trip.fromLocationName || tTrips('unknown_location')} → {trip.toLocationName || tTrips('unknown_location')}
            </span>
          </div>
        ),
      },
      {
        id: 'departure',
        header: tTrips('table.departure'),
        renderCell: (trip) => (
          <div className="whitespace-nowrap text-xs">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              {formatDate(trip.departureTime)}
            </div>
            <div className="mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {formatTime(trip.departureTime)}
            </div>
          </div>
        ),
      },
      {
        id: 'arrival',
        header: tTrips('table.arrival'),
        renderCell: (trip) => (
          <div className="whitespace-nowrap text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(trip.arrivalTime)}
            </div>
            <div className="mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(trip.arrivalTime)}
            </div>
          </div>
        ),
      },
      {
        id: 'company',
        header: tTrips('table.company'),
        renderCell: (trip) => (
          <div className="flex items-center gap-1 text-xs">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="max-w-32 truncate">{trip.busCompanyName}</span>
          </div>
        ),
      },
      {
        id: 'status',
        header: tTrips('table.status'),
        renderCell: (trip) => (
          <Badge variant={STATUS_VARIANTS[trip.status.toLowerCase()] ?? 'secondary'} className="text-xs">
            {tCommon(`status.${trip.status.toLowerCase()}`, { defaultValue: trip.status })}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        headerClassName: 'text-right',
        cellClassName: 'text-right',
        renderCell: (trip) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onView(trip)}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
              title={tCommon('common.view')}
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(trip)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
                title={tCommon('common.edit')}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(trip)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title={tCommon('common.delete')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [currentPage, pageSize, tCommon, tTrips, onView, onEdit, onDelete]
  )

  return (
    <PaginatedTable
      columns={columns}
      data={trips}
      rowKey={(trip) => trip.tripId}
      isLoading={isLoading}
      emptyMessage={tCommon('common.no_results')}
      pagination={{
        currentPage,
        totalPages,
        totalItems,
        pageSize,
        onPageChange,
      }}
    />
  )
}
