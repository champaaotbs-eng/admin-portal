import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { createRole } from 'services/admins/roles.service'
import { getPermissionModulesByRoleType } from '../constants/permission.constant'
import { ROLE_QUERY_KEYS } from '../constants/role-query-keys.constant'
import { zodResolver } from '@hookform/resolvers/zod'
import { roleSchema, type TInsertRole } from '../validation-schema'
import { PermissionRow } from './permission-rows'
import { ToggleSwitch } from 'components/shared/toggle-switch'
import type { IPermissionFormItem } from '../type'
import type { IToastState } from 'types'
import { ADMIN_TYPE } from 'configs/constants'

interface IAddRoleFormProps {
    onSuccess?: () => void
    onCancel?: () => void
}

export const AddRoleForm = ({ onSuccess, onCancel }: IAddRoleFormProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.roles' })
    const [toast, setToast] = useState<IToastState | null>(null)
    const queryClient = useQueryClient()

    const roleTypeOptions = [
        { value: ADMIN_TYPE.SYSTEM_ADMIN, label: t('types.system_admin') },
        { value: ADMIN_TYPE.COMPANY_ADMIN, label: t('types.company_admin') },
    ]

    const buildPermissionsByType = (roleType: string, sourcePermissions: IPermissionFormItem[] = []): IPermissionFormItem[] => {
        return getPermissionModulesByRoleType(roleType).map(({ module }) => {
            const found = sourcePermissions.find((permission) => permission.module === module)

            return {
                module,
                read: found?.read ?? false,
                write: found?.write ?? false,
            }
        })
    }

    const createDefaultPermissions = (): IPermissionFormItem[] => buildPermissionsByType(ADMIN_TYPE.SYSTEM_ADMIN)

    const createRoleMutation = useMutation({
        mutationFn: (payload: TInsertRole) => createRole(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEYS.all })
        },
    })

    const isSubmitting = createRoleMutation.isPending

    const schema = roleSchema(t)
    const {
        control,
        register,
        watch,
        setValue,
        getValues,
        handleSubmit,
        formState: { errors },
    } = useForm<TInsertRole>({
        resolver: zodResolver(schema),
        defaultValues: {
            roleName: '',
            type: ADMIN_TYPE.SYSTEM_ADMIN,
            description: '',
            isActive: true,
            permissions: createDefaultPermissions(),
        },
        mode: 'onChange',
    })

    const { fields, update, replace } = useFieldArray({
        control,
        name: 'permissions',
    })

    const isActive = watch('isActive')
    const roleType = watch('type')
    const permissionModules = useMemo(() => getPermissionModulesByRoleType(roleType), [roleType])

    const toastClassName = useMemo(() => {
        if (!toast) return ''
        return toast.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-rose-200 bg-rose-50 text-rose-700'
    }, [toast])

    useEffect(() => {
        if (!toast) return
        const timer = window.setTimeout(() => setToast(null), 3000)
        return () => window.clearTimeout(timer)
    }, [toast])

    useEffect(() => {
        const currentPermissions = getValues('permissions') ?? []
        replace(buildPermissionsByType(roleType || ADMIN_TYPE.SYSTEM_ADMIN, currentPermissions))
    }, [getValues, replace, roleType])


    const handleReadChange = (index: number, checked: boolean) => {
        const current = fields[index]
        update(index, {
            ...current,
            read: checked,
            write: checked ? current.write : false,
        })
    }

    const handleWriteChange = (index: number, checked: boolean) => {
        const current = fields[index]
        if (!current.read) return

        update(index, {
            ...current,
            write: checked,
        })
    }

    const onSubmit = handleSubmit(async (values) => {
        try {
            await createRoleMutation.mutateAsync(values)

            setToast({
                type: 'success',
                message: t('messages.create_success'),
            })
            onSuccess?.()
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'message' in error) {
                const message = (error as { message?: unknown }).message
                if (typeof message === 'string') {
                    setToast({ type: 'error', message })
                } else {
                    setToast({ type: 'error', message: t('messages.save_failed') })
                }
            } else {
                setToast({ type: 'error', message: t('messages.save_failed') })
            }
        }
    })

    return (
        <>
            {toast ? (
                <div className="fixed right-4 top-4 z-50">
                    <div className={['rounded-md border px-4 py-3 text-sm shadow-md', toastClassName].join(' ')}>{toast.message}</div>
                </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-800">
                                    {t('form.name')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder={t('form.name_placeholder')}
                                    disabled={isSubmitting}
                                    className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    {...register('roleName', {
                                        required: t('form.validation.role_name_required'),
                                        minLength: { value: 2, message: t('form.validation.role_name_min') },
                                    })}
                                />
                                {errors.roleName ? <p className="mt-1 text-xs text-rose-600">{errors.roleName.message}</p> : null}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-800">
                                    {t('form.description')} <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={6}
                                    placeholder={t('form.description_placeholder')}
                                    disabled={isSubmitting}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    {...register('description', {
                                        required: t('form.validation.description_required'),
                                        minLength: { value: 5, message: t('form.validation.description_min') },
                                    })}
                                />
                                {errors.description ? <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p> : null}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-800">
                                    {t('form.type')} <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    disabled={isSubmitting}
                                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-[#f5f5f5]"
                                    {...register('type')}
                                >
                                    <option value="">{t('form.type_placeholder')}</option>
                                    {roleTypeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                {errors.type ? <p className="mt-1 text-xs text-rose-600">{errors.type.message}</p> : null}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-800">{t('form.active')}</span>
                                <ToggleSwitch
                                    checked={Boolean(isActive)}
                                    onChange={(checked) => setValue('isActive', checked, { shouldDirty: true })}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-semibold text-slate-800">
                            {t('form.permissions')} <span className="text-rose-500">*</span>
                        </h3>
                        <div className="overflow-hidden rounded-md border border-slate-200">
                            <div className="grid grid-cols-[minmax(0,1fr)_90px_90px] items-center bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <span>{t('detail.module')}</span>
                                <span className="text-center">{t('detail.read')}</span>
                                <span className="text-center">{t('detail.write')}</span>
                            </div>

                            {fields.map((field, index) => {
                                const config = permissionModules[index]
                                if (!config) return null

                                return (
                                    <PermissionRow
                                        key={field.id}
                                        label={t(`modules.${config.module}`)}
                                        hasWrite={config.hasWrite}
                                        readLabel={t('detail.read')}
                                        writeLabel={t('detail.write')}
                                        read={Boolean(field.read)}
                                        write={Boolean(field.write)}
                                        rowIndex={index}
                                        disabled={isSubmitting}
                                        onReadChange={(checked) => handleReadChange(index, checked)}
                                        onWriteChange={(checked) => handleWriteChange(index, checked)}
                                    />
                                )
                            })}
                        </div>
                    </section>
                </div>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        {t('actions.cancel')}
                    </Button>
                    <Button type="submit" loading={isSubmitting}>
                        {t('actions.save')}
                    </Button>
                </div>
            </form>
        </>
    )
}

