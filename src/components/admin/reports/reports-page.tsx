import { useQuery } from '@tanstack/react-query'
import { getAllTickets } from '@/services/booking.service'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatVnd } from '@/utils/format'
import { useTranslation } from 'react-i18next'

const statusVariant = (s: string) => {
    const map: Record<string, 'default' | 'success' | 'secondary' | 'destructive' | 'warning'> = {
        pending: 'warning',
        confirmed: 'default',
        completed: 'success',
        cancelled: 'destructive',
    }
    return map[s] ?? 'secondary'
}

export function AdminReportsPage() {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.reports' })
    const { t: tCommon } = useTranslation()

    const { data: tickets = [], isLoading } = useQuery({
        queryKey: ['admin', 'tickets'],
        queryFn: getAllTickets,
    })

    if (isLoading) return <div className="text-muted-foreground">{tCommon('common.loading')}</div>

    const revenue = tickets
        .filter((tk) => tk.status === 'confirmed' || tk.status === 'completed')
        .reduce((s, tk) => s + tk.totalPrice, 0)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <p className="text-sm text-muted-foreground">
                    {t('count_description', { count: tickets.length })}{' '}
                    <span className="font-medium text-green-600">{formatVnd(revenue)}</span>
                </p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            {[
                                t('table.booking_code'),
                                t('table.passenger'),
                                t('table.phone'),
                                t('table.seat'),
                                t('table.total_amount'),
                                t('table.booking_date'),
                                t('table.status'),
                            ].map((h) => (
                                <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((tk) => (
                            <tr key={tk.id} className="border-t border-border hover:bg-muted/30">
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tk.id}</td>
                                <td className="px-4 py-3 font-medium">{tk.passengerName}</td>
                                <td className="px-4 py-3">{tk.passengerPhone}</td>
                                <td className="px-4 py-3">{tk.seatNumbers.join(', ')}</td>
                                <td className="px-4 py-3 font-medium">{formatVnd(tk.totalPrice)}</td>
                                <td className="px-4 py-3 text-muted-foreground">{formatDate(tk.createdAt, true)}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={statusVariant(tk.status)}>
                                        {tCommon(`status.${tk.status}`)}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
