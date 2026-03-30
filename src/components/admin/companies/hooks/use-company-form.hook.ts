import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useFieldArray, useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { IAdmin } from 'types/admin'
import { BusCompanyStatus, type ICompany } from 'types/company'
import { getAllAdmins } from 'services/admins/admin.service'
import { addAdmin, createCompany, getCompanyById, removeAdmin, updateCompany } from 'services/admins/company.service'
import { deleteFile, uploadFile } from 'services/upload-file.service'
import { ADMIN_QUERY_KEYS } from 'components/admin/admins/constants/admin-query-keys.constant'
import { COMPANY_QUERY_KEYS } from '../constants/company-query-keys.constant'

interface PendingAdminRow {
    adminId: string
    position: string
}

interface ExistingCompanyAdmin {
    adminId: string
    fullName: string
    username: string
    position: string
}

export interface CompanyFormValues {
    name: string
    email: string
    phone: string
    address: string
    serviceFee: number
    status: BusCompanyStatus
    pendingAdmins: PendingAdminRow[]
}

interface UseCompanyFormProps {
    companyId?: string
}

const DEFAULT_VALUES: CompanyFormValues = {
    name: '',
    email: '',
    phone: '',
    address: '',
    serviceFee: 0,
    status: BusCompanyStatus.ACTIVE,
    pendingAdmins: [{ adminId: '', position: '' }],
}

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * Manage create/edit company form state, upload flow, and admin assignments.
 */
export const useCompanyForm = ({ companyId }: UseCompanyFormProps) => {
    const isEditMode = Boolean(companyId)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const form = useForm<CompanyFormValues>({
        defaultValues: DEFAULT_VALUES,
        mode: 'onChange',
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'pendingAdmins',
    })

    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)
    const [logoError, setLogoError] = useState<string | undefined>(undefined)
    const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null)
    const [existingPublicId, setExistingPublicId] = useState<string | null>(null)
    const [existingAdmins, setExistingAdmins] = useState<ExistingCompanyAdmin[]>([])
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const companyQuery = useQuery({
        queryKey: COMPANY_QUERY_KEYS.detail(companyId ?? ''),
        queryFn: async () => {
            const response = await getCompanyById(companyId as string)
            return response.data as ICompany & {
                admins?: ExistingCompanyAdmin[]
                logoPublicId?: string
            }
        },
        enabled: isEditMode,
    })

    const adminsQuery = useQuery({
        queryKey: ADMIN_QUERY_KEYS.all,
        queryFn: () => getAllAdmins({ page: 1, limit: 1000, filters: {} }),
        select: (response) => {
            const payload = response.data as { results?: IAdmin[]; result?: IAdmin[] }
            return payload.results ?? payload.result ?? []
        },
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
            pendingAdmins: [],
        })

        setExistingAdmins(companyQuery.data.admins ?? [])
        setExistingLogoUrl(companyQuery.data.logoUrl ?? null)
        setExistingPublicId(companyQuery.data.logoPublicId ?? null)
    }, [companyQuery.data, form])

    useEffect(() => {
        return () => {
            if (logoPreviewUrl) {
                URL.revokeObjectURL(logoPreviewUrl)
            }
        }
    }, [logoPreviewUrl])

    const removeAdminMutation = useMutation({
        mutationFn: ({ adminId }: { adminId: string }) => removeAdmin(companyId as string, adminId),
        onMutate: ({ adminId }) => {
            setExistingAdmins((previous) => previous.filter((admin) => admin.adminId !== adminId))
        },
        onError: () => {
            setExistingAdmins(companyQuery.data?.admins ?? [])
            setToast({ type: 'error', message: 'Failed to remove admin' })
        },
        onSuccess: () => {
            setToast({ type: 'success', message: 'Admin removed' })
        },
    })

    const createMutation = useMutation({ mutationFn: createCompany })
    const updateMutation = useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Partial<ICompany> }) => updateCompany(id, payload) })

    const isSubmitting = createMutation.isPending || updateMutation.isPending

    const handleLogoSelect = (file: File) => {
        setLogoError(undefined)

        if (!VALID_IMAGE_TYPES.includes(file.type)) {
            setLogoError('Only JPG, PNG, WEBP are allowed')
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            setLogoError('File size must be <= 5MB')
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
        const selectedPending = new Set(
            form
                .watch('pendingAdmins')
                .map((item) => item.adminId)
                .filter(Boolean),
        )
        const existingSet = new Set(existingAdmins.map((admin) => admin.adminId))

        return (adminsQuery.data ?? []).filter((admin) => !existingSet.has(admin.adminId) && !selectedPending.has(admin.adminId))
    }, [adminsQuery.data, existingAdmins, form])

    const onSubmit = form.handleSubmit(async (values) => {
        if (!values.name.trim()) {
            form.setError('name', { message: 'Company name is required' })
            return
        }

        if (values.name.trim().length < 2) {
            form.setError('name', { message: 'Company name must be at least 2 characters' })
            return
        }

        if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) {
            form.setError('email', { message: 'Invalid email format' })
            return
        }

        if (values.phone && !/^\d{10,11}$/.test(values.phone)) {
            form.setError('phone', { message: 'Phone must be 10-11 digits' })
            return
        }

        if (values.serviceFee < 0 || values.serviceFee > 100) {
            form.setError('serviceFee', { message: 'Service fee must be between 0 and 100' })
            return
        }

        let uploadedPublicId: string | undefined

        try {
            let logoUrl: string | undefined = existingLogoUrl ?? undefined

            if (logoFile) {
                if (isEditMode && existingPublicId) {
                    await deleteFile(existingPublicId)
                }
                const uploaded = await uploadFile(logoFile)
                logoUrl = uploaded.data?.url
                uploadedPublicId = uploaded.data?.publicId
            }

            const payload: Partial<ICompany> = {
                name: values.name,
                email: values.email || undefined,
                phone: values.phone || undefined,
                address: values.address || undefined,
                serviceFee: values.serviceFee,
                status: values.status,
                ...(logoUrl ? { logoUrl } : {}),
            }

            let resolvedCompanyId = companyId as string

            if (isEditMode) {
                await updateMutation.mutateAsync({ id: companyId as string, payload })
            } else {
                const created = await createMutation.mutateAsync(payload)
                resolvedCompanyId = created.data?.busCompanyId ?? ''
                if (!resolvedCompanyId) {
                    throw new Error('Created company id is missing')
                }
            }

            const validPending = values.pendingAdmins.filter((row) => row.adminId && row.position)
            await Promise.all(validPending.map((row) => addAdmin(resolvedCompanyId, row.adminId, row.position)))

            await queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.all })
            await queryClient.invalidateQueries({ queryKey: COMPANY_QUERY_KEYS.detail(resolvedCompanyId) })

            setToast({ type: 'success', message: isEditMode ? 'Company updated!' : 'Company created!' })
            navigate({ to: '/admin/companies' })
        } catch (error) {
            if (!isEditMode && uploadedPublicId) {
                await deleteFile(uploadedPublicId).catch(() => undefined)
            }
            setToast({ type: 'error', message: 'Something went wrong' })
        }
    })

    return {
        form,
        isEditMode,
        isLoadingCompany: companyQuery.isLoading,
        allAdmins: adminsQuery.data ?? [],
        isLoadingAdmins: adminsQuery.isLoading,
        existingAdmins,
        removeExistingAdmin: (adminId: string) => removeAdminMutation.mutate({ adminId }),
        isRemovingAdmin: removeAdminMutation.isPending,
        pendingFields: fields,
        appendPendingAdmin: () => append({ adminId: '', position: '' }),
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
