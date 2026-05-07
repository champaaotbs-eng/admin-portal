import { useState } from 'react'
import dayjs from 'dayjs'
import { Pencil, Power, PowerOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmationModal } from '@/components/shared/confirmation-modal'
import { PaginatedTable, type PaginatedTableColumn } from '@/components/shared/pagination-table'
import { useToggleStationActive } from '../hooks/use-toggle-station'
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

    const handleConfirmToggle = () => {
        if (!confirmTarget) return
        toggle(confirmTarget)
        setConfirmTarget(null)
    }

    if (isError) {
        return (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                <p className="mb-3 text-sm font-medium text-destructive">{errorMessage ?? t('errors.internal_server_error')}</p>
                <Button type="button" variant="outline" onClick={onRetry}>
                    {t('common.retry', { defaultValue: 'Retry' })}
                </Button>
            </div>
        )
    }

    const columns: PaginatedTableColumn<IStation>[] = [
        {
            id: 'name',
            header: t('stations.col_name'),
            renderCell: (s) => <span className="font-medium">{s.label}</span>,
        },
        {
            id: 'address',
            header: t('stations.col_address'),
            renderCell: (s) => s.address,
        },
        {
            id: 'province',
            header: t('stations.col_province'),
            renderCell: (s) => s.provinceCode,
        },
        {
            id: 'coordinates',
            header: t('stations.col_coordinates'),
            cellClassName: 'text-xs',
            renderCell: (s) => `${s.latitude}, ${s.longitude}`,
        },
        {
            id: 'status',
            header: t('stations.col_status'),
            renderCell: (s) => (
                <Badge variant={s.isActive ? 'success' : 'secondary'}>
                    {s.isActive ? t('stations.status_active') : t('stations.status_inactive')}
                </Badge>
            ),
        },
        {
            id: 'createdAt',
            header: t('stations.col_created_at'),
            renderCell: (s) => dayjs(s.createdAt).format('DD/MM/YYYY'),
        },
        {
            id: 'actions',
            header: t('stations.col_actions'),
            headerClassName: 'text-center',
            cellClassName: 'text-center',
            renderCell: (s) => (
                <div className="flex items-center justify-center gap-1">
                    <button
                        type="button"
                        onClick={() => onEdit(s)}
                        className="rounded p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        aria-label={t('common.edit')}
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setConfirmTarget(s)}
                        className="rounded p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        aria-label={s.isActive ? t('stations.status_inactive') : t('stations.status_active')}
                    >
                        {s.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </button>
                </div>
            ),
        },
    ]

    return (
        <>
            <PaginatedTable
                columns={columns}
                data={stations}
                rowKey={(s) => s.stationId}
                isLoading={isLoading}
                emptyMessage={t('stations.empty_state')}
                pagination={{
                    currentPage: page,
                    totalPages,
                    totalItems,
                    pageSize: limit,
                    onPageChange,
                }}
            />

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
        </>
    )
}
