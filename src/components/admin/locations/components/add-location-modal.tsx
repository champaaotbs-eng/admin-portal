import { useTranslation } from 'react-i18next'
import { Dialog } from '@/components/ui/dialog'
import type { IProvince } from 'types/province'
import type { StationFormData } from '../validation-schema'
import { StationForm } from './station-form'

interface AddLocationModalProps {
    open: boolean
    onClose: () => void
    provinces: IProvince[]
    onSubmit: (payload: StationFormData) => Promise<void> | void
    isSubmitting?: boolean
    submitError?: string | null
}

export const AddLocationModal = ({
    open,
    onClose,
    provinces,
    onSubmit,
    isSubmitting = false,
    submitError = null,
}: AddLocationModalProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.locations' })

    return (
        <Dialog open={open} onClose={onClose} title={t('add_station_title')}>
            <div className="space-y-3">
                {submitError ? (
                    <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {submitError}
                    </p>
                ) : null}

                <StationForm
                    provinces={provinces}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    isSubmitting={isSubmitting}
                />
            </div>
        </Dialog>
    )
}