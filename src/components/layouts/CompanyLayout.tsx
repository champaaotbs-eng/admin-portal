import { Outlet } from '@tanstack/react-router'
import {
    LayoutDashboard,
    Bus,
    MapPin,
    Ticket,
    DollarSign,
    Users,
} from 'lucide-react'
import { Sidebar } from '@/components/shared/Sidebar'
import { APP_ROUTES } from '@/constants/app-routes'
import { useTranslation } from 'react-i18next'

export const CompanyLayout = () => {
    const { t } = useTranslation()
    const navItems = [
        { label: 'Trang chinh', to: APP_ROUTES.COMPANY.ROOT, icon: LayoutDashboard },
        { label: 'Xe cua cong ty', to: APP_ROUTES.COMPANY.FLEET, icon: Bus },
        { label: 'Chuyen di', to: APP_ROUTES.COMPANY.TRIPS, icon: MapPin },
        { label: 'Dat ve', to: APP_ROUTES.COMPANY.BOOKINGS, icon: Ticket },
        { label: 'Doanh thu', to: APP_ROUTES.COMPANY.REVENUE, icon: DollarSign },
        { label: 'Nhan vien', to: APP_ROUTES.COMPANY.STAFF, icon: Users },
    ]
    return (
        <div className="flex h-[calc(100vh-3.5rem)]">
            <Sidebar items={navItems} title="Quan Ly Nha Xe" />
            <main className="flex-1 overflow-y-auto p-6 bg-background">
                <Outlet />
            </main>
        </div>
    )
}
