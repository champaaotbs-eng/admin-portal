import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/utils/cn'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ESeatType } from 'types/seat-layout'
import { useAuthStore } from '@/store/auth.store'
import type {
    SeatDraft,
    SeatLayoutRecord,
    SeatLayoutSubmitPayload,
} from '../hooks/use-seat-layouts-page'
import {
    seatConfigSchema,
    seatLayoutSchema,
} from '../validation-schema'
import type {
    TSeatConfigFormData,
    TSeatLayoutFormData,
} from '../validation-schema'
import { SeatLayoutEditor } from './seat-layout-editor'

interface ISeatLayoutFormProps {
    initialLayout?: SeatLayoutRecord | null
    isSubmitting?: boolean
    isDetailLoading?: boolean
    onSubmit: (payload: SeatLayoutSubmitPayload) => Promise<void> | void
    onCancel: () => void
}

let localSeatIdSeed = 0

const createLocalSeatId = () => {
    localSeatIdSeed += 1
    return `local-seat-${localSeatIdSeed}`
}

const getNextSeatCode = (seats: SeatDraft[]) => {
    const usedCodes = new Set(seats.map((seat) => seat.seatCode.trim().toUpperCase()))
    let counter = seats.length + 1

    while (usedCodes.has(`S${counter}`)) {
        counter += 1
    }

    return `S${counter}`
}

const hasDuplicateSeatCode = (seats: SeatDraft[]) => {
    const usedCodes = new Set<string>()

    for (const seat of seats) {
        const normalizedCode = seat.seatCode.trim().toUpperCase()

        if (!normalizedCode) {
            continue
        }

        if (usedCodes.has(normalizedCode)) {
            return true
        }

        usedCodes.add(normalizedCode)
    }

    return false
}

const defaultSeatConfig: TSeatConfigFormData = {
    seatCode: '',
    floor: '1',
    seatType: ESeatType.STANDARD,
}

export const SeatLayoutForm = ({
    initialLayout,
    isSubmitting = false,
    isDetailLoading = false,
    onSubmit,
    onCancel,
}: ISeatLayoutFormProps) => {
    const { admin } = useAuthStore()
    const busCompanyId = admin?.busCompanyId || ''
    const { t } = useTranslation('translation', { keyPrefix: 'pages.seat_layouts' })
    const { t: tCommon } = useTranslation()

    const seatLayoutValidationSchema = useMemo(() => seatLayoutSchema(t), [t])
    const seatConfigValidationSchema = useMemo(() => seatConfigSchema(t), [t])

    const layoutForm = useForm<TSeatLayoutFormData>({
        resolver: zodResolver(seatLayoutValidationSchema),
        defaultValues: {
            name: '',
            numberRows: '5',
            numberCols: '4',
            numberFloors: '1',
        },
        mode: 'onChange',
    })

    const seatConfigForm = useForm<TSeatConfigFormData>({
        resolver: zodResolver(seatConfigValidationSchema),
        defaultValues: defaultSeatConfig,
        mode: 'onChange',
    })

    const [seats, setSeats] = useState<SeatDraft[]>([])
    const [selectedSeatLocalId, setSelectedSeatLocalId] = useState<string | null>(null)
    const [activeFloor, setActiveFloor] = useState<number>(1)

    const watchedRows = Number(layoutForm.watch('numberRows') || '0')
    const watchedColumns = Number(layoutForm.watch('numberCols') || '0')
    const watchedFloors = Number(layoutForm.watch('numberFloors') || '1')

    const selectedSeat = useMemo(() => {
        if (!selectedSeatLocalId) {
            return null
        }

        return seats.find((seat) => seat.localId === selectedSeatLocalId) ?? null
    }, [selectedSeatLocalId, seats])

    useEffect(() => {
        const nextSeats: SeatDraft[] = (initialLayout?.seats ?? []).map((seat, index) => ({
            localId: 'localId' in seat ? (seat as any).localId : seat.seatId || `${seat.row}-${seat.col}-${index + 1}`,
            seatId: seat.seatId,
            seatCode: seat.seatCode || `S${index + 1}`,
            row: seat.row,
            col: seat.col,
            floor: seat.floor > 0 ? seat.floor : 1,
            seatType: seat.seatType,
        }))

        setSeats(nextSeats)
        setSelectedSeatLocalId(nextSeats[0]?.localId ?? null)

        layoutForm.reset({
            name: initialLayout?.name ?? '',
            numberRows: String(initialLayout?.numberRows ?? 5),
            numberCols: String(initialLayout?.numberCols ?? 4),
            numberFloors: String(initialLayout?.numberFloors ?? 1),
        })
        seatConfigForm.reset(defaultSeatConfig)
    }, [initialLayout, layoutForm, seatConfigForm])

    useEffect(() => {
        setActiveFloor((prev) => Math.min(prev, Math.max(1, watchedFloors)))
    }, [watchedFloors])

    useEffect(() => {
        if (!Number.isInteger(watchedRows) || !Number.isInteger(watchedColumns) || watchedRows < 1 || watchedColumns < 1) {
            return
        }

        setSeats((previousSeats) => {
            const nextSeats = previousSeats.filter((seat) => seat.row <= watchedRows && seat.col <= watchedColumns)

            if (nextSeats.length === previousSeats.length) {
                return previousSeats
            }

            return nextSeats
        })
    }, [watchedRows, watchedColumns])

    useEffect(() => {
        if (!Number.isInteger(watchedFloors) || watchedFloors < 1) {
            return
        }

        setSeats((previousSeats) => {
            const nextSeats = previousSeats.map((seat) => ({
                ...seat,
                floor: seat.floor > watchedFloors ? watchedFloors : seat.floor,
            }))

            return nextSeats
        })
    }, [watchedFloors])

    useEffect(() => {
        if (!selectedSeatLocalId) {
            return
        }

        const isSelectedSeatStillAvailable = seats.some((seat) => seat.localId === selectedSeatLocalId)

        if (!isSelectedSeatStillAvailable) {
            setSelectedSeatLocalId(seats[0]?.localId ?? null)
        }
    }, [selectedSeatLocalId, seats])

    useEffect(() => {
        if (!selectedSeat) {
            seatConfigForm.reset(defaultSeatConfig)
            return
        }

        seatConfigForm.reset({
            seatCode: selectedSeat.seatCode,
            floor: String(selectedSeat.floor),
            seatType: selectedSeat.seatType,
        })
    }, [selectedSeat, seatConfigForm])

    const handleCreateSeat = (row: number, col: number, seatType: ESeatType) => {
        setSeats((previousSeats) => {
            const occupiedSeat = previousSeats.find((seat) => seat.row === row && seat.col === col)

            if (occupiedSeat) {
                setSelectedSeatLocalId(occupiedSeat.localId)
                return previousSeats
            }

            const nextSeat: SeatDraft = {
                localId: createLocalSeatId(),
                seatCode: getNextSeatCode(previousSeats),
                row,
                col,
                floor: activeFloor,
                seatType,
            }

            setSelectedSeatLocalId(nextSeat.localId)
            return [...previousSeats, nextSeat]
        })
    }

    const handleMoveSeat = (localId: string, row: number, col: number) => {
        setSeats((previousSeats) => {
            const sourceSeat = previousSeats.find((seat) => seat.localId === localId)

            if (!sourceSeat) {
                return previousSeats
            }

            if (sourceSeat.row === row && sourceSeat.col === col) {
                return previousSeats
            }

            const targetSeat = previousSeats.find((seat) => seat.row === row && seat.col === col)

            if (!targetSeat) {
                return previousSeats.map((seat) => {
                    if (seat.localId === localId) {
                        return {
                            ...seat,
                            row,
                            col,
                        }
                    }

                    return seat
                })
            }

            if (targetSeat.localId === localId) {
                return previousSeats
            }

            return previousSeats.map((seat) => {
                if (seat.localId === sourceSeat.localId) {
                    return {
                        ...seat,
                        row: targetSeat.row,
                        col: targetSeat.col,
                    }
                }

                if (seat.localId === targetSeat.localId) {
                    return {
                        ...seat,
                        row: sourceSeat.row,
                        col: sourceSeat.col,
                    }
                }

                return seat
            })
        })

        setSelectedSeatLocalId(localId)
    }

    const handleRemoveSeat = (localId: string) => {
        setSeats((previousSeats) => previousSeats.filter((seat) => seat.localId !== localId))
    }

    const handleApplySeatConfig = seatConfigForm.handleSubmit((values) => {
        if (!selectedSeat) {
            return
        }

        const floorLimit = Math.max(watchedFloors, 1)
        const floorValue = Number(values.floor)

        if (!Number.isFinite(floorValue) || floorValue < 1 || floorValue > floorLimit) {
            seatConfigForm.setError('floor', { message: t('errors.floor_max', { max: floorLimit }) })
            return
        }

        const nextSeatCode = values.seatCode.trim()
        const hasDuplicateCode = seats.some((seat) => {
            if (seat.localId === selectedSeat.localId) {
                return false
            }

            return seat.seatCode.trim().toUpperCase() === nextSeatCode.toUpperCase()
        })

        if (hasDuplicateCode) {
            seatConfigForm.setError('seatCode', { message: t('errors.seat_code_duplicate') })
            return
        }

        setSeats((previousSeats) => previousSeats.map((seat) => {
            if (seat.localId !== selectedSeat.localId) {
                return seat
            }

            return {
                ...seat,
                seatCode: nextSeatCode,
                floor: floorValue,
                seatType: values.seatType,
            }
        }))
    })

    const handleSubmitLayout = layoutForm.handleSubmit(async (values) => {
        if (!busCompanyId || busCompanyId.trim().length === 0) {
            toast.error(t('errors.company_required'))
            return
        }
        console.log('Submitting layout with values:', values)
        if (seats.length === 0) {
            toast.error(t('errors.seats_required'))
            return
        }

        if (hasDuplicateSeatCode(seats)) {
            toast.error(t('errors.seat_code_duplicate'))
            return
        }

        const floorLimit = Math.max(Number(values.numberFloors || '1'), 1)
        const hasInvalidFloor = seats.some((seat) => seat.floor < 1 || seat.floor > floorLimit)

        if (hasInvalidFloor) {
            toast.error(t('errors.floor_max', { max: floorLimit }))
            return
        }

        await onSubmit({
            busCompanyId,
            name: values.name.trim(),
            numberRows: Number(values.numberRows),
            numberCols: Number(values.numberCols),
            numberFloors: Number(values.numberFloors || '1'),
            seats,
        })
    })

    return (
        <form onSubmit={handleSubmitLayout} className="space-y-4 overflow-y-auto">
            <div className="grid gap-3 sm:grid-cols-4">
                <Controller
                    name="name"
                    control={layoutForm.control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            label={t('form.name')}
                            placeholder={t('form.name_placeholder')}
                            error={layoutForm.formState.errors.name?.message}
                        />
                    )}
                />

                <Controller
                    name="numberRows"
                    control={layoutForm.control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            type="number"
                            min={1}
                            label={t('form.rows')}
                            placeholder="5"
                            error={layoutForm.formState.errors.numberRows?.message}
                        />
                    )}
                />

                <Controller
                    name="numberCols"
                    control={layoutForm.control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            type="number"
                            min={1}
                            label={t('form.columns')}
                            placeholder="4"
                            error={layoutForm.formState.errors.numberCols?.message}
                        />
                    )}
                />

                {/* Floor count is controlled via tabs below; hide numeric input from the form UI */}
            </div>

            {isDetailLoading ? (
                <p className="text-sm text-muted-foreground">{tCommon('common.loading')}</p>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <div>
                    <div className="mb-3 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.max(watchedFloors, 1) }, (_, i) => {
                                const floor = i + 1
                                return (
                                    <button
                                        key={`floor-tab-${floor}`}
                                        type="button"
                                        onClick={() => setActiveFloor(floor)}
                                        className={cn(
                                            'px-2 py-1 rounded-md text-sm',
                                            activeFloor === floor ? 'bg-primary text-white' : 'bg-card text-foreground',
                                        )}
                                        aria-pressed={activeFloor === floor}
                                        aria-label={t('form.floor_tab_aria', { floor })}
                                    >
                                        {t('form.floor_tab', { floor })}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const next = Math.max(1, watchedFloors) + 1
                                    layoutForm.setValue('numberFloors', String(next), { shouldDirty: true, shouldValidate: true })
                                }}
                                className="rounded-full px-3 py-1.5"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {t('form.add_floor')}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (watchedFloors <= 1) return
                                    const next = Math.max(1, watchedFloors) - 1
                                    layoutForm.setValue('numberFloors', String(next), { shouldDirty: true, shouldValidate: true })
                                }}
                                className="rounded-full px-3 py-1.5"
                            >
                                -
                            </Button>
                        </div>
                    </div>

                    <SeatLayoutEditor
                        rows={watchedRows}
                        columns={watchedColumns}
                        floors={watchedFloors}
                        activeFloor={activeFloor}
                        seats={seats.filter((s) => s.floor === activeFloor)}
                        selectedSeatLocalId={selectedSeatLocalId}
                        isDisabled={isSubmitting || isDetailLoading}
                        onSelectSeat={setSelectedSeatLocalId}
                        onMoveSeat={handleMoveSeat}
                        onCreateSeat={handleCreateSeat}
                        onRemoveSeat={handleRemoveSeat}
                    />
                </div>

                <div className="rounded-md border border-border bg-card p-3">
                    <h3 className="text-sm font-semibold">{t('seat_config.title')}</h3>

                    {!selectedSeat ? (
                        <p className="mt-3 text-sm text-muted-foreground">{t('seat_config.empty')}</p>
                    ) : (
                        <div className="mt-3 space-y-3">
                            <Controller
                                name="seatCode"
                                control={seatConfigForm.control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label={t('seat_config.seat_code')}
                                        placeholder="S1"
                                        error={seatConfigForm.formState.errors.seatCode?.message}
                                    />
                                )}
                            />

                            <div>
                                <label className="mb-1 block text-sm font-medium">{t('seat_config.seat_type')}</label>
                                <select
                                    {...seatConfigForm.register('seatType')}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value={ESeatType.STANDARD}>{t(`seat_types.${ESeatType.STANDARD}`)}</option>
                                    <option value={ESeatType.VIP}>{t(`seat_types.${ESeatType.VIP}`)}</option>
                                    <option value={ESeatType.BED}>{t(`seat_types.${ESeatType.BED}`)}</option>
                                </select>
                                {seatConfigForm.formState.errors.seatType ? (
                                    <p className="mt-1 text-xs text-destructive">{seatConfigForm.formState.errors.seatType.message}</p>
                                ) : null}
                            </div>

                            <Controller
                                name="floor"
                                control={seatConfigForm.control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="number"
                                        min={1}
                                        max={Math.max(watchedFloors, 1)}
                                        label={t('seat_config.floor')}
                                        placeholder="1"
                                        error={seatConfigForm.formState.errors.floor?.message}
                                    />
                                )}
                            />

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={handleApplySeatConfig}
                                disabled={isSubmitting || isDetailLoading}
                            >
                                {t('seat_config.apply')}
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                className="w-full"
                                disabled={isSubmitting || isDetailLoading}
                                onClick={() => {
                                    handleRemoveSeat(selectedSeat.localId)
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                                {t('seat_config.remove')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                    {t('editor.summary', { count: seats.length })}
                </p>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting || isDetailLoading}
                    >
                        {tCommon('common.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        loading={isSubmitting || isDetailLoading}
                    >
                        {tCommon('common.save')}
                    </Button>
                </div>
            </div>
        </form>
    )
}
