import { cn } from '@/utils/cn'

interface HeatmapProps {
    data: number[][]
    dayLabels?: string[]
    hourLabels?: string[]
    className?: string
}

export const Heatmap = ({ data, dayLabels, hourLabels, className }: HeatmapProps) => {
    const flat = data.flat()
    const max = Math.max(...flat, 1)

    const days = dayLabels ?? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    const hours = hourLabels ?? Array.from({ length: 24 }, (_, i) => `${i}h`)

    return (
        <div className={cn('overflow-x-auto', className)}>
            <div className="min-w-[480px]">
                <div className="flex gap-0.5 mb-0.5">
                    <div className="w-8 flex-shrink-0" />
                    {hours.map((h, i) => (
                        <div key={i} className="flex-1 text-center text-[8px] text-muted-foreground py-0.5">
                            {i % 3 === 0 ? h : ''}
                        </div>
                    ))}
                </div>
                {data.map((row, di) => (
                    <div key={di} className="flex gap-0.5 mb-0.5">
                        <div className="w-8 flex-shrink-0 text-[9px] text-muted-foreground flex items-center">
                            {days[di]}
                        </div>
                        {row.map((val, hi) => {
                            const intensity = val / max
                            return (
                                <div
                                    key={hi}
                                    className="flex-1 rounded-sm h-5"
                                    title={`${days[di]} ${hours[hi]}: ${val}`}
                                    style={{
                                        backgroundColor: `rgba(59,130,246,${0.05 + intensity * 0.9})`,
                                    }}
                                />
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}
