import { useMemo, type Dispatch, type SetStateAction } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { RouteFormData } from '../validation-schema'
import { createRoute, getRoutes } from 'services/admins/route.service'
import { getLocations } from 'services/admins/location.service'
import type { ILocation } from 'types/location'
import type { IRoute } from 'types/route'

interface UseRoutesTabProps {
    search: string
    setDialogOpen: Dispatch<SetStateAction<boolean>>
}

export const useRoutesTab = ({ search, setDialogOpen }: UseRoutesTabProps) => {
    const queryClient = useQueryClient()

    const routesQuery = useQuery({
        queryKey: ['admin-locations', 'routes'],
        queryFn: () => getRoutes({ page: 1, limit: 1000 }),
    })

    const locationsQuery = useQuery({
        queryKey: ['admin-locations', 'locations', 'all'],
        queryFn: () => getLocations({ page: 1, limit: 1000 }),
    })

    const createRouteMutation = useMutation({
        mutationFn: (payload: RouteFormData) => createRoute(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['admin-locations', 'routes'] })
            setDialogOpen(false)
        },
    })

    const routes = useMemo(() => {
        const data = routesQuery.data?.data
        if (Array.isArray(data)) {
            return data as IRoute[]
        }

        if (data && Array.isArray((data as unknown as { data?: IRoute[] }).data)) {
            return (data as unknown as { data: IRoute[] }).data
        }

        if (data && Array.isArray((data as unknown as { result?: IRoute[] }).result)) {
            return (data as unknown as { result: IRoute[] }).result
        }

        return [] as IRoute[]
    }, [routesQuery.data])

    const locations = useMemo(() => {
        const data = locationsQuery.data?.data
        if (Array.isArray(data)) {
            return data as ILocation[]
        }

        if (data && Array.isArray((data as unknown as { data?: ILocation[] }).data)) {
            return (data as unknown as { data: ILocation[] }).data
        }

        if (data && Array.isArray((data as unknown as { result?: ILocation[] }).result)) {
            return (data as unknown as { result: ILocation[] }).result
        }

        return [] as ILocation[]
    }, [locationsQuery.data])

    const locationMap = useMemo(() => {
        const map = new Map<string, ILocation>()
        for (const location of locations) {
            map.set(location.locationId, location)
        }
        return map
    }, [locations])

    const normalizedRoutes = useMemo(() => routes.map((route) => {
        const from = route.fromLocation ?? locationMap.get(route.fromLocationId)
        const to = route.toLocation ?? locationMap.get(route.toLocationId)

        return {
            id: route.routeId,
            fromLabel: from?.name ?? route.fromLocationId,
            toLabel: to?.name ?? route.toLocationId,
            distanceKm: route.distanceKm,
            estimatedMinutes: route.estimateDurationMins,
            tripCount: 0,
            isActive: true,
        }
    }), [routes, locationMap])

    const filtered = useMemo(() => normalizedRoutes.filter((route) =>
        !search
        || route.fromLabel.toLowerCase().includes(search.toLowerCase())
        || route.toLabel.toLowerCase().includes(search.toLowerCase()),
    ), [normalizedRoutes, search])

    const openDialog = () => setDialogOpen(true)
    const closeDialog = () => setDialogOpen(false)

    const submitRoute = async (payload: RouteFormData) => {
        await createRouteMutation.mutateAsync(payload)
    }

    return {
        filtered,
        locations,
        openDialog,
        closeDialog,
        submitRoute,
        isSubmitting: createRouteMutation.isPending,
        isLoading: routesQuery.isLoading || locationsQuery.isLoading,
    }
}
