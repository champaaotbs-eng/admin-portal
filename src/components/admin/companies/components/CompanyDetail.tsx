import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Building2, X, CheckCircle2, Bus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { HorizontalBarChart } from '@/components/ui/charts'
import {
    addCompanyAdmin,
    getAllAdmins,
    getCompanyAdmins,
    removeCompanyAdmin,
    type BusCompanyAdminApiItem,
} from '@/services/company/bus-company.service'
import { formatDate, formatVnd } from '@/utils/format'
import type { BusCompany } from '@/types'

interface CompanyDetailProps {
    company: BusCompany
    onClose: () => void
}

export const CompanyDetail = ({ company, onClose }: CompanyDetailProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.companies' })
    const qc = useQueryClient()
    const [selectedAdminId, setSelectedAdminId] = useState('')
    const [selectedPosition, setSelectedPosition] = useState<'OWNER' | 'STAFF'>('STAFF')

    const { data: admins = [] } = useQuery({
        queryKey: ['admin', 'companies', company.id, 'admins'],
        queryFn: () => getCompanyAdmins(company.id),
    })

    const { data: allAdmins = [] } = useQuery({
        queryKey: ['admin', 'all-admins'],
        queryFn: getAllAdmins,
    })

    const assignAdminMutation = useMutation({
        mutationFn: () => addCompanyAdmin(company.id, {
            adminId: selectedAdminId,
            position: selectedPosition,
        }),
        onSuccess: () => {
            setSelectedAdminId('')
            setSelectedPosition('STAFF')
            qc.invalidateQueries({ queryKey: ['admin', 'companies', company.id, 'admins'] })
        },
    })

    const removeAdminMutation = useMutation({
        mutationFn: (adminId: string) => removeCompanyAdmin(company.id, adminId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'companies', company.id, 'admins'] })
        },
    })

    const assignedAdminIds = useMemo(() => new Set(admins.map(a => a.adminId)), [admins])
    const selectableAdmins = useMemo(() => {
        return allAdmins.filter(a => a.isActive && !assignedAdminIds.has(a.adminId))
    }, [allAdmins, assignedAdminIds])
    const revenueData = [
        { label: 'T1', value: 45_000_000 }, { label: 'T2', value: 62_000_000 },
        { label: 'T3', value: 58_000_000 }, { label: 'T4', value: 71_000_000 },
        { label: 'T5', value: 83_000_000 }, { label: 'T6', value: 95_000_000 },
    ]

    const getPositionLabel = (admin: BusCompanyAdminApiItem) => {
        return admin.position === 'OWNER' ? t('detail_position_owner') : t('detail_position_staff')
    }

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40" onClick={onClose} />
            <div className="w-full max-w-2xl bg-background border-l border-border flex flex-col h-full overflow-y-auto">
                <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">{company.name}</h2>
                            <p className="text-xs text-muted-foreground">{company.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6">
                    <Tabs defaultValue="info">
                        <TabsList>
                            <TabsTrigger value="info">{t('detail_tab_info')}</TabsTrigger>
                            <TabsTrigger value="admins">{t('detail_tab_admins')}</TabsTrigger>
                            <TabsTrigger value="fleet">{t('detail_tab_fleet')}</TabsTrigger>
                            <TabsTrigger value="revenue">{t('detail_tab_revenue')}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="info">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {[
                                    { label: t('detail_info_name'), value: company.name },
                                    { label: t('table.email'), value: company.email },
                                    { label: t('detail_info_phone'), value: company.phone },
                                    { label: t('detail_info_fee'), value: `${company.serviceFee}%` },
                                    { label: t('detail_info_created'), value: formatDate(company.createdAt) },
                                    { label: t('detail_info_status'), value: company.isActive ? t('detail_status_active') : t('detail_status_inactive') },
                                ].map(f => (
                                    <div key={f.label} className="bg-muted/30 rounded-lg p-3">
                                        <p className="text-xs text-muted-foreground mb-1">{f.label}</p>
                                        <p className="text-sm font-medium">{f.value}</p>
                                    </div>
                                ))}
                                <div className="sm:col-span-2 bg-muted/30 rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground mb-1">{t('detail_info_address')}</p>
                                    <p className="text-sm font-medium">{company.address}</p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="admins">
                            <div className="space-y-3">
                                <div className="rounded-lg border border-border p-3 space-y-3">
                                    <p className="text-sm font-medium">{t('assign_admin', { defaultValue: 'Assign admin' })}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <select
                                            value={selectedAdminId}
                                            onChange={(e) => setSelectedAdminId(e.target.value)}
                                            className="h-9 rounded-md border border-input bg-background px-3 text-sm sm:col-span-2"
                                        >
                                            <option value="">{t('select_admin', { defaultValue: 'Select admin' })}</option>
                                            {selectableAdmins.map(admin => (
                                                <option key={admin.adminId} value={admin.adminId}>
                                                    {admin.fullName} (@{admin.username})
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={selectedPosition}
                                            onChange={(e) => setSelectedPosition(e.target.value as 'OWNER' | 'STAFF')}
                                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                        >
                                            <option value="OWNER">{t('detail_position_owner')}</option>
                                            <option value="STAFF">{t('detail_position_staff')}</option>
                                        </select>
                                    </div>
                                    <Button
                                        size="sm"
                                        disabled={!selectedAdminId}
                                        loading={assignAdminMutation.isPending}
                                        onClick={() => assignAdminMutation.mutate()}
                                    >
                                        {t('add_admin', { defaultValue: 'Add admin' })}
                                    </Button>
                                </div>

                                {admins.length > 0 ? admins.map(a => (
                                    <div key={`${a.companyId}-${a.adminId}`} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                {a.fullName?.[0] ?? '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{a.fullName || a.adminId}</p>
                                                <p className="text-xs text-muted-foreground">@{a.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={a.position === 'OWNER' ? 'default' : 'secondary'}>
                                                {getPositionLabel(a)}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                loading={removeAdminMutation.isPending}
                                                onClick={() => removeAdminMutation.mutate(a.adminId)}
                                            >
                                                {t('remove_admin', { defaultValue: 'Remove' })}
                                            </Button>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">{t('detail_no_admins')}</p>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="fleet">
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {[
                                    { icon: Bus, label: t('detail_fleet_total'), value: 8, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                    { icon: Building2, label: t('detail_fleet_routes'), value: 5, color: 'text-green-500', bg: 'bg-green-500/10' },
                                    { icon: CheckCircle2, label: t('detail_fleet_trips'), value: 12, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                ].map(s => {
                                    const Icon = s.icon
                                    return (
                                        <div key={s.label} className="bg-muted/30 rounded-lg p-4 text-center">
                                            <div className={`mx-auto mb-2 h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                                                <Icon className={`h-4 w-4 ${s.color}`} />
                                            </div>
                                            <p className="text-2xl font-bold">{s.value}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </TabsContent>

                        <TabsContent value="revenue">
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {[
                                    { label: t('detail_revenue_gross'), value: formatVnd(95_000_000), color: 'text-blue-500' },
                                    { label: t('detail_revenue_commission', { rate: company.serviceFee }), value: formatVnd(4_750_000), color: 'text-red-500' },
                                    { label: t('detail_revenue_net'), value: formatVnd(90_250_000), color: 'text-green-500' },
                                ].map(s => (
                                    <div key={s.label} className="bg-muted/30 rounded-lg p-3 text-center">
                                        <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                                        <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                                    </div>
                                ))}
                            </div>
                            <HorizontalBarChart data={revenueData} formatValue={formatVnd} color="#3b82f6" />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
