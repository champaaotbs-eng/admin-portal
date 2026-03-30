import z from 'zod'

export const adminSchema = (t: (key: string) => string) =>
    z.object({
        fullName: z.string().min(1, t('errors.name_required')),
        username: z.string().min(1, t('errors.username_required')),
        roleId: z.string().min(1, t('errors.role_required')),
        password: z.string().optional(),
        isActive: z.boolean().default(true),
    })

export type AdminFormData = z.infer<ReturnType<typeof adminSchema>>
