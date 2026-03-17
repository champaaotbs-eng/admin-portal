import z from 'zod'

export const tripSchema = (t: (key: string) => string) =>
    z.object({
        route: z.string().min(1, t('errors.route_required')),
        departure: z.string().min(1, t('errors.departure_required')),
        arrival: z.string().min(1, t('errors.arrival_required')),
        bus: z.string().min(1, t('errors.bus_required')),
        driver: z.string().optional(),
        price: z
            .string()
            .min(1, t('errors.price_required'))
            .refine((v) => !isNaN(Number(v)) && Number(v) > 0, t('errors.price_min')),
        seats: z
            .string()
            .min(1, t('errors.seats_required'))
            .refine((v) => !isNaN(Number(v)) && Number(v) >= 1, t('errors.seats_min')),
    })

export type TripFormData = z.infer<ReturnType<typeof tripSchema>>
