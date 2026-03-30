import { useMemo } from 'react'
import { MOCK_DAILY_REVENUES, MOCK_BOOKINGS } from '@/data/mock-extended'

export const useCompanyDashboard = () => {
    const weekRevenue = useMemo(() =>
        MOCK_DAILY_REVENUES.slice(-7).reduce((s, d) => s + d.gross, 0), [])

    const monthRevenue = useMemo(() =>
        MOCK_DAILY_REVENUES.reduce((s, d) => s + d.gross, 0), [])

    const confirmedToday = MOCK_BOOKINGS.filter(b => b.status === 'confirmed').length

    const donutData = [
        { label: 'Hoat dong', value: 18, color: '#22c55e' },
        { label: 'Trong chuyen', value: 6, color: '#3b82f6' },
        { label: 'Bao duong', value: 2, color: '#f97316' },
        { label: 'Tam dung', value: 1, color: '#94a3b8' },
    ]

    return { weekRevenue, monthRevenue, confirmedToday, donutData }
}
