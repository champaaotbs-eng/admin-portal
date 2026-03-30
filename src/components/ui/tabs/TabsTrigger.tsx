import { useContext } from 'react'
import { cn } from '@/utils/cn'
import { TabsContext } from './tabs-context'

interface TabsTriggerProps {
    value: string
    children: React.ReactNode
    className?: string
}

export const TabsTrigger = ({ value, children, className }: TabsTriggerProps) => {
    const { active, setActive } = useContext(TabsContext)
    const isActive = active === value
    return (
        <button
            type="button"
            onClick={() => setActive(value)}
            className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                className,
            )}
        >
            {children}
        </button>
    )
}
