export const APP_ROUTES = {
    HOME: '/auth/login',
    LOGIN: '/auth/login',

    ADMIN: {
        ROOT: '/admin',
        COMPANIES: '/admin/companies',
        USERS: '/admin/users',
        ROLES: '/admin/roles',
        ROUTES: '/admin/routes',
        REPORTS: '/admin/reports',
        BOOKINGS: '/admin/bookings',
        REVENUE: '/admin/revenue',
        LOCATIONS: '/admin/locations',
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
