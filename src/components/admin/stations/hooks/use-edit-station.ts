import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
    updateStation,
} from 'services/admins/stations.service'
import { getProvincesCodeByName } from 'services/admins/provinces.service'
import type { TEditStation } from '../validation-schema'

const QUERY_KEY = 'admin-stations'

export const useEditStation = () => {
    const queryClient = useQueryClient()
    const { t } = useTranslation()

    return useMutation({
        mutationFn: async ({
            stationId,
            payload,
        }: {
            stationId: string
            payload: Partial<TEditStation>
        }) => {
            // If no changes provided, return early
            if (Object.keys(payload).length === 0) {
                return { success: true }
            }

            // If province name is being updated, get the codes
            if (payload.provinceName) {
                try {
                    const provinceResponse = await getProvincesCodeByName(
                        payload.provinceName,
                        payload.wardName ?? undefined
                    )

                    const provinceData = provinceResponse.data as { provinceCode?: string; wardCode?: string }
                    if (!provinceData?.provinceCode) {
                        throw new Error(t('stations.province_not_found') ?? 'Province not found')
                    }

                    const updatePayload: any = {
                        provinceCode: provinceData.provinceCode,
                        wardCode: provinceData.wardCode,
                    }

                    // Add other fields if they're present in payload
                    if (payload.label !== undefined) updatePayload.label = payload.label
                    if (payload.address !== undefined) updatePayload.address = payload.address
                    if (payload.latitude !== undefined) updatePayload.latitude = payload.latitude
                    if (payload.longitude !== undefined) updatePayload.longitude = payload.longitude
                    if (payload.isActive !== undefined) updatePayload.isActive = payload.isActive

                    return await updateStation(stationId, updatePayload)
                } catch (error) {
                    const errorMessage = (error as { message?: string }).message
                    if (errorMessage?.includes('Province not found') || errorMessage?.includes('province')) {
                        throw error
                    }
                    throw new Error(t('stations.province_not_found') ?? 'Unable to verify province information')
                }
            }

            // If province is not being updated, send only the changed fields
            const updatePayload: any = {}
            if (payload.label !== undefined) updatePayload.label = payload.label
            if (payload.address !== undefined) updatePayload.address = payload.address
            if (payload.latitude !== undefined) updatePayload.latitude = payload.latitude
            if (payload.longitude !== undefined) updatePayload.longitude = payload.longitude
            if (payload.isActive !== undefined) updatePayload.isActive = payload.isActive

            return await updateStation(stationId, updatePayload)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
            toast.success(t('stations.update_success'))
        },
        onError: (error: unknown) => {
            const message =
                (error as { localizedMessage?: string; message?: string }).localizedMessage
                ?? (error as { message?: string }).message
                ?? t('errors.internal_server_error')

            toast.error(message)
        },
    })
}
