import z from 'zod'

export const defaultVehicleFormValues = {
    code: '',
    plate: '',
    name: '',
    type: '',
    seatLayoutId: '',
    description: '',
}

export const vehicleSchema = (t: (key: string) => string) =>
    z.object({
        code: z.string().trim().min(1, t('errors.code_required')),
        plate: z.string().trim().min(1, t('errors.plate_required')),
        name: z.string().trim().min(1, t('errors.name_required')),
        type: z.string().trim().min(1, t('errors.type_required')),
        seatLayoutId: z.string().trim().min(1, t('errors.seat_layout_required')),
        description: z
            .string()
            .max(500, t('errors.description_max'))
            .optional(),
    })

export type VehicleFormData = z.infer<ReturnType<typeof vehicleSchema>>
