import z from 'zod'

export const staffSchema = (t: (key: string) => string) =>
    z.object({
        name: z.string().min(1, t('errors.name_required')),
        email: z
            .string()
            .min(1, t('errors.email_required'))
            .email(t('errors.email_invalid')),
        phone: z.string().min(1, t('errors.phone_required')),
        role: z.string().min(1, t('errors.role_required')),
        password: z.string().optional(),
    })

export const staffCreateSchema = (t: (key: string) => string) =>
    staffSchema(t).extend({
        password: z.string().min(6, t('errors.password_min')),
    })

export type StaffFormData = z.infer<ReturnType<typeof staffSchema>>
