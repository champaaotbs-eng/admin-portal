import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { ToggleSwitch } from 'components/shared/toggle-switch'
import { useEditStation } from '../hooks/use-edit-station'
import { StationMapPicker } from './stations-map-picker'
import type { IOpenStreetMapLocation } from 'lib/openstreetmap'
import type { IStation } from 'types/station'
import { stationSchema, type TEditStation } from '../validation-schema'

interface IEditStationFormModalProps {
    open: boolean
    onClose: () => void
    station?: IStation
}

const buildEditDefaultValues = (station?: IStation): TEditStation => ({
    label: station?.label ?? '',
    address: station?.address ?? '',
    provinceName: station?.provinceName ?? '',
    wardName: station?.wardName ?? null,
    latitude: station?.latitude ?? 0,
    longitude: station?.longitude ?? 0,
    isActive: station?.isActive ?? true,
})

export const EditStationFormModal = ({ open, onClose, station }: IEditStationFormModalProps) => {
    const { t } = useTranslation()
    const editMutation = useEditStation()
    const isSubmitting = editMutation.isPending

    const schema = useMemo(() => stationSchema(t), [t])

    const form = useForm<TEditStation>({
        resolver: zodResolver(schema),
        defaultValues: buildEditDefaultValues(station),
    })

    useEffect(() => {
        if (!open) {
            return
        }

        if (station) {
            form.reset(buildEditDefaultValues(station))
        }
    }, [form, station, open])

    const handleLocationSelect = (selectedLocation: IOpenStreetMapLocation) => {
        form.setValue('label', selectedLocation.wardName ?? selectedLocation.provinceName ?? selectedLocation.address, { shouldDirty: true, shouldValidate: true })
        form.setValue('address', selectedLocation.address, { shouldDirty: true, shouldValidate: true })
        form.setValue('provinceName', selectedLocation.provinceName, { shouldDirty: true, shouldValidate: true })
        form.setValue('wardName', selectedLocation.wardName, { shouldDirty: true, shouldValidate: true })
        form.setValue('latitude', selectedLocation.latitude, { shouldDirty: true, shouldValidate: true })
        form.setValue('longitude', selectedLocation.longitude, { shouldDirty: true, shouldValidate: true })
    }

    const handleSubmit = form.handleSubmit(async (values) => {
        if (!station) {
            return
        }

        const originalValues = buildEditDefaultValues(station)

        // Only include fields that changed
        const payload: Partial<TEditStation> = {}

        if (values.label !== originalValues.label) payload.label = values.label
        if (values.address !== originalValues.address) payload.address = values.address
        if (values.provinceName !== originalValues.provinceName) payload.provinceName = values.provinceName
        if (values.wardName !== originalValues.wardName) payload.wardName = values.wardName
        if (values.latitude !== originalValues.latitude) payload.latitude = values.latitude
        if (values.longitude !== originalValues.longitude) payload.longitude = values.longitude
        if (values.isActive !== originalValues.isActive) payload.isActive = values.isActive

        // If no changes were made, just close the modal
        if (Object.keys(payload).length === 0) {
            onClose()
            return
        }

        await editMutation.mutateAsync({
            stationId: station.stationId ?? '',
            payload,
        })

        onClose()
    })

    const latitude = form.watch('latitude')
    const longitude = form.watch('longitude')
    const address = form.watch('address')
    const provinceName = form.watch('provinceName')
    const wardName = form.watch('wardName')
    const isActive = form.watch('isActive')

    if (!open || !station) {
        return null
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={t('stations.edit_title')}
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
                                {latitude || '—'}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">{t('stations.field_longitude')}</label>
                            <div className="h-10 rounded-md border border-input bg-muted/40 px-3 text-sm leading-10 font-mono">
                                {longitude || '—'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                        <span className="text-sm font-medium">{t('stations.field_status')}</span>
                        <ToggleSwitch
                            checked={Boolean(isActive)}
                            onChange={(value) => form.setValue('isActive', value, { shouldDirty: true })}
                            disabled={isSubmitting}
                        />
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
