import { ERouteStopType } from "configs/constants"
import z from "zod"

export const routeSchema = (t: (key: string) => string) =>
    z.object({
        busCompanyId: z.string().min(1, t('errors.bus_company_required')),
        distanceKm: z.string().min(1, t('errors.distance_required')).refine((v) => !isNaN(Number(v)) && Number(v) > 0, t('errors.distance_positive')),
        estimateDurationMins: z.string().min(1, t('errors.estimate_duration_required')).refine((v) => !isNaN(Number(v)) && Number(v) > 0, t('errors.estimate_duration_positive')),
        routeStops: z.array(
            z.object({
                stationId: z.string().min(1, t('errors.location_required')),
                stopType: z.enum([ERouteStopType.PICKUP, ERouteStopType.DROPOFF, ERouteStopType.BOTH]),
                stopOrder: z.number().int().positive(),
                offsetMins: z.string().min(1, t('errors.offset_required')).refine((v) => !isNaN(Number(v)) && Number(v) >= 0, t('errors.offset_non_negative')),
                isActive: z.boolean(),
            })
        )
    })
export type TRouteFormData = z.infer<ReturnType<typeof routeSchema>>
