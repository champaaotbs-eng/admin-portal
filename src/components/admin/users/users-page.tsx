import { useState } from 'react'
import { Plus, Search, ToggleLeft, ToggleRight, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { ROLE_I18N_KEYS } from '@/constants/roles'
import { formatDate } from '@/utils/format'
import { useTranslation } from 'react-i18next'
import { SortIcon } from './components/SortIcon'
import { UserForm } from './components/UserForm'
import { useUsersPage } from './hooks/use-users-page'
import type { SortKey, SortDir } from './hooks/use-users-page'
import type { User } from 'types/user'

export const AdminUsersPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.users' })
    const { t: tCommon } = useTranslation()

    const [search, setSearch] = useState('')
    const [sortKey, setSortKey] = useState<SortKey | null>(null)
    const [sortDir, setSortDir] = useState<SortDir>('asc')
    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
    const [editTarget, setEditTarget] = useState<User | null>(null)

    const {
        users, isLoading, filtered, isSaving, defaultValues,
        openCreate, openEdit, closeDialog, toggleSort, handleFormSubmit, toggleMutation,
    } = useUsersPage({ search, sortKey, setSortKey, sortDir, setSortDir, dialogMode, setDialogMode, editTarget, setEditTarget })

    if (isLoading) return <div className="text-muted-foreground">{tCommon('common.loading')}</div>

    const roleColor: Record<string, 'default' | 'warning' | 'secondary'> = {
        admin: 'default',
        bus_company: 'warning',
        customer: 'secondary',
    }

    const sortableColumns: [SortKey, string][] = [
        ['name', t('table.name')],
        ['email', t('table.email')],
        ['phone', t('table.phone')],
        ['role', t('table.role')],
        ['isActive', t('table.status')],
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('count_description', { count: users.length })}
                    </p>
                </div>
                <Button onClick={openCreate} size="sm">
                    <Plus className="h-4 w-4" />
                    {t('add_user')}
                </Button>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('search_placeholder')}
                    className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            {sortableColumns.map(([key, label]) => (
                                <th
                                    key={key}
                                    onClick={() => toggleSort(key)}
                                    className="cursor-pointer select-none px-4 py-3 text-left font-medium text-muted-foreground hover:text-foreground whitespace-nowrap"
                                >
                                    {label}
                                    <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
                                </th>
                            ))}
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                                {t('table.created_at')}
                            </th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((u) => (
                            <tr key={u.id} className="border-t border-border hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium">{u.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                                <td className="px-4 py-3">{u.phone ?? t('no_phone')}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={roleColor[u.role]}>
                                        {tCommon(`roles.${ROLE_I18N_KEYS[u.role]}`)}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={u.isActive ? 'success' : 'destructive'}>
                                        {u.isActive ? t('status_active') : t('status_locked')}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEdit(u)}
                                            title={tCommon('common.edit')}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => toggleMutation.mutate(u.id)}
                                            title={u.isActive ? t('lock_account') : t('unlock')}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            {u.isActive
                                                ? <ToggleRight className="h-5 w-5 text-green-500" />
                                                : <ToggleLeft className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                    {t('no_results')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Dialog
                open={dialogMode !== null}
                onClose={closeDialog}
                title={dialogMode === 'create' ? t('add_user_form_title') : t('edit_user_form_title')}
            >
                <UserForm
                    key={editTarget?.id ?? 'create'}
                    defaultValues={defaultValues}
                    onSubmit={handleFormSubmit}
                    onCancel={closeDialog}
                    isSaving={isSaving}
                    mode={dialogMode ?? 'create'}
                />
            </Dialog>
        </div>
    )
}
