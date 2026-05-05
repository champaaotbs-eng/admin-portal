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
    Bus,
} from 'lucide-react'
import { Sidebar } from 'components/shared/side-bar'
import { APP_ROUTES } from '@/constants/app-routes'
import { usePermission } from '@/hooks/use-permission'
import { useTranslation } from 'react-i18next'
import { ADMIN_MODULES } from 'configs/constants'

export const AdminLayout = () => {
    const { t } = useTranslation()
    const { hasReadAccess } = usePermission()

    const navItems = [
        { label: t('nav.dashboard'), to: APP_ROUTES.ADMIN.ROOT, icon: LayoutDashboard, moduleName: ADMIN_MODULES.DASHBOARD },
        { label: t('nav.companies'), to: APP_ROUTES.ADMIN.COMPANIES, icon: Building2, moduleName: ADMIN_MODULES.COMPANY },
        { label: t('nav.admins'), to: APP_ROUTES.ADMIN.ADMINS.ROOT, icon: Users, moduleName: ADMIN_MODULES.ADMIN },
        { label: t('nav.roles'), to: APP_ROUTES.ADMIN.ROLES.ROOT, icon: ShieldCheck, moduleName: ADMIN_MODULES.ROLE },
        // { label: t('nav.routes'), to: APP_ROUTES.ADMIN.ROUTES, icon: MapPin, moduleName: ADMIN_MODULES.ROUTE },
        { label: t('nav.stations'), to: APP_ROUTES.ADMIN.STATIONS, icon: MapPin, moduleName: ADMIN_MODULES.STATION },
        { label: t('nav.trips'), to: APP_ROUTES.ADMIN.TRIPS, icon: Bus, moduleName: ADMIN_MODULES.BOOKING },
        { label: t('nav.bookings'), to: APP_ROUTES.ADMIN.BOOKINGS, icon: Ticket, moduleName: ADMIN_MODULES.BOOKING },
        { label: t('nav.revenue'), to: APP_ROUTES.ADMIN.REVENUE, icon: DollarSign, moduleName: ADMIN_MODULES.REVENUE },
        { label: t('nav.reports'), to: APP_ROUTES.ADMIN.REPORTS, icon: BarChart3, moduleName: ADMIN_MODULES.REPORT },
    ].filter((item) => item.moduleName === ADMIN_MODULES.DASHBOARD || hasReadAccess(item.moduleName))

    return (
        <div className="flex h-[calc(100vh-3.5rem)]">
            <Sidebar items={navItems} title={t('roles.admin')} />
            <main className="flex-1 overflow-y-auto p-6 bg-background">
                <Outlet />
            </main>
        </div>
    )
}
