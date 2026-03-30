import { Bus, Ticket, DollarSign, TrendingUp, MapPin, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, DonutChart, HorizontalBarChart } from '@/components/ui/charts'
import { MOCK_DAILY_REVENUES } from '@/data/mock-extended'
import { formatVnd } from '@/utils/format'
import { useCompanyDashboard } from './hooks/use-company-dashboard'

const FLEET_STATS = [
    { label: 'Xe hoat dong', value: 18, color: 'text-green-500' },
    { label: 'Dang trong chuyen', value: 6, color: 'text-blue-500' },
    { label: 'Cho bao duong', value: 2, color: 'text-orange-500' },
    { label: 'Tam dung', value: 1, color: 'text-muted-foreground' },
]

const RECENT_TRIPS = [
    { id: 't1', route: 'TP.HCM → Da Lat', departure: '2025-06-16 07:00', seats: 32, sold: 28, status: 'completed' },
    { id: 't2', route: 'TP.HCM → Nha Trang', departure: '2025-06-16 08:30', seats: 40, sold: 35, status: 'in_progress' },
    { id: 't3', route: 'TP.HCM → Vung Tau', departure: '2025-06-16 09:00', seats: 30, sold: 20, status: 'scheduled' },
    { id: 't4', route: 'TP.HCM → Da Lat', departure: '2025-06-16 18:00', seats: 32, sold: 10, status: 'scheduled' },
    { id: 't5', route: 'TP.HCM → Nha Trang', departure: '2025-06-16 19:30', seats: 40, sold: 14, status: 'scheduled' },
]

const ROUTE_REVENUE = [
    { label: 'HCM→Da Lat', value: 45_000_000 },
    { label: 'HCM→Nha Trang', value: 62_000_000 },
    { label: 'HCM→Vung Tau', value: 28_000_000 },
    { label: 'HCM→Can Tho', value: 18_000_000 },
    { label: 'HCM→Phan Thiet', value: 14_000_000 },
]

const STATUS_COLORS: Record<string, string> = {
    completed: 'text-green-600 bg-green-50',
    in_progress: 'text-blue-600 bg-blue-50',
    scheduled: 'text-orange-600 bg-orange-50',
    cancelled: 'text-red-600 bg-red-50',
}

export const CompanyDashboardPage = () => {
    const { weekRevenue, monthRevenue, confirmedToday, donutData } = useCompanyDashboard()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard Nha Xe</h1>
                <p className="text-sm text-muted-foreground">Tong quan hoat dong chuyen xe hom nay</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Doanh thu tuan', value: formatVnd(weekRevenue), icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+12%' },
                    { label: 'Doanh thu thang', value: formatVnd(monthRevenue), icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10', trend: '+8%' },
                    { label: 'Dat ve hom nay', value: confirmedToday, icon: Ticket, color: 'text-purple-500', bg: 'bg-purple-500/10', trend: '+5%' },
                    { label: 'Tong xe', value: 27, icon: Bus, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: null },
                ].map(kpi => {
                    const Icon = kpi.icon
                    return (
                        <Card key={kpi.label}>
                            <CardContent className="p-4 flex items-start gap-3">
                                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.bg}`}>
                                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                                </span>
                                <div>
                                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                                    <p className="text-2xl font-bold">{kpi.value}</p>
                                    {kpi.trend && (
                                        <p className="text-xs text-green-600 font-medium">{kpi.trend} so thang truoc</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {/* Fleet Status Donut */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Bus className="h-4 w-4 text-primary" /> Trang thai xe
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DonutChart segments={donutData} size={160} />
                    </CardContent>
                </Card>

                {/* Revenue by Route */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" /> Doanh thu theo tuyen (thang nay)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <HorizontalBarChart data={ROUTE_REVENUE} />
                    </CardContent>
                </Card>
            </div>

            {/* Revenue trend */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Doanh thu 30 ngay qua</CardTitle>
                </CardHeader>
                <CardContent>
                    <LineChart
                        data={MOCK_DAILY_REVENUES as unknown as Record<string, string | number>[]}
                        series={[
                            { key: 'gross', label: 'Gross', color: '#3b82f6' },
                            { key: 'net', label: 'Net', color: '#22c55e' },
                        ]}
                        height={220}
                        labelKey="label"
                    />
                </CardContent>
            </Card>

            {/* Today's Trips */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" /> Chuyen di hom nay
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="pb-2 text-left font-medium text-muted-foreground">Tuyen xe</th>
                                    <th className="pb-2 text-left font-medium text-muted-foreground">Gio xuat phat</th>
                                    <th className="pb-2 text-center font-medium text-muted-foreground">Ghe</th>
                                    <th className="pb-2 text-center font-medium text-muted-foreground">Da ban</th>
                                    <th className="pb-2 text-center font-medium text-muted-foreground">Ty le</th>
                                    <th className="pb-2 text-left font-medium text-muted-foreground">Trang thai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {RECENT_TRIPS.map(trip => (
                                    <tr key={trip.id} className="border-b border-border last:border-0">
                                        <td className="py-2.5 font-medium">{trip.route}</td>
                                        <td className="py-2.5 text-muted-foreground text-xs">{trip.departure}</td>
                                        <td className="py-2.5 text-center">{trip.seats}</td>
                                        <td className="py-2.5 text-center">{trip.sold}</td>
                                        <td className="py-2.5 text-center">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full" style={{ width: `${(trip.sold / trip.seats) * 100}%` }} />
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {Math.round((trip.sold / trip.seats) * 100)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-2.5">
                                            <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[trip.status] ?? ''}`}>
                                                {trip.status === 'completed' ? 'Hoan thanh' : trip.status === 'in_progress' ? 'Dang chay' : 'Cho khoi hanh'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
