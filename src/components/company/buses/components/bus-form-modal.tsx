import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Dialog } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { getBusById } from 'services/company/bus.service'
import { VehicleForm } from './VehicleForm'
import { useBusForm } from '../hooks/use-bus-form'
import type { VehicleFormData } from '../validation-schema'
import { normalizeBusDetail } from '../utils/normalize-bus'

interface BusFormModalProps {
    open: boolean
    busId?: string | null
    onClose: () => void
}

const mapBusToFormValues = (bus: NonNullable<ReturnType<typeof normalizeBusDetail>>): Partial<VehicleFormData> => ({
    code: bus.busCode,
    plate: bus.licensePlate,
    name: bus.busName,
    type: bus.busType,
    seatLayoutId: bus.seatLayoutId ?? '',
    description: bus.description,
})

export const BusFormModal = ({ open, busId, onClose }: BusFormModalProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.buses' })
    const isEditMode = Boolean(busId)
    const { handleSubmit, isSubmitting } = useBusForm({ busId: busId ?? undefined, onSuccess: onClose })

    const busDetailQuery = useQuery({
        queryKey: ['company-buses', 'detail', busId],
        queryFn: () => getBusById(busId ?? ''),
        enabled: open && isEditMode,
        select: (response) => normalizeBusDetail(response),
    })

    const title = isEditMode ? t('edit_bus_title') : t('add_bus_title')

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={title}
            className="max-w-6xl"
        >
            {busDetailQuery.isLoading ? (
                <div className="flex min-h-64 items-center justify-center">
                    <LoadingSpinner />
                </div>
            ) : busDetailQuery.isError || (isEditMode && !busDetailQuery.data) ? (
                <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                    {t('errors.bus_not_found')}
                </div>
            ) : (
                <VehicleForm
                    key={busId ?? 'create-bus'}
                    defaultValues={busDetailQuery.data ? mapBusToFormValues(busDetailQuery.data) : undefined}
                    initialPreviewLayout={busDetailQuery.data?.seatLayout ?? null}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    isSubmitting={isSubmitting}
                />
            )}
        </Dialog>
    )
}
