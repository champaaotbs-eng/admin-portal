import { useEffect, useMemo, useState } from 'react'
import type { FieldErrors } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SeatLayoutEditor } from 'components/company/seat-layouts/components/seat-layout-editor'
import { ESeatType } from 'types/seat-layout'
import type { ISeatLayoutFormValue, ISeatUpsertPayload } from 'types/seat-layout'

interface BusSeatLayoutBuilderProps {
    value: ISeatLayoutFormValue
    onChange: (value: ISeatLayoutFormValue) => void
    isDisabled?: boolean
    errorMessage?: string
    errors?: FieldErrors<ISeatLayoutFormValue>
}

interface ISeatDraft {
    localId: string
    seatId?: string
    seatCode: string
    row: number
    col: number
    floor: number
    seatType: ESeatType
    price: number
}

const createLocalSeatId = () => `local-seat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const toSeatDraft = (seat: ISeatUpsertPayload & { localId?: string }, index: number): ISeatDraft => ({
    localId: seat.localId || seat.seatId || `${seat.row}-${seat.col}-${index + 1}`,
    seatId: seat.seatId,
    seatCode: seat.seatCode,
    row: seat.row,
    col: seat.col,
    floor: seat.floor,
    seatType: seat.seatType,
    price: seat.price,
})

const seatTypeOptions = [ESeatType.STANDARD, ESeatType.VIP, ESeatType.BED] as const

export const BusSeatLayoutBuilder = ({
    value,
    onChange,
    isDisabled = false,
    errorMessage,
    errors,
}: BusSeatLayoutBuilderProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.seat_layouts' })
    const [selectedSeatLocalId, setSelectedSeatLocalId] = useState<string | null>(null)
    const [seatConfigError, setSeatConfigError] = useState<string | null>(null)

    const rows = Number(value.rows || 0)
    const columns = Number(value.columns || 0)

    const seats = useMemo(() => value.seats.map((seat, index) => toSeatDraft(seat, index)), [value.seats])

    const selectedSeat = useMemo(() => {
        if (!selectedSeatLocalId) {
            return null
        }

        return seats.find((seat) => seat.localId === selectedSeatLocalId) ?? null
    }, [selectedSeatLocalId, seats])

    const selectedSeatError = errorMessage || seatConfigError

    useEffect(() => {
        if (seats.length === 0) {
            setSelectedSeatLocalId(null)
            return
        }

        if (!selectedSeatLocalId || !seats.some((seat) => seat.localId === selectedSeatLocalId)) {
            setSelectedSeatLocalId(seats[0].localId)
        }
    }, [seats, selectedSeatLocalId])

    useEffect(() => {
        if (selectedSeat) {
            setSeatConfigError(null)
        }
    }, [selectedSeat])

    const updateValue = (nextValue: Partial<ISeatLayoutFormValue>) => {
        onChange({
            ...value,
            ...nextValue,
        })
    }

    const updateSeats = (nextSeats: ISeatDraft[]) => {
        onChange({
            ...value,
            seats: nextSeats,
        })
    }

    const handleCreateSeat = (row: number, col: number, seatType: ESeatType) => {
        if (isDisabled) {
            return
        }

        const occupiedSeat = seats.find((seat) => seat.row === row && seat.col === col)

        if (occupiedSeat) {
            setSelectedSeatLocalId(occupiedSeat.localId)
            return
        }

        const nextSeat: ISeatDraft = {
            localId: createLocalSeatId(),
            seatCode: `S${seats.length + 1}`,
            row,
            col,
            floor: 1,
            seatType,
            price: 0,
        }

        setSelectedSeatLocalId(nextSeat.localId)
        updateSeats([...seats, nextSeat])
    }

    const handleMoveSeat = (localId: string, row: number, col: number) => {
        if (isDisabled) {
            return
        }

        const sourceSeat = seats.find((seat) => seat.localId === localId)

        if (!sourceSeat) {
            return
        }

        if (sourceSeat.row === row && sourceSeat.col === col) {
            return
        }

        const targetSeat = seats.find((seat) => seat.row === row && seat.col === col)

        if (!targetSeat) {
            updateSeats(seats.map((seat) => {
                if (seat.localId === localId) {
                    return { ...seat, row, col }
                }

                return seat
            }))
            return
        }

        if (targetSeat.localId === localId) {
            return
        }

        updateSeats(seats.map((seat) => {
            if (seat.localId === sourceSeat.localId) {
                return { ...seat, row: targetSeat.row, col: targetSeat.col }
            }

            if (seat.localId === targetSeat.localId) {
                return { ...seat, row: sourceSeat.row, col: sourceSeat.col }
            }

            return seat
        }))
    }

    const handleRemoveSeat = (localId: string) => {
        if (isDisabled) {
            return
        }

        const nextSeats = seats.filter((seat) => seat.localId !== localId)
        updateSeats(nextSeats)

        if (selectedSeatLocalId === localId) {
            setSelectedSeatLocalId(nextSeats[0]?.localId ?? null)
        }
    }

    const handleApplySeatConfig = () => {
        if (!selectedSeat) {
            return
        }

        const nextSeatCode = selectedSeat.seatCode.trim()
        if (!nextSeatCode) {
            setSeatConfigError(t('errors.seat_code_required'))
            return
        }

        const duplicateSeat = seats.some((seat) => seat.localId !== selectedSeat.localId && seat.seatCode.trim().toUpperCase() === nextSeatCode.toUpperCase())

        if (duplicateSeat) {
            setSeatConfigError(t('errors.seat_code_duplicate'))
            return
        }

        updateSeats(seats.map((seat) => {
            if (seat.localId !== selectedSeat.localId) {
                return seat
            }

            return {
                ...seat,
                seatCode: nextSeatCode,
                floor: selectedSeat.floor,
                seatType: selectedSeat.seatType,
                price: selectedSeat.price,
            }
        }))

        setSeatConfigError(null)
    }

    const hasGridError = rows < 1 || columns < 1

    return (
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                <Input
                    label={t('form.name')}
                    value={value.name}
                    onChange={(event) => updateValue({ name: event.target.value })}
                    placeholder={t('form.name_placeholder')}
                    disabled={isDisabled}
                    error={errors?.name?.message}
                />
                <Input
                    label={t('form.rows')}
                    type="number"
                    min={1}
                    value={value.rows}
                    onChange={(event) => updateValue({ rows: event.target.value })}
                    disabled={isDisabled}
                    error={errors?.rows?.message}
                />
                <Input
                    label={t('form.columns')}
                    type="number"
                    min={1}
                    value={value.columns}
                    onChange={(event) => updateValue({ columns: event.target.value })}
                    disabled={isDisabled}
                    error={errors?.columns?.message}
                />
            </div>

            {hasGridError ? (
                <p className="text-sm text-destructive">{t('editor.invalid_grid')}</p>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_10rem]">
                <div className="overflow-x-auto">
                    <SeatLayoutEditor
                        rows={rows}
                        columns={columns}
                        floors={1}
                        activeFloor={1}
                        seats={seats}
                        selectedSeatLocalId={selectedSeatLocalId}
                        isDisabled={isDisabled}
                        onSelectSeat={setSelectedSeatLocalId}
                        onMoveSeat={handleMoveSeat}
                        onCreateSeat={handleCreateSeat}
                        onRemoveSeat={handleRemoveSeat}
                    />
                </div>

                <div className="rounded-md border border-border bg-background p-3 h-fit lg:sticky lg:top-4">
                    <h3 className="text-sm font-semibold">{t('seat_config.title')}</h3>
                    {!selectedSeat ? (
                        <p className="mt-3 text-sm text-muted-foreground">{t('seat_config.empty')}</p>
                    ) : (
                        <div className="mt-3 space-y-3">
                            <Input
                                label={t('seat_config.seat_code')}
                                value={selectedSeat.seatCode}
                                onChange={(event) => {
                                    const nextSeatCode = event.target.value
                                    updateSeats(seats.map((seat) => (
                                        seat.localId === selectedSeat.localId
                                            ? { ...seat, seatCode: nextSeatCode }
                                            : seat
                                    )))
                                }}
                                disabled={isDisabled}
                                error={selectedSeatError ?? undefined}
                            />

                            <div>
                                <label className="mb-1 block text-sm font-medium">{t('seat_config.seat_type')}</label>
                                <select
                                    value={selectedSeat.seatType}
                                    onChange={(event) => {
                                        const nextSeatType = event.target.value as ESeatType
                                        updateSeats(seats.map((seat) => (
                                            seat.localId === selectedSeat.localId
                                                ? { ...seat, seatType: nextSeatType }
                                                : seat
                                        )))
                                    }}
                                    disabled={isDisabled}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {seatTypeOptions.map((seatType) => (
                                        <option key={seatType} value={seatType}>{t(`seat_types.${seatType}`)}</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label={t('seat_config.floor')}
                                type="number"
                                min={1}
                                value={String(selectedSeat.floor)}
                                onChange={(event) => {
                                    const nextFloor = Number(event.target.value)
                                    updateSeats(seats.map((seat) => (
                                        seat.localId === selectedSeat.localId
                                            ? { ...seat, floor: Number.isFinite(nextFloor) && nextFloor >= 1 ? nextFloor : 1 }
                                            : seat
                                    )))
                                }}
                                disabled={isDisabled}
                            />

                            <Input
                                label={t('seat_config.price')}
                                type="number"
                                min={0}
                                value={String(selectedSeat.price)}
                                onChange={(event) => {
                                    const nextPrice = Number(event.target.value)
                                    updateSeats(seats.map((seat) => (
                                        seat.localId === selectedSeat.localId
                                            ? { ...seat, price: Number.isFinite(nextPrice) && nextPrice >= 0 ? nextPrice : 0 }
                                            : seat
                                    )))
                                }}
                                disabled={isDisabled}
                            />

                            <Button type="button" variant="outline" className="w-full" onClick={handleApplySeatConfig} disabled={isDisabled}>
                                {t('seat_config.apply')}
                            </Button>

                            <Button type="button" variant="destructive" className="w-full" onClick={() => handleRemoveSeat(selectedSeat.localId)} disabled={isDisabled}>
                                <Trash2 className="h-4 w-4" />
                                {t('seat_config.remove')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <p className="text-xs text-muted-foreground">
                {t('editor.summary', { count: seats.length })}
            </p>
        </div>
    )
}