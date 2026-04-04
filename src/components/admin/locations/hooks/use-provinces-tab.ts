import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLocations, getProvinces } from 'services/admins/location.service'
import type { ILocation } from 'types/location'
import type { IProvince } from 'types/province'

interface UseProvincesTabProps {
    search: string
}

export const useProvincesTab = ({ search }: UseProvincesTabProps) => {
    const provincesQuery = useQuery({
        queryKey: ['admin-locations', 'provinces'],
        queryFn: getProvinces,
    })

    const locationsQuery = useQuery({
        queryKey: ['admin-locations', 'locations', 'all'],
        queryFn: () => getLocations({ page: 1, limit: 1000 }),
    })

    const provinces = useMemo(() => {
        const data = provincesQuery.data?.data
        return Array.isArray(data) ? data : ([] as IProvince[])
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

    const stationCountMap = useMemo(() => {
        const map = new Map<string, number>()
        for (const location of locations) {
            map.set(location.provinceId, (map.get(location.provinceId) ?? 0) + 1)
        }
        return map
    }, [locations])

    const filtered = useMemo(
        () => provinces.filter((province) => !search || province.name.toLowerCase().includes(search.toLowerCase())),
        [provinces, search],
    )

    return {
        filtered,
        stationCountMap,
        isLoading: provincesQuery.isLoading || locationsQuery.isLoading,
    }
}
