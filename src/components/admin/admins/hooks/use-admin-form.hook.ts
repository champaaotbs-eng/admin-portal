import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import type { IRole } from 'types/role'
import { createAdmin, getAdminById, updateAdmin } from 'services/admins/admin.service'
import { getAllRoles } from 'services/admins/roles.service'
import { ADMIN_QUERY_KEYS } from '../constants/admin-query-keys.constant'
import { ROLE_QUERY_KEYS } from 'components/admin/roles/constants/role-query-keys.constant'

export interface AdminFormValues {
    username: string
    fullName: string
    roleId: string
    password: string
    confirmPassword: string
    isActive: boolean
}

interface UseAdminFormProps {
    adminId?: string
}

const DEFAULT_VALUES: AdminFormValues = {
    username: '',
    fullName: '',
    roleId: '',
    password: '',
    confirmPassword: '',
    isActive: true,
}

const toErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (typeof error === 'object' && error !== null && 'message' in error) {
        const message = (error as { message?: unknown }).message
        if (typeof message === 'string') return message
    }

    return fallbackMessage
}

/**
 * Handle add/edit admin form state, validation, data loading and mutations.
 */
export const useAdminForm = ({ adminId }: UseAdminFormProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.admins' })
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const isEditMode = Boolean(adminId)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    const formSchema = useMemo(() => {
        const base = z.object({
            username: z
                .string()
                .min(3, t('validation.username_min'))
                .regex(/^\S+$/, t('validation.username_no_spaces')),
            fullName: z.string().min(2, t('validation.full_name_min')),
            roleId: z.string().min(1, t('validation.role_required')),
            password: z.string(),
            confirmPassword: z.string(),
            isActive: z.boolean(),
        })

        if (!isEditMode) {
            return base.superRefine((values, ctx) => {
                if (values.password.length < 8) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('validation.password_min'),
                        path: ['password'],
                    })
                }

                if (!values.confirmPassword) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('validation.confirm_password_required'),
                        path: ['confirmPassword'],
                    })
                }

                if (values.confirmPassword !== values.password) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: t('validation.confirm_password_mismatch'),
                        path: ['confirmPassword'],
                    })
                }
            })
        }

        return base.superRefine((values, ctx) => {
            if (values.password && values.password.length < 8) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t('validation.password_min'),
                    path: ['password'],
                })
            }

            if (values.password && !values.confirmPassword) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t('validation.confirm_password_required_on_change'),
                    path: ['confirmPassword'],
                })
            }

            if (values.password && values.confirmPassword !== values.password) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: t('validation.confirm_password_mismatch'),
                    path: ['confirmPassword'],
                })
            }
        })
    }, [isEditMode, t])

    const form = useForm<AdminFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: DEFAULT_VALUES,
        mode: 'onChange',
    })

    const adminQuery = useQuery({
        queryKey: ADMIN_QUERY_KEYS.detail(adminId ?? ''),
        queryFn: async () => {
            const response = await getAdminById(adminId as string)
            return response.data
        },
        enabled: isEditMode,
    })

    const rolesQuery = useQuery({
        queryKey: ROLE_QUERY_KEYS.all,
        queryFn: () => getAllRoles({ page: 1, limit: 1000, filters: {} }),
        select: (response) => response.data?.result ?? [],
    })

    const roles = rolesQuery.data ?? []

    useEffect(() => {
        const admin = adminQuery.data
        if (!isEditMode || !admin) return

        form.reset({
            username: admin.username ?? '',
            fullName: admin.fullName ?? '',
            roleId: admin.role?.roleId ?? '',
            password: '',
            confirmPassword: '',
            isActive: (admin as { isActive?: boolean }).isActive ?? true,
        })
    }, [adminQuery.data, form, isEditMode])

    const createMutation = useMutation({
        mutationFn: createAdmin,
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateAdmin(id, payload),
    })

    const isSubmitting = createMutation.isPending || updateMutation.isPending

    const buildPayload = useCallback(
        (values: AdminFormValues): Record<string, unknown> => {
            const selectedRole = roles.find((role) => role.roleId === values.roleId)

            if (isEditMode) {
                const payload: Record<string, unknown> = {
                    role: selectedRole,
                    isActive: values.isActive,
                }

                if (values.password.trim()) {
                    payload.password = values.password
                }

                return payload
            }

            return {
                username: values.username,
                fullName: values.fullName,
                role: selectedRole,
                password: values.password,
                isActive: values.isActive,
            }
        },
        [isEditMode, roles],
    )

    const onSubmit = form.handleSubmit(async (values) => {
        try {
            const payload = buildPayload(values)

            if (isEditMode && adminId) {
                await updateMutation.mutateAsync({ id: adminId, payload })
            } else {
                await createMutation.mutateAsync(payload)
            }

            await queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.all })
            if (adminId) {
                await queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.detail(adminId) })
            }

            setToast({
                type: 'success',
                message: isEditMode ? t('messages.update_success') : t('messages.create_success'),
            })
            navigate({ to: '/admin/admins' })
        } catch (error) {
            setToast({
                type: 'error',
                message: toErrorMessage(error, t('messages.save_failed')),
            })
        }
    })

    const toggleShowPassword = () => setShowPassword((previous) => !previous)
    const toggleShowConfirmPassword = () => setShowConfirmPassword((previous) => !previous)

    return {
        form,
        isEditMode,
        isLoadingAdmin: adminQuery.isLoading,
        roles: roles as IRole[],
        isLoadingRoles: rolesQuery.isLoading,
        showPassword,
        showConfirmPassword,
        toggleShowPassword,
        toggleShowConfirmPassword,
        onSubmit,
        isSubmitting,
        toast,
        setToast,
    }
}
