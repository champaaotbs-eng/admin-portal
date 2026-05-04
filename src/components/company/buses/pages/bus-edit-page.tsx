import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/loading-spinner'
import { VehicleForm } from '../components/VehicleForm'
import { useBusForm } from '../hooks/use-bus-form'
import { getBusById } from 'services/company/bus.service'
import type { FleetItem } from '../data'

interface BusEditPageProps {
    busId: string
}

const mapSeatLayoutForForm = (seatLayout: FleetItem['seatLayout']) => {
    if (!seatLayout) {
        return undefined
    }

    return {
        ...seatLayout,
        rows: String(seatLayout.rows),
        columns: String(seatLayout.columns),
    }
}

export const BusEditPage = ({ busId }: BusEditPageProps) => {
    const navigate = useNavigate()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.buses' })
    const { handleSubmit, isSubmitting } = useBusForm({ busId })

    const { data: bus, isLoading } = useQuery({
        queryKey: ['bus', busId],
        queryFn: () => getBusById(busId),
    })

    if (isLoading) {
        return <LoadingSpinner />
    }

    if (!bus) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate({ to: '/company/fleet' })}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-destructive">{t('errors.bus_not_found') || 'Bus not found'}</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate({ to: '/company/fleet' })}
                    className="h-8 w-8 p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">{t('edit_bus_title')}</h1>
            </div>

            <Card className="p-6">
                <VehicleForm
                    defaultValues={{
                        code: bus.busCode,
                        plate: bus.licensePlate,
                        name: bus.busName,
                        type: bus.busType,
                        seatLayout: mapSeatLayoutForForm(bus.seatLayout),
                        description: bus.description,
                    }}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate({ to: '/company/fleet' })}
                    isSubmitting={isSubmitting}
                />
            </Card>
        </div>
    )
}
