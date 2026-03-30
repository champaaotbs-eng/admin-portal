import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Search, ShieldCheck, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { formatDate } from '@/utils/format'
import { COMPANY_ROLE_COLORS } from '@/constants/colors'
import { COMPANY_ROLES } from './data'
import type { CompanyRole, StaffItem } from './data'
import { useStaffPage } from './hooks/use-staff-page'
import { StaffForm } from './components/StaffForm'

export const CompanyStaffPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.staff' })
    const { t: tCommon } = useTranslation()
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<CompanyRole | 'all'>('all')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selected, setSelected] = useState<StaffItem | null>(null)
    const {
        filtered, stats,
        openAdd, openEdit, closeDialog,
        hasFilter, clearFilters,
    } = useStaffPage({ search, setSearch, roleFilter, setRoleFilter, setDialogOpen, setSelected })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <Button onClick={openAdd}>
                    <Plus className="h-4 w-4" /> {t('add_staff')}
                </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">{t('stats.total')}</p>
                        <p className="text-3xl font-bold">{stats.total}</p>
                        <p className="text-xs text-green-600">{`${stats.active} ${t('stats.active_suffix')}`}</p>
                    </CardContent>
                </Card>
                {COMPANY_ROLES.map(r => (
                    <Card key={r}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{t(`roles.${r}`)}</p>
                            <p className="text-3xl font-bold">{stats.byRole[r]}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search_placeholder')}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="flex rounded-md border border-border overflow-hidden text-sm">
                    {(['all', ...COMPANY_ROLES] as const).map(r => (
                        <button key={r} onClick={() => setRoleFilter(r)}
                            className={`px-3 py-2 ${roleFilter === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                            {r === 'all' ? t('roles.all') : t(`roles.${r}`)}
                        </button>
                    ))}
                </div>
                {hasFilter && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.name')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.email')} / {t('table.phone')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.role')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.status')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.joined_at')}</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(s => (
                            <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                                            {s.name.split(' ').pop()?.charAt(0)}
                                        </span>
                                        <span className="font-medium">{s.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                    <div>{s.email}</div>
                                    <div>{s.phone}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${COMPANY_ROLE_COLORS[s.role]}`}>
                                        <ShieldCheck className="h-3 w-3" />
                                        {t(`roles.${s.role}`)}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={s.isActive ? 'success' : 'secondary'} className="text-xs">
                                        {s.isActive ? tCommon('status.active') : tCommon('status.inactive')}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(s.joinedAt)}</td>
                                <td className="px-4 py-3">
                                    <button onClick={() => openEdit(s)}
                                        className="text-muted-foreground hover:text-foreground p-1">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-10 text-center text-muted-foreground">
                                    {tCommon('common.no_results')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Dialog open={dialogOpen} onClose={closeDialog} title={selected ? t('edit_staff_title') : t('add_staff_title')}>
                <StaffForm
                    mode={selected ? 'edit' : 'create'}
                    defaultValues={selected ? { name: selected.name, email: selected.email, phone: selected.phone, role: selected.role } : undefined}
                    onSubmit={closeDialog}
                    onCancel={closeDialog}
                />
            </Dialog>
        </div>
    )
}
