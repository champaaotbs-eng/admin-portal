import { useState } from 'react'
import { Plus, Pencil, Search, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils/format'
import { useAdminAccountsTab } from '../hooks/use-admin-accounts-tab'

export const AdminAccountsTab = () => {
    const [search, setSearch] = useState('')
    const { t, filtered } = useAdminAccountsTab({ search })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder={t('search_admin_placeholder')}
                        className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <Button size="sm">
                    <Plus className="h-4 w-4" /> {t('add_admin')}
                </Button>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.name')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.email')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.role')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.status')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('table.created_at')}</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(admin => (
                            <tr key={admin.id} className="border-t border-border hover:bg-muted/30">
                                <td className="px-4 py-3 font-medium">{admin.fullName}</td>
                                <td className="px-4 py-3 text-muted-foreground">{admin.username}</td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                        <ShieldCheck className="h-3 w-3" />
                                        {admin.roleName}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={admin.isActive ? 'success' : 'destructive'} className="text-xs">
                                        {admin.isActive ? t('status_active') : t('status_locked')}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(admin.createdAt)}</td>
                                <td className="px-4 py-3">
                                    <button className="text-muted-foreground hover:text-foreground p-1">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
