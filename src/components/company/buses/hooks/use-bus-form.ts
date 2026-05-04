import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { createBus, updateBus } from 'services/company/bus.service'
import type { IBus, EBusType } from 'types/bus'
import type { VehicleFormData } from '../validation-schema'
import type { ISeatLayoutUpsertPayload } from 'types/seat-layout'

const BUSES_QUERY_KEY = ['company-buses']

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

interface UseBusFormProps {
    busId?: string
}

export const useBusForm = ({ busId }: UseBusFormProps) => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.buses' })
    const { t: tRoot } = useTranslation()

    const toSeatLayoutPayload = (seatLayout: VehicleFormData['seatLayout']): ISeatLayoutUpsertPayload => ({
        name: seatLayout.name.trim(),
        rows: Number(seatLayout.rows),
        columns: Number(seatLayout.columns),
        seats: seatLayout.seats
            .map((seat) => ({
                seatId: seat.seatId,
                seatCode: seat.seatCode.trim(),
                row: seat.row,
                col: seat.col,
                floor: seat.floor,
                seatType: seat.seatType,
                price: seat.price,
            }))
            .toSorted((left, right) => {
                if (left.row !== right.row) {
                    return left.row - right.row
                }

                return left.col - right.col
            }),
    })

    const createMutation = useMutation({
        mutationFn: (payload: Partial<Omit<IBus, 'id'>>) => createBus(payload as Omit<IBus, 'id'>),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: BUSES_QUERY_KEY })
            toast.success(t('messages.create_success'))
            navigate({ to: '/company/fleet' })
        },
        onError: (error) => {
            toast.error(resolveErrorMessage(error, tRoot))
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ payload }: { payload: Partial<Omit<IBus, 'id'>> }) =>
            updateBus(busId!, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: BUSES_QUERY_KEY })
            toast.success(t('messages.update_success'))
            navigate({ to: '/company/fleet' })
        },
        onError: (error) => {
            toast.error(resolveErrorMessage(error, tRoot))
        },
    })

    const handleSubmit = async (data: VehicleFormData) => {
        const payload = {
            busCode: data.code.trim(),
            busName: data.name.trim(),
            licensePlate: data.plate.trim(),
            busType: data.type as EBusType,
            seatLayout: toSeatLayoutPayload(data.seatLayout),
            description: (data.description ?? '').trim(),
        }

        if (busId) {
            await updateMutation.mutateAsync({ payload })
            return
        }

        await createMutation.mutateAsync(payload)
    }

    return {
        handleSubmit,
        isSubmitting: createMutation.isPending || updateMutation.isPending,
    }
}
