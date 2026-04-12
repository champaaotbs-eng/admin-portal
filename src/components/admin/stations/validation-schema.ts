import z from 'zod'

export const stationSchema = (t: (key: string) => string) =>
    z.object({
        name: z.string().min(1, t('errors.name_required')),
        address: z.string().min(1, t('errors.address_required')),
        province: z.string().min(1, t('errors.province_required')),
        lat: z.string().optional(),
        lng: z.string().optional(),
    })

export const routeSchema = (t: (key: string) => string) =>
    z.object({
        from: z.string().min(1, t('errors.from_required')),
        to: z.string().min(1, t('errors.to_required')),
        distance: z
            .string()
            .min(1, t('errors.distance_required'))
            .refine((v) => !isNaN(Number(v)) && Number(v) > 0, t('errors.distance_required')),
        duration: z
            .string()
            .min(1, t('errors.duration_required'))
            .refine((v) => !isNaN(Number(v)) && Number(v) > 0, t('errors.duration_required')),
    })

export type StationFormData = z.infer<ReturnType<typeof stationSchema>>
export type RouteFormData = z.infer<ReturnType<typeof routeSchema>>
