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
        TRIPS: '/admin/trips',
        REPORTS: '/admin/reports',
        BOOKINGS: '/admin/bookings',
        REVENUE: '/admin/revenue',
        STATIONS: '/admin/stations',
    },

    COMPANY: {
        ROOT: '/company',
        ROUTES: '/company/routes',
        FLEET: '/company/fleet',
        SEAT_LAYOUTS: '/company/seat-layouts',
        TRIPS: '/company/trips',
        BOOKINGS: '/company/bookings',
        REVENUE: '/company/revenue',
        STAFF: '/company/staff',
        ROLES: {
            ROOT: '/company/roles',
            ADD: '/company/roles/new',
            EDIT: '/company/roles/:id',
        },
    },

    CUSTOMER: {
        ROOT: '/customer',
        LOGIN: '/customer/login',
        REGISTER: '/customer/register',
        TRIP_DETAIL: '/customer/trips/$tripId',
        MY_BOOKINGS: '/customer/my-bookings',
        BOOKING_DETAIL: '/customer/my-bookings/$code',
    },
} as const
