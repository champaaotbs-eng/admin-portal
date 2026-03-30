import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import type { IAdmin } from 'types/admin'

interface PendingAdminRowProps {
    index: number
    adminOptions: IAdmin[]
    control: Control<any>
    onRemove: () => void
    isLoadingAdmins: boolean
}

/**
 * Render one pending assigned-admin row for company form.
 */
export const CompanyAdminRow = ({
    index,
    adminOptions,
    control,
    onRemove,
    isLoadingAdmins,
}: PendingAdminRowProps) => {
    return (
        <div className="flex flex-col gap-3 md:flex-row">
            <Controller
                name={`pendingAdmins.${index}.adminId`}
                control={control}
                render={({ field, fieldState }) => (
                    <div className="flex-1">
                        <select
                            {...field}
                            disabled={isLoadingAdmins}
                            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Select admin</option>
                            {adminOptions.map((admin) => (
                                <option key={admin.adminId} value={admin.adminId}>
                                    {admin.fullName} ({admin.username ?? '—'})
                                </option>
                            ))}
                        </select>
                        {fieldState.error ? <p className="mt-1 text-xs text-rose-600">{fieldState.error.message}</p> : null}
                    </div>
                )}
            />

            <Controller
                name={`pendingAdmins.${index}.position`}
                control={control}
                render={({ field, fieldState }) => (
                    <div className="flex-1">
                        <input
                            {...field}
                            type="text"
                            placeholder="e.g. Manager, Supervisor"
                            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        {fieldState.error ? <p className="mt-1 text-xs text-rose-600">{fieldState.error.message}</p> : null}
                    </div>
                )}
            />

            <button
                type="button"
                onClick={onRemove}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                aria-label="Remove admin row"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    )
}
