import { useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { VehicleForm } from '../components/VehicleForm'
import { defaultSeatLayoutValue } from '../validation-schema'
import { useBusForm } from '../hooks/use-bus-form'

export const BusAddPage = () => {
    const navigate = useNavigate()
    const { t } = useTranslation('translation', { keyPrefix: 'pages.buses' })
    const { handleSubmit, isSubmitting } = useBusForm({})

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
                <h1 className="text-2xl font-bold">{t('add_bus_title')}</h1>
            </div>

            <Card className="p-6">
                <VehicleForm
                    defaultValues={{
                        code: '',
                        plate: '',
                        name: '',
                        seatLayout: defaultSeatLayoutValue,
                        description: '',
                    }}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate({ to: '/company/fleet' })}
                    isSubmitting={isSubmitting}
                />
            </Card>
        </div>
    )
}
