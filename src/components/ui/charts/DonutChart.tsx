import { cn } from '@/utils/cn'

interface DonutSegment {
    label: string
    value: number
    color: string
}

interface DonutChartProps {
    segments: DonutSegment[]
    size?: number
    className?: string
}

export const DonutChart = ({ segments, size = 140, className }: DonutChartProps) => {
    const total = segments.reduce((a, s) => a + s.value, 0) || 1
    const r = 44
    const cx = 50
    const cy = 50
    const stroke = 14

    let cumulative = 0
    const arcs = segments.map(seg => {
        const pct = seg.value / total
        const start = cumulative
        cumulative += pct
        return { ...seg, pct, start }
    })

    const describeArc = (startPct: number, endPct: number) => {
        const startAngle = startPct * 2 * Math.PI - Math.PI / 2
        const endAngle = endPct * 2 * Math.PI - Math.PI / 2
        const x1 = cx + r * Math.cos(startAngle)
        const y1 = cy + r * Math.sin(startAngle)
        const x2 = cx + r * Math.cos(endAngle)
        const y2 = cy + r * Math.sin(endAngle)
        const largeArc = endPct - startPct > 0.5 ? 1 : 0
        return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
    }

    return (
        <div className={cn('flex items-center gap-6', className)}>
            <svg viewBox="0 0 100 100" style={{ width: size, height: size, flexShrink: 0 }}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity={0.06} strokeWidth={stroke} />
                {arcs.map((arc, i) => (
                    arc.pct > 0 && (
                        <path key={i}
                            d={describeArc(arc.start, arc.start + arc.pct)}
                            fill="none"
                            stroke={arc.color}
                            strokeWidth={stroke}
                            strokeLinecap={i === arcs.length - 1 ? 'round' : 'butt'}
                        />
                    )
                ))}
            </svg>
            <div className="flex flex-col gap-2">
                {segments.map(seg => (
                    <div key={seg.label} className="flex items-center gap-2 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                        <span className="text-muted-foreground text-xs">{seg.label}</span>
                        <span className="font-semibold text-xs ml-1">{seg.value.toLocaleString()}</span>
                        <span className="text-muted-foreground text-xs">({((seg.value / (segments.reduce((a, s) => a + s.value, 0) || 1)) * 100).toFixed(1)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
