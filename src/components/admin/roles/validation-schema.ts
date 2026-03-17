import z from 'zod'

export const roleSchema = (t: (key: string) => string) =>
    z.object({
        name: z.string().min(1, t('errors.name_required')),
        description: z.string().optional(),
    })

export type RoleFormData = z.infer<ReturnType<typeof roleSchema>>
