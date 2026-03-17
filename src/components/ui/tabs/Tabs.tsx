import { useState } from 'react'
import { TabsContext } from './tabs-context'

interface TabsProps {
    defaultValue: string
    value?: string
    onValueChange?: (v: string) => void
    children: React.ReactNode
    className?: string
}

export const Tabs = ({ defaultValue, value, onValueChange, children, className }: TabsProps) => {
    const [internal, setInternal] = useState(defaultValue)
    const active = value ?? internal
    const setActive = (v: string) => {
        setInternal(v)
        onValueChange?.(v)
    }
    return (
        <TabsContext.Provider value={{ active, setActive }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    )
}
