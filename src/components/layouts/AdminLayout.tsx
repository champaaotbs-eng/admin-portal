import { Outlet } from '@tanstack/react-router'
import {
    LayoutDashboard,
    Building2,
    Users,
    MapPin,
    BarChart3,
    ShieldCheck,
    Ticket,
    DollarSign,
} from 'lucide-react'
import { Sidebar } from '@/components/shared/Sidebar'
import { APP_ROUTES } from '@/constants/app-routes'
import { useTranslation } from 'react-i18next'

export const AdminLayout = () => {
    const { t } = useTranslation()
    const navItems = [
        { label: t('nav.dashboard'), to: APP_ROUTES.ADMIN.ROOT, icon: LayoutDashboard },
        { label: t('nav.companies'), to: APP_ROUTES.ADMIN.COMPANIES, icon: Building2 },
        { label: t('nav.users'), to: APP_ROUTES.ADMIN.USERS, icon: Users },
        { label: t('nav.roles'), to: APP_ROUTES.ADMIN.ROLES, icon: ShieldCheck },
        { label: t('nav.routes'), to: APP_ROUTES.ADMIN.ROUTES, icon: MapPin },
        { label: t('nav.locations'), to: APP_ROUTES.ADMIN.LOCATIONS, icon: MapPin },
        { label: t('nav.bookings'), to: APP_ROUTES.ADMIN.BOOKINGS, icon: Ticket },
        { label: t('nav.revenue'), to: APP_ROUTES.ADMIN.REVENUE, icon: DollarSign },
        { label: t('nav.reports'), to: APP_ROUTES.ADMIN.REPORTS, icon: BarChart3 },
    ]
    return (
        <div className="flex h-[calc(100vh-3.5rem)]">
            <Sidebar items={navItems} title={t('roles.admin')} />
            <main className="flex-1 overflow-y-auto p-6 bg-background">
                <Outlet />
            </main>
        </div>
    )
}
