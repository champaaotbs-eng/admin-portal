export const PERMISSIONS = {
    MANAGE_COMPANIES: 'manage_companies',
    MANAGE_USERS: 'manage_users',
    MANAGE_ROLES: 'manage_roles',
    MANAGE_ROUTES: 'manage_routes',
    MANAGE_TRIPS: 'manage_trips',
    VIEW_REPORTS: 'view_reports',
    BOOK_TICKETS: 'book_tickets',
    CANCEL_TICKETS: 'cancel_tickets',
    MANAGE_PROFILE: 'manage_profile',
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export interface PermissionRouteRule {
    startsWith: string
    permission: string
}

export const ADMIN_ROUTE_PERMISSION_RULES: PermissionRouteRule[] = [
    { startsWith: '/admin/companies', permission: PERMISSIONS.MANAGE_COMPANIES },
    { startsWith: '/admin/users', permission: PERMISSIONS.MANAGE_USERS },
    { startsWith: '/admin/roles', permission: PERMISSIONS.MANAGE_ROLES },
    { startsWith: '/admin/routes', permission: PERMISSIONS.MANAGE_ROUTES },
    { startsWith: '/admin/locations', permission: PERMISSIONS.MANAGE_ROUTES },
    { startsWith: '/admin/bookings', permission: PERMISSIONS.VIEW_REPORTS },
    { startsWith: '/admin/revenue', permission: PERMISSIONS.VIEW_REPORTS },
    { startsWith: '/admin/reports', permission: PERMISSIONS.VIEW_REPORTS },
]
