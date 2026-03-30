import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { RevenueTab } from './components/RevenueTab'
import { SettlementsTab } from './components/SettlementsTab'

export const AdminRevenuePage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'pages.revenue' })
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('admin_title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('admin_description')}</p>
                </div>
                <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" /> {t('export_report')}
                </Button>
            </div>

            <Tabs defaultValue="revenue">
                <TabsList>
                    <TabsTrigger value="revenue">{t('tab_revenue')}</TabsTrigger>
                    <TabsTrigger value="settlements">{t('tab_settlements')}</TabsTrigger>
                </TabsList>
                <TabsContent value="revenue"><RevenueTab /></TabsContent>
                <TabsContent value="settlements"><SettlementsTab /></TabsContent>
            </Tabs>
        </div>
    )
}
