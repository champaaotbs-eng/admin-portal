import { createContext } from 'react'

export interface TabsContextValue {
    active: string
    setActive: (v: string) => void
}

export const TabsContext = createContext<TabsContextValue>({ active: '', setActive: () => { } })
