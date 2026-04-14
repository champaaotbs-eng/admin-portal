export const APP_ROUTES = {
    HOME: '/auth/login',
    LOGIN: '/auth/login',
    FORBIDDEN: '/403',

    ADMIN: {
        ROOT: '/admin',
        COMPANIES: '/admin/companies',
        ADMINS: {
            ROOT: '/admin/admins',
            ADD: '/admin/admins/add',
            EDIT: '/admin/admins/:id'
        },
        ROLES: {
            ROOT: '/admin/roles',
            ADD: '/admin/roles/add',
            EDIT: '/admin/roles/:id',
        },
        ROUTES: '/admin/routes',
        REPORTS: '/admin/reports',
        BOOKINGS: '/admin/bookings',
        REVENUE: '/admin/revenue',
        STATIONS: '/admin/stations',
    },

    COMPANY: {
        ROOT: '/company',
        FLEET: '/company/fleet',
        TRIPS: '/company/trips',
        BOOKINGS: '/company/bookings',
        REVENUE: '/company/revenue',
        STAFF: '/company/staff',
    },
} as const
