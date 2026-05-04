import { Outlet } from '@tanstack/react-router'
import {
    LayoutDashboard,
    Bus,
    MapPin,
    Route,
    Ticket,
    DollarSign,
    Users,
    Grid3x3,
} from 'lucide-react'
import { Sidebar } from 'components/shared/side-bar'
import { APP_ROUTES } from '@/constants/app-routes'
import { useTranslation } from 'react-i18next'

export const CompanyLayout = () => {
    const { t } = useTranslation()
    const navItems = [
        { label: t('nav.dashboard'), to: APP_ROUTES.COMPANY.ROOT, icon: LayoutDashboard },
        { label: t('nav.buses'), to: APP_ROUTES.COMPANY.FLEET, icon: Bus },
        { label: t('nav.seat_layouts'), to: APP_ROUTES.COMPANY.SEAT_LAYOUTS, icon: Grid3x3 },
        { label: t('nav.routes'), to: APP_ROUTES.COMPANY.ROUTES, icon: Route },
        { label: t('nav.trips'), to: APP_ROUTES.COMPANY.TRIPS, icon: MapPin },
        { label: t('nav.bookings'), to: APP_ROUTES.COMPANY.BOOKINGS, icon: Ticket },
        { label: t('nav.revenue'), to: APP_ROUTES.COMPANY.REVENUE, icon: DollarSign },
        { label: t('nav.staff'), to: APP_ROUTES.COMPANY.STAFF, icon: Users },
    ]
    return (
        <div className="flex h-[calc(100vh-3.5rem)]">
            <Sidebar items={navItems} title={t('pages.companies.title')} />
            <main className="flex-1 overflow-y-auto p-6 bg-background">
                <Outlet />
            </main>
        </div>
    )
}
