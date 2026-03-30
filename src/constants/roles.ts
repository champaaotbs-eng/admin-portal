export const ROLES = {
    ADMIN: 'admin',
    BUS_COMPANY: 'bus_company',
    CUSTOMER: 'customer',
} as const

/** i18n key mapping for role labels — use t(`roles.${ROLE_I18N_KEYS[role]}`) */
export const ROLE_I18N_KEYS: Record<string, string> = {
    admin: 'admin',
    bus_company: 'company',
    customer: 'customer',
}
