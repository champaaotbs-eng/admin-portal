import { cn } from '@/utils/cn'

interface TrendBadgeProps {
    value: number
    className?: string
}

export const TrendBadge = ({ value, className }: TrendBadgeProps) => {
    const positive = value >= 0
    return (
        <span className={cn(
            'inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full',
            positive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600',
            className
        )}>
            {positive ? '↑' : '↓'} {Math.abs(value).toFixed(1)}%
        </span>
    )
}
