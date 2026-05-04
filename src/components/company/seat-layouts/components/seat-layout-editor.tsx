import { useMemo } from 'react'
import { Armchair, GripVertical, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'
import { ESeatType } from 'types/seat-layout'
import type { SeatDraft } from '../hooks/use-seat-layouts-page'
import { Icon } from "lucide-react";
import { steeringWheel } from "@lucide/lab";

export default function App() {
    return <Icon iconNode={steeringWheel} />;
}
interface ISeatLayoutEditorProps {
    rows: number
    columns: number
    floors: number
    activeFloor?: number
    seats: SeatDraft[]
    selectedSeatLocalId: string | null
    isDisabled?: boolean
    onSelectSeat: (localId: string) => void
    onMoveSeat: (localId: string, row: number, col: number) => void
    onCreateSeat: (row: number, col: number, seatType: ESeatType) => void
    onRemoveSeat: (localId: string) => void
}

interface IPaletteDragPayload {
    source: 'palette'
    seatType: ESeatType
}

interface IGridDragPayload {
    source: 'grid'
    localId: string
}

type TDragPayload = IPaletteDragPayload | IGridDragPayload

const seatTypeColors: Record<ESeatType, string> = {
    [ESeatType.STANDARD]: 'bg-slate-100 text-slate-800 border-slate-300',
    [ESeatType.VIP]: 'bg-amber-100 text-amber-800 border-amber-300',
    [ESeatType.BED]: 'bg-emerald-100 text-emerald-800 border-emerald-300',
}

const paletteSeatTypes: ESeatType[] = [ESeatType.STANDARD, ESeatType.VIP, ESeatType.BED]

const isSeatType = (value: unknown): value is ESeatType => {
    return value === ESeatType.STANDARD || value === ESeatType.VIP || value === ESeatType.BED
}

const readDragPayload = (event: React.DragEvent): TDragPayload | null => {
    const rawPayload = event.dataTransfer.getData('application/json')

    if (!rawPayload) {
        return null
    }

    try {
        const payload = JSON.parse(rawPayload) as { source?: string; localId?: string; seatType?: string }

        if (payload.source === 'grid' && typeof payload.localId === 'string' && payload.localId.length > 0) {
            return {
                source: 'grid',
                localId: payload.localId,
            }
        }

        if (payload.source === 'palette' && isSeatType(payload.seatType)) {
            return {
                source: 'palette',
                seatType: payload.seatType,
            }
        }
    } catch {
        return null
    }

    return null
}

const writeDragPayload = (event: React.DragEvent, payload: TDragPayload) => {
    event.dataTransfer.setData('application/json', JSON.stringify(payload))
    event.dataTransfer.effectAllowed = 'move'
}

export const SeatLayoutEditor = ({
    rows,
    columns,
    floors,
    activeFloor,
    seats,
    selectedSeatLocalId,
    isDisabled = false,
    onSelectSeat,
    onMoveSeat,
    onCreateSeat,
    onRemoveSeat,
}: ISeatLayoutEditorProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.seat_layouts' })

    const isMultiFloor = floors > 2
    const activeFloorNum = typeof activeFloor === 'number' ? activeFloor : 1
    const canHaveDriverSeat = activeFloorNum === 1 && !isMultiFloor

    const seatsByPosition = useMemo(() => {
        return new Map(seats.map((seat) => [`${seat.row}-${seat.col}`, seat]))
    }, [seats])

    // We render a dedicated top row (row 1) visually for driver/reserved area
    // only when viewing the first floor. For other floors we skip the driver
    // strip completely.
    const displayDriverRow = useMemo(() => {
        if (activeFloorNum !== 1) return []
        return Array.from({ length: columns }, (_, idx) => ({ row: 1, col: idx + 1 }))
    }, [columns, activeFloorNum])

    // Ensure we render enough rows to display any existing seats even when
    // `rows` prop is out of sync. This avoids missing seats when `rows` is
    // lower than the highest row present in `seats`.
    const maxSeatRow = useMemo(() => {
        if (!seats || seats.length === 0) return 1
        return seats.reduce((m, s) => Math.max(m, s.row), 1)
    }, [seats])

    const effectiveRows = Math.max(rows, maxSeatRow)

    const bodyCells = useMemo(() => {
        if (effectiveRows < 2 || columns < 1) {
            return []
        }

        const visualRows = effectiveRows - 1 // visual rows shown below the driver row
        return Array.from({ length: visualRows * columns }, (_, index) => {
            const row = Math.floor(index / columns) + 2 // start from real row 2
            const col = (index % columns) + 1
            return { row, col }
        })
    }, [effectiveRows, columns])

    const handleCellDrop = (event: React.DragEvent, row: number, col: number) => {
        if (isDisabled) {
            return
        }

        // Prevent dropping on row 1 if it's not for driver seat
        if (row === 1) {
            // only allow driver seat interaction on floor 1 and when driver seat is permitted
            if (activeFloorNum !== 1) return
            if (col !== 1) return
            if (isMultiFloor) return
        }

        event.preventDefault()
        const payload = readDragPayload(event)

        if (!payload) {
            return
        }

        if (payload.source === 'palette') {
            onCreateSeat(row, col, payload.seatType)
            return
        }

        // Prevent moving seat to driver seat position
        if (row === 1 && col === 1) {
            return
        }

        onMoveSeat(payload.localId, row, col)
    }

    const handleSeatDragStart = (event: React.DragEvent, localId: string) => {
        if (isDisabled) {
            return
        }

        writeDragPayload(event, {
            source: 'grid',
            localId,
        })
    }

    const handlePaletteDragStart = (event: React.DragEvent, seatType: ESeatType) => {
        if (isDisabled) {
            return
        }

        writeDragPayload(event, {
            source: 'palette',
            seatType,
        })
    }

    if (rows < 1 || columns < 1) {
        return (
            <div className="rounded-md border border-dashed border-border p-5 text-sm text-muted-foreground">
                {t('editor.invalid_grid')}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="rounded-md border border-border bg-muted/20 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Armchair className="h-4 w-4" />
                    {t('editor.palette_title')}
                </div>
                <div className="flex flex-wrap gap-2">
                    {paletteSeatTypes.map((seatType) => (
                        <button
                            key={seatType}
                            type="button"
                            draggable={!isDisabled}
                            onDragStart={(event) => handlePaletteDragStart(event, seatType)}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium',
                                'transition-colors hover:bg-background',
                                seatTypeColors[seatType],
                                isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-grab active:cursor-grabbing',
                            )}
                        >
                            <GripVertical className="h-3.5 w-3.5" />
                            {t(`seat_types.${seatType}`)}
                        </button>
                    ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t('editor.drag_hint')}</p>
                {canHaveDriverSeat && (
                    <p className="mt-1 text-xs text-amber-600">{t('editor.driver_seat_hint')}</p>
                )}
                {isMultiFloor && (
                    <p className="mt-1 text-xs text-blue-600">{t('editor.row_1_reserved_hint')}</p>
                )}
            </div>

            {/* Driver / reserved top row (visual only) */}
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(columns, 8)}, minmax(3rem, 1fr))` }}>
                {displayDriverRow.map((cell) => {
                    const seat = seatsByPosition.get(`${cell.row}-${cell.col}`)

                    return (
                        <div
                            key={`driver-${cell.col}`}
                            onDrop={(event) => handleCellDrop(event, cell.row, cell.col)}
                            onDragOver={(event) => {
                                if (!isDisabled) {
                                    // only allow drop if driver seat allowed on col 1
                                    if (cell.col !== 1) return
                                    if (!canHaveDriverSeat) return
                                    event.preventDefault()
                                }
                            }}
                            className={cn('min-h-12 rounded-md border border-dashed border-border p-1 transition-colors bg-gray-100/50')}
                            aria-label={t('editor.grid_cell_aria', { row: cell.row, col: cell.col })}
                        >
                            {seat ? (
                                <div
                                    draggable={!isDisabled && !(seat.row === 1 && seat.col === 1)}
                                    onDragStart={(event) => {
                                        if (seat.row === 1 && seat.col === 1) {
                                            event.preventDefault()
                                            return
                                        }
                                        handleSeatDragStart(event, seat.localId)
                                    }}
                                    onClick={() => onSelectSeat(seat.localId)}
                                    className={cn(
                                        'relative flex h-full min-h-12 flex-col justify-center rounded-md border px-2 py-2 text-left',
                                        seat.row === 1 && seat.col === 1
                                            ? 'cursor-not-allowed bg-yellow-100 border-yellow-300'
                                            : cn('cursor-pointer', seatTypeColors[seat.seatType], isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-grab active:cursor-grabbing'),
                                        selectedSeatLocalId === seat.localId ? 'ring-2 ring-primary' : null,
                                    )}
                                >
                                    <div className="flex items-center gap-1 text-sm font-medium opacity-90 justify-center">
                                        {seat.row === 1 && seat.col === 1 ? (
                                            <>
                                                <Icon iconNode={steeringWheel} className='h-4 w-4' />
                                                <span className="ml-1">{t('editor.driver_seat')}</span>
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">{ }</span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full min-h-12 items-center justify-center rounded-md text-xs text-muted-foreground">
                                    {cell.col === 1 && canHaveDriverSeat ? (
                                        <Icon iconNode={steeringWheel} className='h-4 w-4' />
                                    ) : (
                                        <span className="text-[10px]">{ }</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Editable grid starting from real row 2 */}
            <div
                className="grid gap-2 min-h-64"
                style={{ gridTemplateColumns: `repeat(${Math.min(columns, 8)}, minmax(3rem, 1fr))` }}
            >
                {bodyCells.map((cell) => {
                    const seat = seatsByPosition.get(`${cell.row}-${cell.col}`)

                    return (
                        <div
                            key={`${cell.row}-${cell.col}`}
                            onDrop={(event) => handleCellDrop(event, cell.row, cell.col)}
                            onDragOver={(event) => {
                                if (!isDisabled) {
                                    event.preventDefault()
                                }
                            }}
                            className={cn('min-h-20 rounded-md border border-dashed border-border p-1 transition-colors', 'hover:bg-muted/30')}
                            aria-label={t('editor.grid_cell_aria', { row: cell.row, col: cell.col })}
                        >
                            {seat ? (
                                <div
                                    draggable={!isDisabled}
                                    onDragStart={(event) => handleSeatDragStart(event, seat.localId)}
                                    onClick={() => onSelectSeat(seat.localId)}
                                    className={cn(
                                        'relative flex h-full min-h-16 flex-col justify-end rounded-md border px-2 pb-2 pt-5 text-left',
                                        cn('cursor-pointer', seatTypeColors[seat.seatType], isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-grab active:cursor-grabbing'),
                                        selectedSeatLocalId === seat.localId ? 'ring-2 ring-primary' : null,
                                    )}
                                >
                                    <div className="absolute left-1.5 top-1.5 flex items-center gap-1 text-[10px] font-medium opacity-80">
                                        <GripVertical className="h-3 w-3" />
                                        <span>{t(`seat_types.${seat.seatType}`)}</span>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={isDisabled}
                                        onClick={(event) => {
                                            event.stopPropagation()
                                            onRemoveSeat(seat.localId)
                                        }}
                                        className="absolute right-1 top-1 rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-black/10 hover:text-foreground disabled:cursor-not-allowed"
                                        aria-label={t('editor.remove_seat_aria', { code: seat.seatCode })}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>

                                    <span className="text-xs font-semibold">{seat.seatCode}</span>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => onCreateSeat(cell.row, cell.col, ESeatType.STANDARD)}
                                    className={cn(
                                        'flex h-full min-h-16 w-full flex-col items-center justify-center rounded-md text-xs text-muted-foreground transition-colors',
                                        'hover:bg-muted/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50',
                                    )}
                                >
                                    <Plus className="h-4 w-4" />
                                    {t('editor.click_to_add')}
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
