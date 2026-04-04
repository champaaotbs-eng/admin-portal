import { useMemo, type Dispatch, type SetStateAction } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { StationFormData } from '../validation-schema'
import { createLocation, getLocations, getProvinces } from 'services/admins/location.service'
import type { ILocation } from 'types/location'
import type { IProvince } from 'types/province'

interface UseLocationsTabProps {
    search: string
    provinceFilter: string
    setDialogOpen: Dispatch<SetStateAction<boolean>>
}

export const useLocationsTab = ({ search, provinceFilter, setDialogOpen }: UseLocationsTabProps) => {
    const queryClient = useQueryClient()

    const toErrorMessage = (error: unknown) => {
        if (!error || typeof error !== 'object') {
            return null
        }

        const axiosError = error as AxiosError

        if (typeof axiosError.localizedMessage === 'string' && axiosError.localizedMessage.length > 0) {
            return axiosError.localizedMessage
        }

        if (typeof axiosError.message === 'string' && axiosError.message.length > 0) {
            return axiosError.message
        }

        return null
    }

    const provincesQuery = useQuery({
        queryKey: ['admin-locations', 'provinces'],
        queryFn: getProvinces,
    })

    const locationsQuery = useQuery({
        queryKey: ['admin-locations', 'locations', { provinceFilter }],
        queryFn: () => getLocations({ page: 1, limit: 1000, provinceId: provinceFilter || undefined }),
    })

    const createLocationMutation = useMutation({
        mutationFn: (payload: StationFormData) => createLocation(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['admin-locations', 'locations'] })
            setDialogOpen(false)
        },
    })

    const provinces = useMemo(() => {
        const data = provincesQuery.data?.data
        if (Array.isArray(data)) {
            return data
        }
        return [] as IProvince[]
    }, [provincesQuery.data])

    const locations = useMemo(() => {
        const data = locationsQuery.data?.data
        if (Array.isArray(data)) {
            return data
        }

        if (data && Array.isArray((data as unknown as { data?: ILocation[] }).data)) {
            return (data as unknown as { data: ILocation[] }).data
        }

        if (data && Array.isArray((data as unknown as { result?: ILocation[] }).result)) {
            return (data as unknown as { result: ILocation[] }).result
        }

        return [] as ILocation[]
    }, [locationsQuery.data])

    const filtered = useMemo(() => locations.filter((location) =>
        (!search || location.name.toLowerCase().includes(search.toLowerCase()) || location.address.toLowerCase().includes(search.toLowerCase()))
        && (!provinceFilter || location.provinceId === provinceFilter)
    ), [locations, search, provinceFilter])

    const openDialog = () => {
        createLocationMutation.reset()
        setDialogOpen(true)
    }
    const closeDialog = () => {
        createLocationMutation.reset()
        setDialogOpen(false)
    }

    const submitStation = async (payload: StationFormData) => {
        await createLocationMutation.mutateAsync(payload)
    }

    return {
        filtered,
        provinces,
        openDialog,
        closeDialog,
        submitStation,
        isSubmitting: createLocationMutation.isPending,
        isLoading: provincesQuery.isLoading || locationsQuery.isLoading,
        submitError: toErrorMessage(createLocationMutation.error),
    }
}
