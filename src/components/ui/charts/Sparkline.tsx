import { cn } from '@/utils/cn'

interface SparklineProps {
    data: number[]
    color?: string
    className?: string
}

export const Sparkline = ({ data, color = '#3b82f6', className }: SparklineProps) => {
    if (data.length < 2) return null
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const w = 80
    const h = 32
    const pad = 2
    const pts = data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2)
        const y = h - pad - ((v - min) / range) * (h - pad * 2)
        return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className={cn('w-20 h-8', className)}>
            <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
