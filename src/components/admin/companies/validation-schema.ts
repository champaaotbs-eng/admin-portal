import z from 'zod'
import { BusCompanyAdminPosition, BusCompanyStatus } from 'types/company'

export const companySchema = (t: (key: string) => string) =>
    z.object({
        name: z.string().min(1, t('errors.name_required')),
        email: z.string().email(t('errors.email_invalid')).optional().or(z.literal('')),
        phone: z.string().optional(),
        address: z.string().optional(),
        serviceFee: z
            .number()
            .optional()
            .refine((v) => v === undefined || (!isNaN(v) && v >= 0 && v <= 100), t('errors.service_fee_invalid')),
        status: z.nativeEnum(BusCompanyStatus),
        logoUrl: z.string().url(t('errors.logo_url_invalid')).optional().or(z.literal('')),
        publicId: z.string().optional().or(z.literal('')),
        companyAdmins: z
            .array(
                z.object({
                    adminId: z.string().min(1, t('errors.admin_required')),
                    position: z.nativeEnum(BusCompanyAdminPosition),
                }),
            )
            .optional(),
    })

export const companyCreateSchema = (t: (key: string) => string) => companySchema(t)

export type CompanyFormData = z.infer<ReturnType<typeof companySchema>>
