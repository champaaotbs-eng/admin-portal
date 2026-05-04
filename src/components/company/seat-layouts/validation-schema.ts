import z from 'zod'
import { ESeatType } from 'types/seat-layout'

export const seatLayoutSchema = (t: (key: string) => string) =>
    z.object({
        name: z
            .string()
            .trim()
            .min(1, t('errors.name_required'))
            .max(120, t('errors.name_max')),
        numberRows: z
            .string()
            .min(1, t('errors.rows_required'))
            .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 1, t('errors.rows_min'))
            .refine((value) => Number(value) <= 20, t('errors.rows_max')),
        numberCols: z
            .string()
            .min(1, t('errors.columns_required'))
            .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 1, t('errors.columns_min'))
            .refine((value) => Number(value) <= 8, t('errors.columns_max')),
        numberFloors: z
            .string()
            .min(1, t('errors.floors_required'))
            .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 1, t('errors.floors_min')),
    })

export type TSeatLayoutFormData = z.infer<ReturnType<typeof seatLayoutSchema>>

export const seatConfigSchema = (t: (key: string) => string) =>
    z.object({
        seatCode: z
            .string()
            .trim()
            .min(1, t('errors.seat_code_required'))
            .max(20, t('errors.seat_code_max')),
        floor: z
            .string()
            .min(1, t('errors.floor_required'))
            .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 1, t('errors.floor_min')),
        seatType: z.nativeEnum(ESeatType, {
            required_error: t('errors.seat_type_required'),
            invalid_type_error: t('errors.seat_type_required'),
        }),
    })

export type TSeatConfigFormData = z.infer<ReturnType<typeof seatConfigSchema>>
