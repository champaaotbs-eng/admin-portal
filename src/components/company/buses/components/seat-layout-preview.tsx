import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from 'lucide-react'
import { steeringWheel } from '@lucide/lab'
import { cn } from '@/utils/cn'
import { ESeatType } from 'types/seat-layout'
import type { ISeatLayout } from 'types/seat-layout'
import { SeatTypeIcon } from 'components/company/seat-layouts/components/seat-type-icon'

interface SeatLayoutPreviewProps {
    layout: ISeatLayout | null
}

const seatTypeStyles: Record<ESeatType, string> = {
    [ESeatType.STANDARD]: 'border-slate-300 bg-slate-100 text-slate-700',
    [ESeatType.VIP]: 'border-amber-300 bg-amber-100 text-amber-700',
    [ESeatType.BED]: 'border-emerald-300 bg-emerald-100 text-emerald-700',
}

export const SeatLayoutPreview = ({ layout }: SeatLayoutPreviewProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.buses' })
    const [activeFloor, setActiveFloor] = useState(1)

    const floorCount = Math.max(layout?.numberFloors ?? 1, 1)

    const seatsByPosition = useMemo(() => {
        if (!layout?.seats) {
            return new Map<string, NonNullable<ISeatLayout['seats']>[number]>()
        }

        return new Map(layout.seats.map((seat) => [`${seat.floor}-${seat.row}-${seat.col}`, seat]))
    }, [layout])

    const visibleFloor = Math.min(activeFloor, floorCount)
    const rows = layout?.numberRows ?? 0
    const columns = layout?.numberCols ?? 0
    const displayDriverRow = visibleFloor === 1
    const startRow = visibleFloor === 1 ? 2 : 1
    const visualRows = visibleFloor === 1 ? rows - 1 : rows

    if (!layout) {
        return (
            <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                {t('form.seat_layout_preview_empty')}
            </div>
        )
    }

    return (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h4 className="text-sm font-semibold text-foreground">{layout.name || layout.seatLayoutId}</h4>
                    <p className="text-xs text-muted-foreground">
                        {t('form.seat_layout_preview_meta', {
                            rows: layout.numberRows,
                            columns: layout.numberCols,
                            floors: floorCount,
                            seats: layout.seats?.length ?? 0,
                        })}
                    </p>
                </div>

                {floorCount > 1 ? (
                    <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                        {Array.from({ length: floorCount }, (_, index) => {
                            const floor = index + 1
                            return (
                                <button
                                    key={floor}
                                    type="button"
                                    onClick={() => setActiveFloor(floor)}
                                    className={cn(
                                        'rounded px-2 py-1 text-xs font-medium transition-colors',
                                        visibleFloor === floor
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-background hover:text-foreground',
                                    )}
                                >
                                    {t('form.floor_tab', { floor })}
                                </button>
                            )
                        })}
                    </div>
                ) : null}
            </div>

            {rows < 1 || columns < 1 ? (
                <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                    {t('form.seat_layout_preview_invalid')}
                </div>
            ) : (
                <div className="space-y-2">
                    {displayDriverRow ? (
                        <div
                            className="grid gap-2"
                            style={{ gridTemplateColumns: `repeat(${Math.min(columns, 8)}, minmax(2.75rem, 1fr))` }}
                        >
                            {Array.from({ length: columns }, (_, index) => {
                                const col = index + 1
                                const seat = seatsByPosition.get(`${visibleFloor}-1-${col}`)
                                const isDriverCell = col === 1

                                return (
                                    <div
                                        key={`driver-${visibleFloor}-${col}`}
                                        className={cn(
                                            'rounded-md border border-dashed p-1',
                                            isDriverCell
                                                ? 'border-amber-300 bg-amber-50/50'
                                                : 'border-border/30 bg-muted/20 opacity-50',
                                        )}
                                    >
                                        {seat ? (
                                            <div
                                                className={cn(
                                                    'flex min-h-12 items-center justify-center rounded-md border px-2 py-2 text-sm font-medium',
                                                    isDriverCell
                                                        ? 'border-yellow-300 bg-yellow-100'
                                                        : seatTypeStyles[seat.seatType],
                                                )}
                                            >
                                                {isDriverCell ? (
                                                    <div className="flex items-center gap-1">
                                                        <Icon iconNode={steeringWheel} className="h-4 w-4" />
                                                        <span>{t('form.driver_seat')}</span>
                                                    </div>
                                                ) : (
                                                    <SeatTypeIcon seatType={seat.seatType} className="h-5 w-5" />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex min-h-12 items-center justify-center rounded-md text-xs text-muted-foreground">
                                                {isDriverCell ? (
                                                    <Icon iconNode={steeringWheel} className="h-4 w-4" />
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ) : null}

                    <div
                        className="grid gap-2"
                        style={{ gridTemplateColumns: `repeat(${Math.min(columns, 8)}, minmax(2.75rem, 1fr))` }}
                    >
                        {Array.from({ length: Math.max(visualRows, 0) * columns }, (_, index) => {
                            const row = Math.floor(index / columns) + startRow
                            const col = (index % columns) + 1
                            const seat = seatsByPosition.get(`${visibleFloor}-${row}-${col}`)

                            return (
                                <div
                                    key={`${visibleFloor}-${row}-${col}`}
                                    className="rounded-md border border-dashed border-border/70 bg-muted/20 p-1"
                                >
                                    {seat ? (
                                        <div
                                            className={cn(
                                                'flex min-h-14 flex-col rounded border px-2 py-1.5',
                                                seatTypeStyles[seat.seatType],
                                            )}
                                        >
                                            <span className="text-[10px] font-medium opacity-80">
                                                {t(`seat_types.${seat.seatType}`)}
                                            </span>
                                            <div className="flex flex-1 items-center justify-center">
                                                <SeatTypeIcon seatType={seat.seatType} className="h-6 w-6" />
                                            </div>
                                            <span className="text-center text-xs font-semibold">{seat.seatCode}</span>
                                        </div>
                                    ) : (
                                        <div className="flex min-h-14 items-center justify-center rounded text-[10px] text-muted-foreground">
                                            {row}-{col}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
