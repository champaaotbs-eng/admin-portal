import z from 'zod'
import { ESeatType } from 'types/seat-layout'
import type { ISeatLayoutFormValue } from 'types/seat-layout'

const seatDraftSchema = (t: (key: string) => string) => z.object({
    localId: z.string().min(1),
    seatId: z.string().optional(),
    seatCode: z.string().min(1, t('errors.seat_code_required')).max(20, t('errors.seat_code_max')),
    row: z.number().int().min(1, t('errors.seat_row_min')),
    col: z.number().int().min(1, t('errors.seat_column_min')),
    floor: z.number().int().min(1, t('errors.seat_floor_min')),
    seatType: z.nativeEnum(ESeatType, {
        required_error: t('errors.seat_type_required'),
        invalid_type_error: t('errors.seat_type_required'),
    }),
    price: z.number().min(0, t('errors.seat_price_min')),
})

export const defaultSeatLayoutValue: ISeatLayoutFormValue = {
    name: '',
    rows: '5',
    columns: '4',
    seats: [],
}

export const seatLayoutFormSchema = (t: (key: string) => string) =>
    z.object({
        name: z.string().trim().min(1, t('errors.seat_layout_name_required')).max(120, t('errors.seat_layout_name_max')),
        rows: z
            .string()
            .min(1, t('errors.seat_layout_rows_required'))
            .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 1, t('errors.seat_layout_rows_min'))
            .refine((value) => Number(value) <= 20, t('errors.seat_layout_rows_max')),
        columns: z
            .string()
            .min(1, t('errors.seat_layout_columns_required'))
            .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 1, t('errors.seat_layout_columns_min'))
            .refine((value) => Number(value) <= 8, t('errors.seat_layout_columns_max')),
        seats: z.array(seatDraftSchema(t)).min(1, t('errors.seat_layout_seats_required')),
    })

export const vehicleSchema = (t: (key: string) => string) =>
    z.object({
        code: z.string().min(1, t('errors.code_required')),
        plate: z.string().min(1, t('errors.plate_required')),
        name: z.string().min(1, t('errors.name_required')),
        type: z.string().min(1, t('errors.type_required')),
        seatLayout: seatLayoutFormSchema(t),
        description: z
            .string()
            .max(500, t('errors.description_max'))
            .optional(),
    })

export type VehicleFormData = z.infer<ReturnType<typeof vehicleSchema>>
