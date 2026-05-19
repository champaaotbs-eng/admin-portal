import z from 'zod'

export const staffSchema = (t: (key: string) => string, isEditMode = false) =>
    z.object({
        username: z
            .string()
            .trim()
            .min(1, t('errors.username_required'))
            .min(3, t('errors.username_min'))
            .regex(/^\S+$/, t('errors.username_no_spaces')),
        fullName: z.string().trim().min(1, t('errors.name_required')),
        roleId: z.string().trim().min(1, t('errors.role_required')),
        password: isEditMode
            ? z.string().trim().optional().refine((value) => !value || value.length >= 6, t('errors.password_min'))
            : z.string().trim().min(6, t('errors.password_min')),
        isActive: z.boolean().default(true),
    })

export type StaffFormData = z.infer<ReturnType<typeof staffSchema>>
