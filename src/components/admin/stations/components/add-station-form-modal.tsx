import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { useAddStation } from '../hooks/use-add-station'
import { StationMapPicker } from './stations-map-picker'
import type { IOpenStreetMapLocation } from 'lib/openstreetmap'
import { stationSchema, type TAddStation } from '../validation-schema'
interface IAddStationFormModalProps {
    open: boolean
    onClose: () => void
}

interface IAddFormValues {
    label: string
    address: string
    provinceName: string
    wardName?: string | null
    latitude: number
    longitude: number
}

const createDefaultValues = (): IAddFormValues => ({
    label: '',
    address: '',
    provinceName: '',
    wardName: null,
    latitude: 0,
    longitude: 0,
})

export const AddStationFormModal = ({ open, onClose }: IAddStationFormModalProps) => {
    const { t } = useTranslation()
    const createMutation = useAddStation()
    const isSubmitting = createMutation.isPending

    const schema = useMemo(() => stationSchema(t), [t])

    const form = useForm<IAddFormValues>({
        resolver: zodResolver(schema),
        defaultValues: createDefaultValues(),
    })

    useEffect(() => {
        if (!open) {
            return
        }

        form.reset(createDefaultValues())
    }, [form, open])

    const handleLocationSelect = (selectedLocation: IOpenStreetMapLocation) => {
        // Extract first string before comma from address
        const extractLabel = (address: string): string => {
            const parts = address.split(',')
            return parts[0]?.trim() || address
        }

        form.setValue('label', extractLabel(selectedLocation.address), { shouldDirty: true, shouldValidate: true })
        form.setValue('address', selectedLocation.address, { shouldDirty: true, shouldValidate: true })
        form.setValue('provinceName', selectedLocation.provinceName, { shouldDirty: true, shouldValidate: true })
        form.setValue('wardName', selectedLocation.wardName, { shouldDirty: true, shouldValidate: true })
        form.setValue('latitude', selectedLocation.latitude, { shouldDirty: true, shouldValidate: true })
        form.setValue('longitude', selectedLocation.longitude, { shouldDirty: true, shouldValidate: true })
    }

    const handleSubmit = form.handleSubmit(async (values) => {
        const payload: TAddStation = {
            label: values.label,
            address: values.address,
            provinceName: values.provinceName,
            wardName: values.wardName,
            latitude: values.latitude,
            longitude: values.longitude,
        }

        await createMutation.mutateAsync(payload)
        onClose()
    })

    const latitude = form.watch('latitude')
    const longitude = form.watch('longitude')
    const address = form.watch('address')
    const provinceName = form.watch('provinceName')
    const wardName = form.watch('wardName')
    const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude) && (latitude !== 0 || longitude !== 0)

    if (!open) {
        return null
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={t('stations.create_title')}
            className="max-w-5xl"
        >
            <div className="max-h-[calc(100vh-13rem)] overflow-y-auto pr-1">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <StationMapPicker
                        address={address}
                        latitude={latitude}
                        longitude={longitude}
                        title={t('stations.map_section_title')}
                        description={t('stations.map_section_description')}
                        searchLabel={t('stations.map_search_label')}
                        searchPlaceholder={t('stations.map_search_placeholder')}
                        helperText={t('stations.map_helper_text')}
                        emptyStateText={t('stations.map_not_found')}
                        searchFailedText={t('stations.map_search_failed')}
                        onSelectLocation={handleLocationSelect}
                    />

                    <div className="space-y-1">
                        <label className="text-sm font-medium">{t('stations.field_label')}</label>
                        <input
                            {...form.register('label')}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        {form.formState.errors.label?.message ? (
                            <p className="text-xs text-destructive">{form.formState.errors.label.message}</p>
                        ) : null}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">{t('stations.field_address')}</label>
                        <input
                            {...form.register('address')}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        {form.formState.errors.address?.message ? (
                            <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
                        ) : null}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">{t('stations.field_province')}</label>
                            <div className="h-10 rounded-md border border-input bg-muted/40 px-3 text-sm leading-10">
                                {provinceName || '—'}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">{t('stations.field_ward')}</label>
                            <div className="h-10 rounded-md border border-input bg-muted/40 px-3 text-sm leading-10">
                                {wardName || '—'}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">{t('stations.field_latitude')}</label>
                            <div className="h-10 rounded-md border border-input bg-muted/40 px-3 text-sm leading-10 font-mono">
                                {hasCoordinates ? latitude : '—'}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">{t('stations.field_longitude')}</label>
                            <div className="h-10 rounded-md border border-input bg-muted/40 px-3 text-sm leading-10 font-mono">
                                {hasCoordinates ? longitude : '—'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" loading={isSubmitting}>
                            {t('common.save')}
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    )
}
