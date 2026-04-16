import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
    createStation,
} from 'services/admins/stations.service'
import { getProvincesCodeByCodeName } from 'services/admins/provinces.service'
import type { TAddStation } from '../validation-schema'
import { splitBoundaryName, toSnakeCaseNoAccent } from 'utils/format'

const QUERY_KEY = 'admin-stations'

export const useAddStation = () => {
    const queryClient = useQueryClient()
    const { t } = useTranslation()

    return useMutation({
        mutationFn: async (payload: TAddStation) => {
            // Get province and ward codes before creating
            try {
                const provinceCodeName = toSnakeCaseNoAccent(splitBoundaryName(payload.provinceName)?.name || payload.provinceName)
                const wardCodeName = payload.wardName ? toSnakeCaseNoAccent(payload.wardName) : undefined
                const provinceResponse = await getProvincesCodeByCodeName(
                    provinceCodeName,
                    wardCodeName
                )

                const provinceData = provinceResponse.data as { provinceCode?: string; wardCode?: string }
                if (!provinceData?.provinceCode) {
                    throw new Error(t('stations.province_not_found') ?? 'Province not found')
                }

                const createPayload = {
                    label: payload.label,
                    address: payload.address,
                    provinceCode: provinceData.provinceCode,
                    wardCode: provinceData.wardCode,
                    latitude: payload.latitude,
                    longitude: payload.longitude,
                }

                return await createStation(createPayload)
            } catch (error) {
                const errorMessage = (error as { message?: string }).message
                if (errorMessage?.includes('Province not found') || errorMessage?.includes('province')) {
                    throw error
                }
                throw new Error(t('stations.province_not_found') ?? 'Unable to verify province information')
            }
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
            toast.success(t('stations.create_success'))
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
