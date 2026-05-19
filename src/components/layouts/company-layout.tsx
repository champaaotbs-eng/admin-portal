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
    ShieldCheck,
} from 'lucide-react'
import { Sidebar } from 'components/shared/side-bar'
import { APP_ROUTES } from '@/constants/app-routes'
import { useTranslation } from 'react-i18next'
import { usePermission } from '@/hooks/use-permission'
import { COMPANY_MODULES } from 'configs/constants'

export const CompanyLayout = () => {
    const { t } = useTranslation()
    const { hasReadAccess } = usePermission()

    const navItems = [
        { label: t('nav.dashboard'), to: APP_ROUTES.COMPANY.ROOT, icon: LayoutDashboard, moduleName: COMPANY_MODULES.DASHBOARD },
        { label: t('nav.buses'), to: APP_ROUTES.COMPANY.FLEET, icon: Bus, moduleName: COMPANY_MODULES.BUS },
        { label: t('nav.seat_layouts'), to: APP_ROUTES.COMPANY.SEAT_LAYOUTS, icon: Grid3x3, moduleName: COMPANY_MODULES.SEAT_LAYOUT },
        { label: t('nav.routes'), to: APP_ROUTES.COMPANY.ROUTES, icon: Route, moduleName: COMPANY_MODULES.ROUTE },
        { label: t('nav.trips'), to: APP_ROUTES.COMPANY.TRIPS, icon: MapPin, moduleName: COMPANY_MODULES.TRIP },
        { label: t('nav.bookings'), to: APP_ROUTES.COMPANY.BOOKINGS, icon: Ticket, moduleName: COMPANY_MODULES.BOOKING },
        { label: t('nav.revenue'), to: APP_ROUTES.COMPANY.REVENUE, icon: DollarSign, moduleName: COMPANY_MODULES.REVENUE },
        { label: t('nav.staff'), to: APP_ROUTES.COMPANY.STAFF, icon: Users, moduleName: COMPANY_MODULES.STAFF },
        { label: t('nav.roles'), to: APP_ROUTES.COMPANY.ROLES.ROOT, icon: ShieldCheck, moduleName: COMPANY_MODULES.ROLE },
    ].filter((item) => item.moduleName === COMPANY_MODULES.DASHBOARD || hasReadAccess(item.moduleName))

    return (
        <div className="flex h-[calc(100vh-3.5rem)]">
            <Sidebar items={navItems} title={t('pages.companies.title')} />
            <main className="flex-1 overflow-y-auto p-6 bg-background">
                <Outlet />
            </main>
        </div>
    )
}
