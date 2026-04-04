import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useFieldArray, useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { IAdmin } from 'types/admin'
import { BusCompanyAdminPosition, BusCompanyStatus, type ICompany, type ICompanyAdmins } from 'types/company'
import { useTranslation } from 'react-i18next'
import { getAvailableAdmins } from 'services/admins/admin.service'
import { createCompany, getCompanyById, updateCompany } from 'services/admins/company.service'
import { deleteFile, uploadFile } from 'services/upload-file.service'
import { ADMIN_QUERY_KEYS } from 'components/admin/admins/constants/admin-query-keys.constant'
import { COMPANY_QUERY_KEYS } from '../constants/company-query-keys.constant'
import type { CompanyFormData } from '../validation-schema'

interface UseCompanyFormProps {
    companyId?: string
}

const DEFAULT_VALUES: CompanyFormData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    serviceFee: 0,
    status: BusCompanyStatus.ACTIVE,
    logoUrl: '',
    publicId: '',
    companyAdmins: [{ adminId: '', position: BusCompanyAdminPosition.OWNER }],
}

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * Manage create/edit company form state, upload flow, and admin assignments.
 */
export const useCompanyForm = ({ companyId }: UseCompanyFormProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.companies' })
    const isEditMode = Boolean(companyId)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const form = useForm<CompanyFormData>({
        defaultValues: DEFAULT_VALUES,
        mode: 'onChange',
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'companyAdmins',
    })

    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)
    const [logoError, setLogoError] = useState<string | undefined>(undefined)
    const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null)
    const [existingPublicId, setExistingPublicId] = useState<string | null>(null)
    const [existingAdmins, setExistingAdmins] = useState<ICompanyAdmins[]>([])
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const removeExistingAdmin = (adminId: string) => {
        setExistingAdmins((previous) => previous.filter((admin) => admin.adminId !== adminId))
    }

    const companyQuery = useQuery({
        queryKey: COMPANY_QUERY_KEYS.detail(companyId ?? ''),
        queryFn: async () => {
            const response = await getCompanyById(companyId as string)
            return response.data as ICompany
        },
        enabled: isEditMode,
    })

    const adminsQuery = useQuery({
        queryKey: ADMIN_QUERY_KEYS.detail(companyId ?? ''),
        queryFn: getAvailableAdmins,
        select: (response) => response.data as IAdmin[],
    })

    useEffect(() => {
        if (!companyQuery.data) return

        form.reset({
            name: companyQuery.data.name,
            email: companyQuery.data.email ?? '',
            phone: companyQuery.data.phone ?? '',
            address: companyQuery.data.address ?? '',
            serviceFee: companyQuery.data.serviceFee,
            status: companyQuery.data.status,
            logoUrl: companyQuery.data.logoUrl ?? '',
            publicId: companyQuery.data.publicId ?? '',
            companyAdmins: [],
        })

        setExistingAdmins(companyQuery.data.companyAdmins ?? [])
        setExistingLogoUrl(companyQuery.data.logoUrl ?? null)
        setExistingPublicId(companyQuery.data.publicId ?? null)
    }, [companyQuery.data, form])

    useEffect(() => {
        return () => {
            if (logoPreviewUrl) {
                URL.revokeObjectURL(logoPreviewUrl)
            }
        }
    }, [logoPreviewUrl])

    const createMutation = useMutation({ mutationFn: createCompany })
    const updateMutation = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: CompanyFormData }) => updateCompany(id, payload) })

    const isSubmitting = createMutation.isPending || updateMutation.isPending

    const handleLogoSelect = (file: File) => {
        setLogoError(undefined)

        if (!VALID_IMAGE_TYPES.includes(file.type)) {
            setLogoError(t('errors.logo_type'))
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            setLogoError(t('errors.logo_size'))
            return
        }

        if (logoPreviewUrl) {
            URL.revokeObjectURL(logoPreviewUrl)
        }

        setLogoFile(file)
        setLogoPreviewUrl(URL.createObjectURL(file))
    }

    const handleLogoRemove = () => {
        if (logoPreviewUrl) {
            URL.revokeObjectURL(logoPreviewUrl)
        }
        setLogoFile(null)
        setLogoPreviewUrl(null)
        setLogoError(undefined)
    }

    const availableAdmins = useMemo(() => {
        const existingSet = new Set(existingAdmins.map((admin) => admin.adminId))

        return (adminsQuery.data ?? []).filter((admin) => !existingSet.has(admin.adminId))
    }, [adminsQuery.data, existingAdmins])

    const onSubmit = form.handleSubmit(async (values) => {
        const normalizedServiceFee = values.serviceFee ?? 0

        if (!values.name.trim()) {
            form.setError('name', { message: t('errors.name_required') })
            return
        }

        if (values.name.trim().length < 2) {
            form.setError('name', { message: t('errors.name_min') })
            return
        }

        if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) {
            form.setError('email', { message: t('errors.email_invalid') })
            return
        }

        if (values.phone && !/^\d{10,11}$/.test(values.phone)) {
            form.setError('phone', { message: t('errors.phone_invalid') })
            return
        }

        if (normalizedServiceFee < 0 || normalizedServiceFee > 100) {
            form.setError('serviceFee', { message: t('errors.service_fee_invalid') })
            return
        }

        if (Number.isNaN(normalizedServiceFee)) {
            form.setError('serviceFee', { message: t('errors.service_fee_invalid') })
            return
        }

        const pendingAdmins = (values.companyAdmins ?? []).filter(
            (row): row is { adminId: string; position: BusCompanyAdminPosition } =>
                Boolean(row.adminId) && (row.position === BusCompanyAdminPosition.OWNER || row.position === BusCompanyAdminPosition.STAFF),
        )

        const mergedByAdminId = new Map<string, BusCompanyAdminPosition>()
        existingAdmins.forEach((admin) => {
            if (admin.position === BusCompanyAdminPosition.OWNER || admin.position === BusCompanyAdminPosition.STAFF) {
                mergedByAdminId.set(admin.adminId, admin.position)
            }
        })
        pendingAdmins.forEach((admin) => {
            mergedByAdminId.set(admin.adminId, admin.position)
        })

        const companyAdmins = Array.from(mergedByAdminId.entries()).map(([adminId, position]) => ({
            adminId,
            position,
        }))

        let uploadedPublicId: string | undefined

        try {
            let logoUrl: string | undefined = existingLogoUrl ?? undefined
            let publicId: string | undefined = existingPublicId ?? undefined

            if (logoFile) {
                if (isEditMode && existingPublicId) {
                    await deleteFile(existingPublicId)
                }
                const uploaded = await uploadFile(logoFile)
                console.log('Upload response:', uploaded)
                logoUrl = uploaded.data?.url
                publicId = uploaded.data?.publicId
                uploadedPublicId = uploaded.data?.publicId
            }

            const payload: CompanyFormData = {
                name: values.name.trim(),
                email: values.email || undefined,
                phone: values.phone || undefined,
                address: values.address || undefined,
                serviceFee: normalizedServiceFee,
                status: values.status,
                companyAdmins,
                logoUrl,
                publicId,
            }

            if (isEditMode) {
                await updateMutation.mutateAsync({ id: companyId as string, payload })
            } else {
                await createMutation.mutateAsync(payload)
            }

            await queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.all })
            if (isEditMode) {
                await queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.detail(companyId as string) })
            }

            setToast({ type: 'success', message: isEditMode ? t('messages.company_updated') : t('messages.company_created') })
            navigate({ to: '/admin/companies' })
        } catch (error) {
            if (!isEditMode && uploadedPublicId) {
                await deleteFile(uploadedPublicId).catch(() => undefined)
            }
            setToast({ type: 'error', message: t('messages.unexpected_error') })
        }
    })

    return {
        form,
        isEditMode,
        isLoadingCompany: companyQuery.isLoading,
        isLoadingAdmins: adminsQuery.isLoading,
        existingAdmins,
        removeExistingAdmin,
        pendingFields: fields,
        appendPendingAdmin: () => append({ adminId: '', position: BusCompanyAdminPosition.OWNER }),
        removePendingAdmin: remove,
        logoPreviewUrl,
        logoFile,
        existingLogoUrl,
        logoError,
        handleLogoSelect,
        handleLogoRemove,
        availableAdmins,
        onSubmit,
        isSubmitting,
        toast,
        setToast,
    }
}
