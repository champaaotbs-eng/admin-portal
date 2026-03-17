import { cn } from '@/utils/cn'

interface BarItem {
    label: string
    value: number
    color?: string
}

interface HorizontalBarChartProps {
    data: BarItem[]
    formatValue?: (v: number) => string
    className?: string
    color?: string
}

export const HorizontalBarChart = ({ data, formatValue, className, color = '#3b82f6' }: HorizontalBarChartProps) => {
    const max = Math.max(...data.map(d => d.value), 1)
    const fmt = formatValue ?? ((v) => v.toLocaleString())
    return (
        <div className={cn('space-y-2', className)}>
            {data.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-28 truncate text-right flex-shrink-0">{item.label}</span>
                    <div className="flex-1 bg-muted/40 rounded-full h-5 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500 flex items-center pl-2"
                            style={{
                                width: `${Math.max((item.value / max) * 100, 3)}%`,
                                backgroundColor: item.color ?? color,
                                opacity: 0.8 + (0.2 * (1 - i / data.length))
                            }}
                        />
                    </div>
                    <span className="text-xs font-medium w-24 text-right flex-shrink-0">{fmt(item.value)}</span>
                </div>
            ))}
        </div>
    )
}
