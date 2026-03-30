import { cn } from '@/utils/cn'

interface TabsListProps {
    children: React.ReactNode
    className?: string
}

export const TabsList = ({ children, className }: TabsListProps) => (
    <div className={cn('flex gap-1 border-b border-border', className)}>
        {children}
    </div>
)
