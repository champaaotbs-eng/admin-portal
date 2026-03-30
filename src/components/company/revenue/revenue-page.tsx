import { useMemo } from 'react'
import { DollarSign, TrendingUp, Wallet, CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LineChart, HorizontalBarChart } from '@/components/ui/charts'
import { MOCK_DAILY_REVENUES, MOCK_SETTLEMENTS, MOCK_REVENUES } from '@/data/mock-extended'
import { formatDate, formatVnd } from '@/utils/format'

// Filter to company c1 data
const MY_REVENUES = MOCK_REVENUES.filter(r => r.companyId === 'c1')
const MY_SETTLEMENTS = MOCK_SETTLEMENTS.filter(s => s.companyId === 'c1')

const ROUTE_BREAKDOWN = [
    { label: 'HCM→Da Lat', value: 45_000_000 },
    { label: 'HCM→Nha Trang', value: 62_000_000 },
    { label: 'HCM→Vung Tau', value: 28_000_000 },
    { label: 'HCM→Can Tho', value: 18_000_000 },
    { label: 'HCM→Phan Thiet', value: 14_000_000 },
]

export function CompanyRevenuePage() {
    const totalGross = useMemo(() => MY_REVENUES.reduce((s, r) => s + r.grossAmount, 0), [])
    const totalCommission = useMemo(() => MY_REVENUES.reduce((s, r) => s + r.commissionAmount, 0), [])
    const totalNet = useMemo(() => MY_REVENUES.reduce((s, r) => s + r.netAmount, 0), [])
    const pendingSettlement = useMemo(() =>
        MY_SETTLEMENTS.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.totalNet, 0), [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Doanh Thu Cong Ty</h1>
                <p className="text-sm text-muted-foreground">Bao cao doanh thu va lich su quyet toan</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Tong gross', value: formatVnd(totalGross), icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Hoa hong nen tang', value: formatVnd(totalCommission), icon: TrendingUp, color: 'text-red-500', bg: 'bg-red-500/10' },
                    { label: 'Net cong ty nhan', value: formatVnd(totalNet), icon: Wallet, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Cho quyet toan', value: formatVnd(pendingSettlement), icon: CalendarDays, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                ].map(kpi => {
                    const Icon = kpi.icon
                    return (
                        <Card key={kpi.label}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.bg}`}>
                                    <Icon className={`h-5 w-5 ${kpi.color}`} />
                                </span>
                                <div>
                                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                                    <p className="text-xl font-bold">{kpi.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Chart section */}
            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
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
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Theo tuyen xe</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <HorizontalBarChart data={ROUTE_BREAKDOWN} />
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="transactions">
                <TabsList>
                    <TabsTrigger value="transactions">Giao dich</TabsTrigger>
                    <TabsTrigger value="settlements">Quyet toan</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions">
                    <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ma dat ve</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Thoi gian</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Gross</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Phi %</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Hoa hong</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Net cong ty nhan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MY_REVENUES.slice(0, 20).map(r => (
                                    <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.bookingId}</td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(r.createdAt)}</td>
                                        <td className="px-4 py-3 text-right">{formatVnd(r.grossAmount)}</td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">{r.commissionRate}%</td>
                                        <td className="px-4 py-3 text-right text-red-500">-{formatVnd(r.commissionAmount)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-green-600">{formatVnd(r.netAmount)}</td>
                                    </tr>
                                ))}
                                {MY_REVENUES.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-muted-foreground">Chua co giao dich</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="settlements">
                    <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ma quyet toan</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ky ke toan</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Gross</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Hoa hong</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Net chuyen</th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Dat ve</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Trang thai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MY_SETTLEMENTS.map(s => (
                                    <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.referenceCode}</td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDate(s.periodFrom)} — {formatDate(s.periodTo)}
                                        </td>
                                        <td className="px-4 py-3 text-right">{formatVnd(s.totalGross)}</td>
                                        <td className="px-4 py-3 text-right text-red-500">-{formatVnd(s.totalCommission)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-green-600">{formatVnd(s.totalNet)}</td>
                                        <td className="px-4 py-3 text-center">{s.bookingCount}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={s.status === 'paid' ? 'success' : 'warning'} className="text-xs">
                                                {s.status === 'paid' ? 'Da thanh toan' : 'Cho thanh toan'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                                {MY_SETTLEMENTS.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-muted-foreground">Chua co quyet toan</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
