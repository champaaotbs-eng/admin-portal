import z from 'zod'

export const userSchema = (t: (key: string) => string) =>
    z.object({
        name: z.string().min(1, t('errors.name_required')),
        username: z.string().min(1, t('errors.username_required')),
        email: z
            .string()
            .min(1, t('errors.email_required'))
            .email(t('errors.email_invalid')),
        phone: z.string().optional(),
        role: z.string().min(1),
        password: z.string().optional(),
    })

export const userCreateSchema = (t: (key: string) => string) =>
    userSchema(t).extend({
        password: z.string().min(6, t('errors.password_min')),
    })

export type UserFormData = z.infer<ReturnType<typeof userSchema>>
