interface LineSeries {
    key: string
    color: string
    label: string
}

interface LineChartProps {
    data: Record<string, string | number>[]
    series: LineSeries[]
    height?: number
    labelKey?: string
    className?: string
}

export const LineChart = ({ data, series, height = 220, labelKey = 'label', className }: LineChartProps) => {
    const pad = { top: 16, right: 16, bottom: 28, left: 52 }
    const vw = 600
    const vh = height
    const iw = vw - pad.left - pad.right
    const ih = vh - pad.top - pad.bottom

    const allVals = series.flatMap(s => data.map(d => Number(d[s.key] ?? 0)))
    const maxVal = Math.max(...allVals, 1)

    const xOf = (i: number) => pad.left + (i / Math.max(data.length - 1, 1)) * iw
    const yOf = (v: number) => pad.top + ih - (v / maxVal) * ih

    const gridLines = [0, 0.25, 0.5, 0.75, 1]
    const yFmt = (v: number) => {
        if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`
        if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`
        if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
        return String(v)
    }

    const labelStep = Math.ceil(data.length / 8)

    return (
        <div className={className}>
            <svg viewBox={`0 0 ${vw} ${vh}`} className="w-full" style={{ height }}>
                {gridLines.map(t => {
                    const y = pad.top + ih * (1 - t)
                    return (
                        <g key={t}>
                            <line x1={pad.left} y1={y} x2={vw - pad.right} y2={y}
                                stroke="currentColor" strokeOpacity={0.08} strokeDasharray="4,4" />
                            <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize={9}
                                fill="currentColor" fillOpacity={0.5}>
                                {yFmt(maxVal * t)}
                            </text>
                        </g>
                    )
                })}
                {series.map(s => {
                    const pts = data.map((d, i) => `${xOf(i).toFixed(1)},${yOf(Number(d[s.key] ?? 0)).toFixed(1)}`).join(' ')
                    const areaD = [
                        `M ${xOf(0).toFixed(1)},${(pad.top + ih).toFixed(1)}`,
                        ...data.map((d, i) => `L ${xOf(i).toFixed(1)},${yOf(Number(d[s.key] ?? 0)).toFixed(1)}`),
                        `L ${xOf(data.length - 1).toFixed(1)},${(pad.top + ih).toFixed(1)}`,
                        'Z',
                    ].join(' ')
                    return (
                        <g key={s.key}>
                            <path d={areaD} fill={s.color} fillOpacity={0.07} />
                            <polyline points={pts} fill="none" stroke={s.color} strokeWidth={2}
                                strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    )
                })}
                {data.map((d, i) => {
                    if (i % labelStep !== 0 && i !== data.length - 1) return null
                    return (
                        <text key={i} x={xOf(i)} y={vh - 6} textAnchor="middle" fontSize={9}
                            fill="currentColor" fillOpacity={0.5}>
                            {String(d[labelKey])}
                        </text>
                    )
                })}
            </svg>
            <div className="flex flex-wrap gap-4 mt-2 justify-center">
                {series.map(s => (
                    <div key={s.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="inline-block w-8 h-0.5 rounded" style={{ backgroundColor: s.color }} />
                        {s.label}
                    </div>
                ))}
            </div>
        </div>
    )
}
