import { useContext } from 'react'
import { cn } from '@/utils/cn'
import { TabsContext } from './tabs-context'

interface TabsContentProps {
    value: string
    children: React.ReactNode
    className?: string
}

export const TabsContent = ({ value, children, className }: TabsContentProps) => {
    const { active } = useContext(TabsContext)
    if (active !== value) return null
    return <div className={cn('pt-6', className)}>{children}</div>
}
