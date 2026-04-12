import { useQuery } from '@tanstack/react-query'
import {
    getAllStations,
} from 'services/admins/stations.service'
import type {
    IStation,
} from 'types/station'
import type { IRequestPagination } from 'types'

const QUERY_KEY = 'admin-stations'

interface IStationQueryParams extends Partial<IRequestPagination<IStation>> {
    search?: string
    isActive?: boolean
}

const buildStationsQuery = (params: IStationQueryParams): IRequestPagination<IStation> => {
    const searchValue = typeof params.search === 'string' ? params.search.trim() : ''
    const mergedFilters = {
        ...(params.filters ?? {}),
        ...(searchValue ? { address: searchValue } : {}),
        ...(typeof params.isActive === 'boolean' ? { isActive: params.isActive } : {}),
    }

    return {
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        ...(Object.keys(mergedFilters).length > 0
            ? { filters: mergedFilters as IRequestPagination<IStation>['filters'] }
            : {}),
        ...(params.sort ? { sort: params.sort } : {}),
    }
}

export const useStations = (params: IStationQueryParams) => {
    return useQuery({
        queryKey: [QUERY_KEY, params],
        queryFn: () => getAllStations(buildStationsQuery(params)),
        select: (response) => response.data
    })
}
