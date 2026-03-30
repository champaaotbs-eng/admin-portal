import z from 'zod'
import { ADMIN_TYPE } from 'configs/constants'

export const roleSchema = (t: (key: string) => string) =>
    z.object({
        roleName: z.string().trim().min(1, t('errors.name_required')),
        type: z
            .string()
            .trim()
            .refine(
                (value) => value === ADMIN_TYPE.SYSTEM_ADMIN || value === ADMIN_TYPE.COMPANY_ADMIN,
                t('errors.type_required')
            ),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
        permissions: z.array(
            z.object({
                module: z.string(),
                read: z.boolean(),
                write: z.boolean(),
            })
        ).default([]),
    })

export type TInsertRole = z.input<ReturnType<typeof roleSchema>>;
