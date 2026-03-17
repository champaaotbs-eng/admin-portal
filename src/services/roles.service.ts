const delay = (ms = 300) => new Promise<void>((r) => setTimeout(r, ms))

export interface Permission {
    key: string
    label: string
    description: string
    module: string
}

export interface Role {
    id: string
    key: string
    name: string
    description: string
    permissions: string[]
    isSystem: boolean
}

export const ALL_PERMISSIONS: Permission[] = [
    { key: 'manage_companies', label: 'Manage Companies', description: 'Create, edit, activate/deactivate bus companies', module: 'Companies' },
    { key: 'manage_users', label: 'Manage Users', description: 'Create, edit, activate/deactivate user accounts', module: 'Users' },
    { key: 'manage_roles', label: 'Manage Roles', description: 'Create and edit roles, assign permissions', module: 'Roles' },
    { key: 'manage_routes', label: 'Manage Routes', description: 'Create and manage bus routes', module: 'Routes' },
    { key: 'manage_trips', label: 'Manage Trips', description: 'Create and manage bus trips', module: 'Trips' },
    { key: 'view_reports', label: 'View Reports', description: 'Access booking and revenue reports', module: 'Reports' },
    { key: 'book_tickets', label: 'Book Tickets', description: 'Search and book bus tickets', module: 'Booking' },
    { key: 'cancel_tickets', label: 'Cancel Tickets', description: 'Cancel booked tickets', module: 'Booking' },
    { key: 'manage_profile', label: 'Manage Profile', description: 'Update own profile information', module: 'Profile' },
]

let roles: Role[] = [
    {
        id: 'r1',
        key: 'admin',
        name: 'Administrator',
        description: 'Full system access',
        permissions: ['manage_companies', 'manage_users', 'manage_roles', 'manage_routes', 'manage_trips', 'view_reports', 'manage_profile'],
        isSystem: true,
    },
    {
        id: 'r2',
        key: 'bus_company',
        name: 'Bus Company',
        description: 'Manage trips and routes for the company',
        permissions: ['manage_routes', 'manage_trips', 'view_reports', 'manage_profile'],
        isSystem: true,
    },
    {
        id: 'r3',
        key: 'customer',
        name: 'Customer',
        description: 'Regular passenger account',
        permissions: ['book_tickets', 'cancel_tickets', 'manage_profile'],
        isSystem: true,
    },
]
let nextRoleId = 4

export async function getAllRoles(): Promise<Role[]> {
    await delay(200)
    return [...roles]
}

export async function updateRolePermissions(roleId: string, permissions: string[]): Promise<Role | null> {
    await delay()
    const role = roles.find((r) => r.id === roleId)
    if (!role) return null
    role.permissions = [...permissions]
    return { ...role }
}

export async function createRole(payload: { name: string; description: string }): Promise<Role> {
    await delay()
    const role: Role = {
        id: `r${nextRoleId++}`,
        key: payload.name.toLowerCase().replace(/\s+/g, '_'),
        name: payload.name,
        description: payload.description,
        permissions: ['manage_profile'],
        isSystem: false,
    }
    roles.push(role)
    return role
}

export async function updateRole(
    id: string,
    payload: { name: string; description: string },
): Promise<Role | null> {
    await delay()
    const role = roles.find((r) => r.id === id)
    if (!role || role.isSystem) return null
    role.name = payload.name
    role.description = payload.description
    return { ...role }
}
