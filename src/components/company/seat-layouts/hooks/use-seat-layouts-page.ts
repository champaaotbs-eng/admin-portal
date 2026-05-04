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
    ISeatLayout,
} from 'types/seat-layout'
import { useAuthStore } from 'store/auth.store'
import {
    normalizeSeatLayoutDetail,
    normalizeSeatLayoutList,
} from '../utils/normalize-seat-layout'

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
    editingLayoutId: string | null
    isDetailEnabled: boolean
    page: number
    pageSize: number
}

export const useSeatLayoutsPage = ({ editingLayoutId, isDetailEnabled, page, pageSize }: UseSeatLayoutsPageOptions) => {
    const queryClient = useQueryClient()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.seat_layouts' })
    const { t: tRoot } = useTranslation()

    const { admin } = useAuthStore()

    const seatLayoutsQuery = useQuery({
        queryKey: [...SEAT_LAYOUTS_QUERY_KEY, page, pageSize],
        queryFn: () => getAllSeatLayouts({ page, limit: pageSize }),
        select: (response) => ({
            items: normalizeSeatLayoutList(response.data ?? response),
            meta: response.data?.meta ?? response.meta ?? { page, limit: pageSize, totalItems: 0, totalPages: 1 },
        }),
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

    const handleSaveLayout = async (payload: ICreateSeatLayout, seatLayoutId: string | null) => {
        if (!admin?.busCompanyId) {
            toast.error(t('errors.company_required'))
            return
        }
        // Ensure busCompanyId is set in payload for validation
        const payloadWithCompany: ICreateSeatLayout = {
            ...payload,
            busCompanyId: admin?.busCompanyId,
        }

        // Validate seat layout
        const validationError = validateSeatLayout(payloadWithCompany)
        if (validationError) {
            toast.error(t(validationError))
            return
        }

        const requestPayload = toApiPayload(payloadWithCompany, admin?.busCompanyId)

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
        layouts: seatLayoutsQuery.data?.items ?? [],
        meta: seatLayoutsQuery.data?.meta ?? { page, limit: pageSize, totalItems: 0, totalPages: 1 },
        layoutDetail: seatLayoutDetailQuery.data,
        isLoading: seatLayoutsQuery.isLoading,
        isDetailLoading: seatLayoutDetailQuery.isLoading,
        isSubmitting: createMutation.isPending || updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        handleSaveLayout,
        handleDeleteLayout,
    }
}
