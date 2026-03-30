import z from 'zod'

export const companySchema = (t: (key: string) => string) =>
    z.object({
        name: z.string().min(1, t('errors.name_required')),
        email: z
            .string()
            .min(1, t('errors.email_required'))
            .email(t('errors.email_invalid')),
        phone: z.string().min(1, t('errors.phone_required')),
        address: z.string().min(1, t('errors.address_required')),
        serviceFee: z
            .string()
            .optional()
            .refine(
                (v) => !v || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100),
                t('errors.service_fee_invalid'),
            ),
        ownerId: z.string().optional(),
    })

export const companyCreateSchema = (t: (key: string) => string) =>
    companySchema(t).extend({
        ownerId: z.string().optional(),
    })

export type CompanyFormData = z.infer<ReturnType<typeof companySchema>>
