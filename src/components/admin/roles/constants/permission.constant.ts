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

const ADMIN_PERMISSION_MODULES = mapToPermissionModules(Object.values(ADMIN_MODULES))
const COMPANY_PERMISSION_MODULES = mapToPermissionModules(Object.values(COMPANY_MODULES))

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
