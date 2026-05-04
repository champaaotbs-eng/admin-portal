import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createBus, updateBus } from 'services/company/bus.service'
import { useAuthStore } from '@/store/auth.store'
import type { EBusType, ICreateBus, IUpdateBus } from 'types/bus'
import type { VehicleFormData } from '../validation-schema'

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
    onSuccess?: () => void
}

export const useBusForm = ({ busId, onSuccess }: UseBusFormProps) => {
    const queryClient = useQueryClient()
    const { admin } = useAuthStore()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.buses' })
    const { t: tRoot } = useTranslation()

    const createMutation = useMutation({
        mutationFn: (payload: ICreateBus) => createBus(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: BUSES_QUERY_KEY })
            toast.success(t('messages.create_success'))
            onSuccess?.()
        },
        onError: (error) => {
            toast.error(resolveErrorMessage(error, tRoot))
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ payload }: { payload: IUpdateBus }) =>
            updateBus(busId!, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: BUSES_QUERY_KEY })
            toast.success(t('messages.update_success'))
            onSuccess?.()
        },
        onError: (error) => {
            toast.error(resolveErrorMessage(error, tRoot))
        },
    })

    const handleSubmit = async (data: VehicleFormData) => {
        const payload = {
            companyId: admin?.busCompanyId || undefined,
            busCode: data.code.trim(),
            busName: data.name.trim(),
            licensePlate: data.plate.trim(),
            busType: data.type as EBusType,
            seatLayoutId: data.seatLayoutId.trim(),
            description: (data.description ?? '').trim(),
        } satisfies ICreateBus

        if (!busId && !payload.companyId) {
            toast.error(tRoot('errors.internal_server_error'))
            return
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
