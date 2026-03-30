import z from 'zod'

export const roleSchema = (t: (key: string) => string) =>
    z.object({
        roleName: z.string().trim().min(1, t('errors.name_required')),
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
