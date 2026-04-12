import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
    updateStation,
} from 'services/admins/stations.service'
import type { IStation } from 'types/station'

const QUERY_KEY = 'admin-stations'

export const useToggleStationActive = () => {
    const queryClient = useQueryClient()
    const { t } = useTranslation()

    const { mutate, isPending } = useMutation({
        mutationFn: async ({
            stationId,
            isActive,
        }: {
            stationId: string
            isActive: boolean
        }) => {
            return await updateStation(stationId, { isActive })
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

    const toggle = (station: IStation) => {
        mutate({
            stationId: station.stationId ?? '',
            isActive: !station.isActive,
        })
    }

    return { toggle, isPending }
}
