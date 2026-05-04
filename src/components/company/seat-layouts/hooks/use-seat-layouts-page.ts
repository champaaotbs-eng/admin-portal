import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
    createSeatLayout,
    deleteSeatLayout,
    getAllSeatLayouts,
    getSeatLayoutById,
    updateSeatLayout,
} from 'services/company/seat-layout.service'
import { ESeatType } from 'types/seat-layout'
import type {
    ICreateSeat,
    ICreateSeatLayout,
    ISeat,
    ISeatLayout,
} from 'types/seat-layout'

const SEAT_LAYOUTS_QUERY_KEY = ['company-seat-layouts']

export interface SeatDraft {
    localId: string
    seatId?: string
    seatCode: string
    row: number
    col: number
    floor: number
    seatType: ESeatType
}

export type SeatLayoutRecord = ISeatLayout
export type SeatLayoutSubmitPayload = ICreateSeatLayout

const readRows = <T,>(payload: unknown): T[] => {
    if (Array.isArray(payload)) {
        return payload
    }

    if (!payload || typeof payload !== 'object') {
        return []
    }

    const source = payload as Record<string, unknown>

    if (Array.isArray(source.result)) {
        return source.result as T[]
    }

    if (Array.isArray(source.data)) {
        return source.data as T[]
    }

    if (source.data && typeof source.data === 'object') {
        const nested = source.data as Record<string, unknown>

        if (Array.isArray(nested.result)) {
            return nested.result as T[]
        }

        if (Array.isArray(nested.data)) {
            return nested.data as T[]
        }
    }

    return []
}

const readOne = <T,>(payload: unknown): T | null => {
    if (!payload || typeof payload !== 'object') {
        return null
    }

    const source = payload as Record<string, unknown>

    if (source.data && typeof source.data === 'object') {
        const nested = source.data as Record<string, unknown>

        if (nested.result && typeof nested.result === 'object') {
            return nested.result as T
        }

        return source.data as T
    }

    if (source.result && typeof source.result === 'object') {
        return source.result as T
    }

    return payload as T
}

const parseNumber = (value: unknown, fallback = 0): number => {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) {
        return parsed
    }

    return fallback
}

const parseText = (value: unknown): string => {
    if (typeof value === 'string') {
        return value
    }

    if (typeof value === 'number') {
        return String(value)
    }

    return ''
}

const parseSeatType = (value: unknown): ESeatType => {
    const raw = parseText(value).toUpperCase()

    if (raw === ESeatType.VIP) {
        return ESeatType.VIP
    }

    if (raw === ESeatType.BED || raw === 'SLEEPER') {
        return ESeatType.BED
    }

    return ESeatType.STANDARD
}

const mapSeat = (payload: unknown, layoutId: string): ISeat | null => {
    if (!payload || typeof payload !== 'object') {
        return null
    }

    const source = payload as Record<string, unknown>

    const seatId = parseText(source.seatId ?? source.seat_id ?? source.id)
    const seatCode = parseText(source.seatCode ?? source.seat_code)
    const row = parseNumber(source.row, 0)
    const col = parseNumber(source.col ?? source.column, 0)
    const floor = parseNumber(source.floor, 1)

    if (row < 1 || col < 1 || seatCode.trim().length === 0) {
        return null
    }

    return {
        seatId,
        layoutId,
        seatCode,
        row,
        col,
        floor: floor > 0 ? floor : 1,
        seatType: parseSeatType(source.seatType ?? source.seat_type),
    }
}

const mapLayout = (payload: unknown): ISeatLayout | null => {
    if (!payload || typeof payload !== 'object') {
        return null
    }

    const source = payload as Record<string, unknown>

    const seatLayoutId = parseText(source.seatLayoutId ?? source.seat_layout_id ?? source.id)

    if (!seatLayoutId) {
        return null
    }

    const seats = readRows<unknown>(source.seats).map((seat) => mapSeat(seat, seatLayoutId)).filter((seat): seat is ISeat => Boolean(seat))

    return {
        seatLayoutId,
        busCompanyId: parseText(
            source.busCompanyId
            ?? source.bus_company_id
            ?? source.companyId
            ?? source.company_id,
        ),
        name: parseText(source.name),
        numberRows: parseNumber(source.numberRows ?? source.number_rows ?? source.rows, 0),
        numberCols: parseNumber(source.numberCols ?? source.number_cols ?? source.columns, 0),
        numberFloors: parseNumber(source.numberFloors ?? source.number_floors ?? source.floors, 1),
        createdAt: parseText(source.createdAt ?? source.created_at) as unknown as Date,
        updatedAt: parseText(source.updatedAt ?? source.updated_at) as unknown as Date,
        seats,
    } as ISeatLayout
}

const normalizeSeatLayoutList = (payload: unknown): ISeatLayout[] => {
    return readRows<unknown>(payload)
        .map((layout) => mapLayout(layout))
        .filter((layout): layout is ISeatLayout => Boolean(layout))
}

const normalizeSeatLayoutDetail = (payload: unknown): ISeatLayout | null => {
    const detail = readOne<unknown>(payload)

    if (!detail) {
        return null
    }

    return mapLayout(detail)
}

const resolveErrorMessage = (error: unknown, t: (key: string) => string): string => {
    const source = error as {
        localizedMessage?: string
        message?: string
        response?: { data?: { message?: string } }
    }

    return source.localizedMessage
        ?? source.message
        ?? source.response?.data?.message
        ?? t('errors.internal_server_error')
}

const validateSeatLayout = (payload: ICreateSeatLayout): string | null => {
    if (!payload.busCompanyId || payload.busCompanyId.trim().length === 0) {
        return 'errors.company_required'
    }

    if (!payload.name || payload.name.trim().length === 0) {
        return 'errors.layout_name_required'
    }

    if (payload.numberRows < 1 || payload.numberCols < 1) {
        return 'errors.invalid_layout_dimensions'
    }

    const numberFloors = payload.numberFloors ?? 1

    // Validate row 1 seats based on number of floors
    const row1Seats = (payload.seats ?? []).filter((seat) => seat.row === 1)

    if (numberFloors > 2) {
        // For buses with 3+ floors, row 1 should be completely empty (reserved for driver)
        if (row1Seats.length > 0) {
            return 'errors.row_1_must_be_empty_multi_floor'
        }
    } else {
        // For 1-2 floor buses, row 1 should only have a driver seat at col 1
        const nonDriverRow1Seats = row1Seats.filter((seat) => seat.col !== 1)
        if (nonDriverRow1Seats.length > 0) {
            return 'errors.row_1_only_driver_seat'
        }
    }

    return null
}

const toApiPayload = (payload: ICreateSeatLayout, busCompanyId: string): ICreateSeatLayout => {
    const numberFloors = typeof payload.numberFloors === 'number' && payload.numberFloors >= 1
        ? payload.numberFloors
        : 1

    // Filter and sort seats, excluding row 1 for multi-floor buses
    const filteredSeats = (payload.seats ?? [])
        .filter((seat) => {
            // For 3+ floor buses, remove all row 1 seats (no passenger seats on row 1)
            if (numberFloors > 2 && seat.row === 1) {
                return false
            }
            return true
        })
        .map((seat) => ({
            seatCode: seat.seatCode.trim(),
            row: seat.row,
            col: seat.col,
            floor: seat.floor,
            seatType: seat.seatType,
        }))
        .sort((left, right) => {
            if (left.row !== right.row) {
                return left.row - right.row
            }

            return left.col - right.col
        })

    return {
        busCompanyId: busCompanyId.trim(),
        name: payload.name.trim(),
        numberRows: payload.numberRows,
        numberCols: payload.numberCols,
        numberFloors: numberFloors > 1 ? numberFloors : undefined,
        seats: filteredSeats,
    }
}

interface UseSeatLayoutsPageOptions {
    busCompanyId: string
    editingLayoutId: string | null
    isDetailEnabled: boolean
}

export const useSeatLayoutsPage = ({ busCompanyId, editingLayoutId, isDetailEnabled }: UseSeatLayoutsPageOptions) => {
    const queryClient = useQueryClient()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.seat_layouts' })
    const { t: tRoot } = useTranslation()

    const seatLayoutsQuery = useQuery({
        queryKey: SEAT_LAYOUTS_QUERY_KEY,
        queryFn: () => getAllSeatLayouts({ page: 1, limit: 500 }),
        select: (response) => normalizeSeatLayoutList(response.data ?? response),
    })

    const seatLayoutDetailQuery = useQuery({
        queryKey: [...SEAT_LAYOUTS_QUERY_KEY, 'detail', editingLayoutId],
        queryFn: () => getSeatLayoutById(editingLayoutId ?? ''),
        enabled: Boolean(isDetailEnabled && editingLayoutId),
        select: (response) => normalizeSeatLayoutDetail(response.data ?? response),
    })

    const createMutation = useMutation({
        mutationFn: (payload: ICreateSeatLayout) => createSeatLayout(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: SEAT_LAYOUTS_QUERY_KEY })
            toast.success(t('messages.create_success'))
        },
        onError: (error) => {
            toast.error(resolveErrorMessage(error, tRoot))
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ seatLayoutId, payload }: { seatLayoutId: string; payload: ICreateSeatLayout }) =>
            updateSeatLayout(seatLayoutId, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: SEAT_LAYOUTS_QUERY_KEY })
            toast.success(t('messages.update_success'))
        },
        onError: (error) => {
            toast.error(resolveErrorMessage(error, tRoot))
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (seatLayoutId: string) => deleteSeatLayout(seatLayoutId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: SEAT_LAYOUTS_QUERY_KEY })
            toast.success(t('messages.delete_success'))
        },
        onError: (error) => {
            toast.error(resolveErrorMessage(error, tRoot))
        },
    })

    const resolveCompanyId = (seatLayoutId: string | null) => {
        if (busCompanyId) {
            return busCompanyId
        }

        if (!seatLayoutId) {
            return ''
        }

        const fallbackFromDetail = seatLayoutDetailQuery.data?.busCompanyId
        if (fallbackFromDetail) {
            return fallbackFromDetail
        }

        const fallbackFromList = seatLayoutsQuery.data?.find((layout) => layout.seatLayoutId === seatLayoutId)?.busCompanyId
        return fallbackFromList ?? ''
    }

    const handleSaveLayout = async (payload: ICreateSeatLayout, seatLayoutId: string | null) => {
        const resolvedCompanyId = resolveCompanyId(seatLayoutId)

        // Ensure busCompanyId is set in payload for validation
        const payloadWithCompany: ICreateSeatLayout = {
            ...payload,
            busCompanyId: payload.busCompanyId || resolvedCompanyId,
        }

        // Validate seat layout
        const validationError = validateSeatLayout(payloadWithCompany)
        if (validationError) {
            toast.error(t(validationError))
            return
        }

        const requestPayload = toApiPayload(payloadWithCompany, resolvedCompanyId)

        if (seatLayoutId) {
            await updateMutation.mutateAsync({
                seatLayoutId,
                payload: requestPayload,
            })
            return
        }

        await createMutation.mutateAsync(requestPayload)
    }

    const handleDeleteLayout = async (layout: ISeatLayout) => {
        const shouldDelete = window.confirm(t('messages.confirm_delete', { name: layout.name || layout.seatLayoutId }))

        if (!shouldDelete) {
            return
        }

        await deleteMutation.mutateAsync(layout.seatLayoutId)
    }

    return {
        layouts: seatLayoutsQuery.data ?? [],
        layoutDetail: seatLayoutDetailQuery.data,
        isLoading: seatLayoutsQuery.isLoading,
        isDetailLoading: seatLayoutDetailQuery.isLoading,
        isSubmitting: createMutation.isPending || updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        handleSaveLayout,
        handleDeleteLayout,
    }
}
