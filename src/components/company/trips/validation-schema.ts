import z from 'zod'

export const seatPriceSchema = z.object({
    seatId: z.string(),
    seatCode: z.string(),
    price: z.number().min(0),
})

export const tripSchema = (t: (key: string) => string) =>
    z.object({
        routeId: z.string().min(1, t('errors.route_required')),
        busVersionId: z.string().optional(),
        departureTime: z.string().min(1, t('errors.departure_required')),
        arrivalTime: z.string().min(1, t('errors.arrival_required')),
        basePrice: z
            .string()
            .min(1, t('errors.price_required'))
            .refine((v) => !isNaN(Number(v)) && Number(v) > 0, t('errors.price_min')),
        isPublished: z.boolean().optional(),
        seatPrices: z.array(seatPriceSchema).optional(),
    })

export type TripFormData = z.infer<ReturnType<typeof tripSchema>>
