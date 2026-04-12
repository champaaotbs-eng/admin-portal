import z from 'zod'

// Station Add Form Schema
export const stationSchema = (t: (key: string) => string) =>
    z.object({
        label: z.string().min(1, t('stations.validation.required')),
        address: z.string().min(1, t('stations.validation.required')),
        provinceName: z.string().min(1, t('stations.validation.required')),
        wardName: z.string().nullable().optional(),
        latitude: z.number(),
        longitude: z.number(),
        isActive: z.boolean().optional(),
    })

export type TAddStation = z.infer<ReturnType<typeof stationSchema>>
export type TEditStation = z.infer<ReturnType<typeof stationSchema>>
