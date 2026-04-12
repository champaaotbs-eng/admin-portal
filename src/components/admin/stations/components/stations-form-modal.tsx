import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { ToggleSwitch } from 'components/shared/toggle-switch'
import { useCreateStation, useUpdateStation } from '../hooks/use-stations'
import { StationMapPicker } from './stations-map-picker'
import type { IOpenStreetMapLocation } from 'lib/openstreetmap'
import type { ICreateStationPayload, IStation, IUpdateStationPayload } from 'types/station'

interface IStationFormModalProps {
    open: boolean
    onClose: () => void
    station?: IStation
}

interface ICreateFormValues {
    label: string
    address: string
    provinceName: string
    wardName: string | null
    latitude: number
    longitude: number
}

interface IEditFormValues {
    label: string
    address: string
    provinceName: string
    wardName: string | null
    latitude: number
    longitude: number
    isActive?: boolean
}

const createDefaultValues = (): ICreateFormValues => ({
    label: '',
    address: '',
    provinceName: '',
    wardName: null,
    latitude: 0,
    longitude: 0,
})

const buildEditDefaultValues = (station?: IStation): IEditFormValues => ({
    label: station?.name ?? '',
    address: station?.address ?? '',
    provinceName: station?.provinceCode ?? '',
    wardName: station?.wardCode ?? null,
    latitude: station?.latitude ?? 0,
    longitude: station?.longitude ?? 0,
    isActive: station?.isActive ?? true,
})

export const StationFormModal = ({ open, onClose, station }: IStationFormModalProps) => {
    const { t } = useTranslation()
    const isEditMode = Boolean(station)

    const createMutation = useCreateStation()
    const updateMutation = useUpdateStation()
    const isSubmitting = createMutation.isPending || updateMutation.isPending

    const createSchema = useMemo(() => z.object({
        label: z.string().min(1, t('stations.validation.required')),
        address: z.string().min(1, t('stations.validation.required')),
        provinceName: z.string().min(1, t('stations.validation.required')),
        wardName: z.string().nullable(),
        latitude: z.number(),
        longitude: z.number(),
    }), [t])

    const editSchema = useMemo(() => z.object({
        label: z.string().min(1, t('stations.validation.required')),
        address: z.string().min(1, t('stations.validation.required')),
        provinceName: z.string().min(1, t('stations.validation.required')),
        wardName: z.string().nullable(),
        latitude: z.number(),
        longitude: z.number(),
        isActive: z.boolean().optional(),
    }), [t])

    const createForm = useForm<ICreateFormValues>({
        resolver: zodResolver(createSchema),
        defaultValues: createDefaultValues(),
    })

    const editForm = useForm<IEditFormValues>({
        resolver: zodResolver(editSchema),
        defaultValues: buildEditDefaultValues(station),
    })

    useEffect(() => {
        if (!open) {
            return
        }

        if (isEditMode && station) {
            editForm.reset(buildEditDefaultValues(station))
            return
        }

        createForm.reset(createDefaultValues())
    }, [createForm, editForm, isEditMode, station, open])

    const handleCreateLocationSelect = (selectedLocation: IOpenStreetMapLocation) => {
        createForm.setValue('label', selectedLocation.wardName ?? selectedLocation.provinceName ?? selectedLocation.address, { shouldDirty: true, shouldValidate: true })
        createForm.setValue('address', selectedLocation.address, { shouldDirty: true, shouldValidate: true })
        createForm.setValue('provinceName', selectedLocation.provinceName, { shouldDirty: true, shouldValidate: true })
        createForm.setValue('wardName', selectedLocation.wardName, { shouldDirty: true, shouldValidate: true })
        createForm.setValue('latitude', selectedLocation.latitude, { shouldDirty: true, shouldValidate: true })
        createForm.setValue('longitude', selectedLocation.longitude, { shouldDirty: true, shouldValidate: true })
    }

    const handleEditLocationSelect = (selectedLocation: IOpenStreetMapLocation) => {
        editForm.setValue('label', selectedLocation.wardName ?? selectedLocation.provinceName ?? selectedLocation.address, { shouldDirty: true, shouldValidate: true })
        editForm.setValue('address', selectedLocation.address, { shouldDirty: true, shouldValidate: true })
        editForm.setValue('provinceName', selectedLocation.provinceName, { shouldDirty: true, shouldValidate: true })
        editForm.setValue('wardName', selectedLocation.wardName, { shouldDirty: true, shouldValidate: true })
        editForm.setValue('latitude', selectedLocation.latitude, { shouldDirty: true, shouldValidate: true })
        editForm.setValue('longitude', selectedLocation.longitude, { shouldDirty: true, shouldValidate: true })
    }

    const submitCreate = createForm.handleSubmit(async (values) => {
        const payload: ICreateStationPayload = {
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

    const submitEdit = editForm.handleSubmit(async (values) => {
        if (!station) {
            return
        }

        const payload: IUpdateStationPayload = {
            label: values.label,
            address: values.address,
            provinceName: values.provinceName,
            wardName: values.wardName,
            latitude: values.latitude,
            longitude: values.longitude,
            isActive: values.isActive,
        }

        await updateMutation.mutateAsync({
            locationId: station.locationId,
            payload,
        })

        onClose()
    })

    const createLatitude = createForm.watch('latitude')
    const createLongitude = createForm.watch('longitude')
    const createAddress = createForm.watch('address')
    const createProvinceName = createForm.watch('provinceName')
    const createWardName = createForm.watch('wardName')
    const editLatitude = editForm.watch('latitude')
    const editLongitude = editForm.watch('longitude')
    const editAddress = editForm.watch('address')
    const editProvinceName = editForm.watch('provinceName')
    const editWardName = editForm.watch('wardName')
    const editIsActive = editForm.watch('isActive')
    const hasCreateCoordinates = Number.isFinite(createLatitude) && Number.isFinite(createLongitude) && (createLatitude !== 0 || createLongitude !== 0)
    const hasEditCoordinates = Number.isFinite(editLatitude) && Number.isFinite(editLongitude) && (editLatitude !== 0 || editLongitude !== 0)

    if (!open) {
        return null
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={isEditMode ? t('stations.edit_title') : t('stations.create_title')}
            className="max-w-2xl"
        >
            <div className="max-h-[calc(100vh-13rem)] overflow-y-auto pr-1">
                {!isEditMode ? (
                    <form className="space-y-4" onSubmit={submitCreate}>
                        <StationMapPicker
                            address={createAddress}
                            latitude={createLatitude}
                            longitude={createLongitude}
                            title={t('stations.map_section_title')}
                            description={t('stations.map_section_description')}
                            searchLabel={t('stations.map_search_label')}
                            searchPlaceholder={t('stations.map_search_placeholder')}
                            helperText={t('stations.map_helper_text')}
                            emptyStateText={t('stations.map_not_found')}
                            searchFailedText={t('stations.map_search_failed')}
                            onSelectLocation={handleCreateLocationSelect}
                        />

                        <div className="space-y-1">
                            <label className="text-sm font-medium">{t('stations.field_label')}</label>
                            <input
                                {...createForm.register('label')}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            {createForm.formState.errors.label?.message ? (
                                <p className="text-xs text-destructive">{createForm.formState.errors.label.message}</p>
                            ) : null}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">{t('stations.field_address')}</label>
                            <input
                                {...createForm.register('address')}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            {createForm.formState.errors.address?.message ? (
                                <p className="text-xs text-destructive">{createForm.formState.errors.address.message}</p>
                            ) : null}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">{t('stations.field_province')}</label>
                                <div className="h-10 rounded-md border border-input bg-muted/40 px-3 text-sm leading-10">
                                    {createProvinceName || '—'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">{t('stations.field_ward')}</label>
                                <div className="h-10 rounded-md border border-input bg-muted/40 px-3 text-sm leading-10">
                                    {createWardName || '—'}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">{t('stations.field_latitude')}</label>
                                <div className="h-10 rounded-md border border-input bg-muted/40 px-3 text-sm leading-10 font-mono">
                                    {hasCreateCoordinates ? createLatitude : '—'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">{t('stations.field_longitude')}</label>
                                <div className="h-10 rounded-md border border-input bg-muted/40 px-3 text-sm leading-10 font-mono">
                                    {hasCreateCoordinates ? createLongitude : '—'}
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
                ) : (
                    <form className="space-y-4" onSubmit={submitEdit}>
                        <StationMapPicker
                            address={editAddress}
                            latitude={editLatitude}
                            longitude={editLongitude}
                            title={t('stations.map_section_title')}
                            description={t('stations.map_section_description')}
                            searchLabel={t('stations.map_search_label')}
                            searchPlaceholder={t('stations.map_search_placeholder')}
                            helperText={t('stations.map_helper_text')}
                            emptyStateText={t('stations.map_not_found')}
                            searchFailedText={t('stations.map_search_failed')}
                            onSelectLocation={handleEditLocationSelect}
                        />

                        <div className="space-y-1">
                            <label className="text-sm font-medium">{t('stations.field_label')}</label>
                            <input
                                {...editForm.register('label')}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            {editForm.formState.errors.label?.message ? (
                                <p className="text-xs text-destructive">{editForm.formState.errors.label.message}</p>
                            ) : null}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">{t('stations.field_address')}</label>
                            <input
                                {...editForm.register('address')}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            {editForm.formState.errors.address?.message ? (
                                <p className="text-xs text-destructive">{editForm.formState.errors.address.message}</p>
                            ) : null}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">{t('stations.field_province')}</label>
                                <div className="h-10 rounded-md border border-input bg-muted/40 px-3 text-sm leading-10">
                                    {editProvinceName || '—'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">{t('stations.field_ward')}</label>
                                <div className="h-10 rounded-md border border-input bg-muted/40 px-3 text-sm leading-10">
                                    {editWardName || '—'}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">{t('stations.field_latitude')}</label>
                                <div className="h-10 rounded-md border border-input bg-muted/40 px-3 text-sm leading-10 font-mono">
                                    {hasEditCoordinates ? editLatitude : '—'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">{t('stations.field_longitude')}</label>
                                <div className="h-10 rounded-md border border-input bg-muted/40 px-3 text-sm leading-10 font-mono">
                                    {hasEditCoordinates ? editLongitude : '—'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                            <span className="text-sm font-medium">{t('stations.field_status')}</span>
                            <ToggleSwitch
                                checked={Boolean(editIsActive)}
                                onChange={(value) => editForm.setValue('isActive', value, { shouldDirty: true })}
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
                )}
            </div>
        </Dialog>
    )
}
