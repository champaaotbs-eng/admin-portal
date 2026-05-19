import { ADMIN_MODULES, ADMIN_TYPE, COMPANY_MODULES } from 'configs/constants'

const NO_WRITE_MODULE_SET = new Set<string>([ADMIN_MODULES.DASHBOARD, ADMIN_MODULES.REPORT])

export type TRoleTypeValue = (typeof ADMIN_TYPE)[keyof typeof ADMIN_TYPE]

export interface IPermissionModuleConfig {
    module: string
    label: string
    hasWrite: boolean
}

const mapToPermissionModules = (modules: string[]): IPermissionModuleConfig[] => {
    return modules.map((module) => ({
        module,
        label: module,
        hasWrite: !NO_WRITE_MODULE_SET.has(module),
    }))
}

const ADMIN_ROLE_MODULES = [
    ADMIN_MODULES.DASHBOARD,
    ADMIN_MODULES.COMPANY,
    ADMIN_MODULES.ADMIN,
    ADMIN_MODULES.ROLE,
    ADMIN_MODULES.STATION,
    ADMIN_MODULES.TRIP,
    ADMIN_MODULES.BOOKING,
    ADMIN_MODULES.REVENUE,
]

const COMPANY_ROLE_MODULES = [
    COMPANY_MODULES.DASHBOARD,
    COMPANY_MODULES.BUS,
    COMPANY_MODULES.SEAT_LAYOUT,
    COMPANY_MODULES.ROUTE,
    COMPANY_MODULES.TRIP,
    COMPANY_MODULES.BOOKING,
    COMPANY_MODULES.REVENUE,
    COMPANY_MODULES.STAFF,
    COMPANY_MODULES.ROLE,
]

const ADMIN_PERMISSION_MODULES = mapToPermissionModules(ADMIN_ROLE_MODULES)
const COMPANY_PERMISSION_MODULES = mapToPermissionModules(COMPANY_ROLE_MODULES)

/**
 * Backward-compatible export used as default module list.
 */
export const PERMISSION_MODULES = ADMIN_PERMISSION_MODULES

export const getPermissionModulesByRoleType = (roleType?: string): IPermissionModuleConfig[] => {
    if (roleType === ADMIN_TYPE.COMPANY_ADMIN) {
        return COMPANY_PERMISSION_MODULES
    }

    return ADMIN_PERMISSION_MODULES
}
