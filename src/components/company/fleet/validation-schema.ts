import z from 'zod'

export const vehicleSchema = (t: (key: string) => string) =>
    z.object({
        plate: z.string().min(1, t('errors.plate_required')),
        name: z.string().min(1, t('errors.name_required')),
        type: z.string().min(1, t('errors.type_required')),
        seats: z
            .string()
            .min(1, t('errors.seats_required'))
            .refine((v) => !isNaN(Number(v)) && Number(v) >= 1, t('errors.seats_min')),
    })

export type VehicleFormData = z.infer<ReturnType<typeof vehicleSchema>>
