import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { AlertTriangle, MapPin, Pencil, Power, PowerOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/shared/confirmation-modal'
import { useToggleStationActive } from '../hooks/use-stations'
import type { IStation } from 'types/station'

interface IStationsTableProps {
    stations: IStation[]
    isLoading: boolean
    isError: boolean
    errorMessage?: string
    page: number
    limit: number
    totalItems: number
    totalPages: number
    onPageChange: (page: number) => void
    onRetry: () => void
    onEdit: (station: IStation) => void
}

export const StationsTable = ({
    stations,
    isLoading,
    isError,
    errorMessage,
    page,
    limit,
    totalItems,
    totalPages,
    onPageChange,
    onRetry,
    onEdit,
}: IStationsTableProps) => {
    const { t } = useTranslation()
    const [confirmTarget, setConfirmTarget] = useState<IStation | null>(null)
    const { toggle, isPending } = useToggleStationActive()

    const pagingText = useMemo(() => {
        if (totalItems === 0) {
            return t('common.no_results')
        }

        const start = (page - 1) * limit + 1
        const end = Math.min(page * limit, totalItems)

        return t('common.showing', { shown: `${start}-${end}`, total: totalItems })
    }, [limit, page, t, totalItems])

    const handleConfirmToggle = () => {
        if (!confirmTarget) {
            return
        }

        toggle(confirmTarget)
        setConfirmTarget(null)
    }

    if (isError) {
        return (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                <div className="mb-3 flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-sm font-medium">{errorMessage ?? t('errors.internal_server_error')}</p>
                </div>
                <Button type="button" variant="outline" onClick={onRetry}>
                    {t('common.retry', { defaultValue: 'Retry' })}
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <table className="w-full min-w-[920px] text-sm">
                    <thead className="bg-muted/40">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('stations.col_name')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('stations.col_address')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('stations.col_province')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('stations.col_coordinates')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('stations.col_status')}</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">{t('stations.col_created_at')}</th>
                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t('stations.col_actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, index) => (
                                <tr key={`skeleton-${index}`} className="border-t border-border">
                                    <td colSpan={7} className="px-4 py-3">
                                        <div className="h-8 w-full animate-pulse rounded bg-muted/70" />
                                    </td>
                                </tr>
                            ))
                            : null}

                        {!isLoading && stations.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-16 text-center">
                                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-muted-foreground">
                                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                            <MapPin className="h-7 w-7" />
                                        </span>
                                        <p className="text-sm">{t('stations.empty_state')}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : null}

                        {!isLoading
                            ? stations.map((station) => (
                                <tr key={station.locationId} className="border-t border-border hover:bg-muted/20">
                                    <td className="px-4 py-3 font-medium">{station.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{station.address}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{station.provinceCode}</td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                        {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={station.isActive ? 'success' : 'secondary'}>
                                            {station.isActive ? t('stations.status_active') : t('stations.status_inactive')}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {dayjs(station.createdAt).format('DD/MM/YYYY')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => onEdit(station)}
                                                className="rounded p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                aria-label={t('common.edit')}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setConfirmTarget(station)}
                                                className="rounded p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                aria-label={station.isActive ? t('stations.status_inactive') : t('stations.status_active')}
                                            >
                                                {station.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                            : null}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>{pagingText}</span>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        disabled={page <= 1}
                    >
                        {t('common.prev')}
                    </Button>
                    <span>{t('common.page', { page, total: Math.max(1, totalPages) })}</span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                        disabled={page >= totalPages}
                    >
                        {t('common.next')}
                    </Button>
                </div>
            </div>

            <ConfirmationModal
                open={Boolean(confirmTarget)}
                title={t('stations.col_actions')}
                description={confirmTarget?.isActive ? t('stations.confirm_deactivate') : t('stations.confirm_activate')}
                confirmLabel={confirmTarget?.isActive ? t('stations.deactivate_action') : t('stations.activate_action')}
                cancelLabel={t('common.cancel')}
                onConfirm={handleConfirmToggle}
                onClose={() => setConfirmTarget(null)}
                loading={isPending}
                destructive={Boolean(confirmTarget?.isActive)}
            />
        </div>
    )
}
