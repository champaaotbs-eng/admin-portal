import { useState } from 'react'
import { Plus, Pencil, ShieldCheck, ChevronRight, Search, UserCog, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/utils/cn'
import { useTranslation } from 'react-i18next'
import { RoleForm } from './components/RoleForm'
import { AdminAccountsTab } from './components/AdminAccountsTab'
import { PermissionModulesTab } from './components/PermissionModulesTab'
import { useRolesPage } from './hooks/use-roles-page'
import type { Role } from '@/services/roles.service'

export const AdminRolesPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.roles' })
    const { t: tCommon } = useTranslation()

    const [search, setSearch] = useState('')
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    const [pendingPerms, setPendingPerms] = useState<Set<string> | null>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null)
    const [editTarget, setEditTarget] = useState<Role | null>(null)

    const {
        isLoading, filteredRoles, permissionsByModule,
        hasUnsavedChanges, isSaving, defaultValues,
        selectRole, togglePermission, savePermissions,
        openCreate, openEdit, closeDialog, handleFormSubmit, permMutation,
    } = useRolesPage({ search, selectedRole, setSelectedRole, pendingPerms, setPendingPerms, dialogMode, setDialogMode, editTarget, setEditTarget })

    if (isLoading) return <div className="text-muted-foreground">{tCommon('common.loading')}</div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">{t('description')}</p>
            </div>

            <Tabs defaultValue="roles">
                <TabsList>
                    <TabsTrigger value="roles" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> {t('roles_section')}
                    </TabsTrigger>
                    <TabsTrigger value="accounts" className="flex items-center gap-2">
                        <UserCog className="h-4 w-4" /> {t('admin_accounts')}
                    </TabsTrigger>
                    <TabsTrigger value="modules" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" /> {t('permissions_modules')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="roles">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold">{t('roles_section')}</h2>
                                <Button onClick={openCreate} size="sm" variant="outline">
                                    <Plus className="h-4 w-4" />
                                    {t('add_role')}
                                </Button>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder={t('search_placeholder')}
                                    className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div className="rounded-lg border border-border overflow-hidden">
                                {filteredRoles.length === 0 ? (
                                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">{t('no_results')}</p>
                                ) : (
                                    filteredRoles.map(role => (
                                        <button
                                            key={role.id}
                                            onClick={() => selectRole(role)}
                                            className={cn(
                                                'w-full flex items-center justify-between px-4 py-3 text-left text-sm border-b border-border last:border-0 hover:bg-accent transition-colors',
                                                selectedRole?.id === role.id && 'bg-primary/10',
                                            )}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{role.name}</span>
                                                    {role.isSystem && (
                                                        <Badge variant="secondary" className="text-xs py-0">{t('system_role')}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{role.description}</p>
                                            </div>
                                            <div className="flex items-center gap-1 ml-2 shrink-0">
                                                {!role.isSystem && (
                                                    <span
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={e => openEdit(role, e)}
                                                        onKeyDown={e => { if (e.key === 'Enter') openEdit(role, e) }}
                                                        title={tCommon('common.edit')}
                                                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </span>
                                                )}
                                                <ChevronRight className={cn(
                                                    'h-4 w-4 text-muted-foreground transition-transform',
                                                    selectedRole?.id === role.id && 'rotate-90 text-primary',
                                                )} />
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {selectedRole ? (
                                <>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="font-semibold flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4 text-primary" />
                                                {t('permissions_for', { role: selectedRole.name })}
                                            </h2>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {(pendingPerms ?? new Set(selectedRole.permissions)).size}{' '}{t('permissions_count')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {hasUnsavedChanges && (
                                                <span className="text-xs text-amber-600 dark:text-amber-400">{t('unsaved_changes')}</span>
                                            )}
                                            <Button
                                                size="sm"
                                                onClick={savePermissions}
                                                loading={permMutation.isPending}
                                                disabled={!hasUnsavedChanges}
                                            >
                                                {tCommon('common.save')}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {Array.from(permissionsByModule.entries()).map(([module, perms]) => (
                                            <div key={module} className="rounded-lg border border-border p-4 space-y-3">
                                                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                    {module}
                                                </h3>
                                                <div className="space-y-2">
                                                    {perms.map(perm => {
                                                        const checked = pendingPerms?.has(perm.key) ?? selectedRole.permissions.includes(perm.key)
                                                        return (
                                                            <label key={perm.key} className="flex items-start gap-3 cursor-pointer group">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    onChange={() => togglePermission(perm.key)}
                                                                    className="mt-0.5 h-4 w-4 rounded border-input accent-primary cursor-pointer"
                                                                />
                                                                <div>
                                                                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                                                        {perm.label}
                                                                    </span>
                                                                    <p className="text-xs text-muted-foreground">{perm.description}</p>
                                                                </div>
                                                            </label>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
                                    <div className="text-center">
                                        <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground/40" />
                                        <p className="mt-2 text-sm text-muted-foreground">{t('select_role_hint')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Dialog
                        open={dialogMode !== null}
                        onClose={closeDialog}
                        title={dialogMode === 'create' ? t('add_role_form_title') : t('edit_role_form_title')}
                    >
                        <RoleForm
                            key={editTarget?.id ?? 'create'}
                            defaultValues={defaultValues}
                            onSubmit={handleFormSubmit}
                            onCancel={closeDialog}
                            isSaving={isSaving}
                        />
                    </Dialog>
                </TabsContent>

                <TabsContent value="accounts">
                    <AdminAccountsTab />
                </TabsContent>

                <TabsContent value="modules">
                    <PermissionModulesTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
