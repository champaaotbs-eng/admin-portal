/**
 * Static permission modules used by role form and role detail screens.
 */
export const PERMISSION_MODULES = [
    { module: 'dashboard', label: 'Dashboard', hasWrite: false },
    { module: 'admin', label: 'Admin', hasWrite: true },
    { module: 'role', label: 'Role', hasWrite: true },
    { module: 'company', label: 'Company', hasWrite: true },
    { module: 'route', label: 'Route', hasWrite: true },
    { module: 'location', label: 'Location', hasWrite: true },
    { module: 'booking', label: 'Booking', hasWrite: true },
    { module: 'report', label: 'Report', hasWrite: false },
    { module: 'revenue', label: 'Revenue', hasWrite: true },
] as const
