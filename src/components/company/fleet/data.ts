export const BUS_TYPES = ['seat', 'sleeper', 'vip'] as const
export type BusType = typeof BUS_TYPES[number]

export const TYPE_LABELS: Record<BusType, string> = {
    seat: 'Ghe ngoi',
    sleeper: 'Giuong nam',
    vip: 'VIP/Limousine',
}

export const STATUS_VARIANTS = {
    active: { label: 'Hoat dong', variant: 'success' as const },
    maintenance: { label: 'Bao duong', variant: 'warning' as const },
    inactive: { label: 'Tam dung', variant: 'secondary' as const },
}

export const MOCK_FLEET = [
    { id: 'b1', plateNumber: '51B-12345', name: 'Xe 45 cho Phuong Trang', type: 'seat' as BusType, totalSeats: 45, status: 'active', routes: ['HCM→Da Lat', 'HCM→Vung Tau'], trips: 124, createdAt: '2022-01-15' },
    { id: 'b2', plateNumber: '51B-23456', name: 'Giuong nam 40 cho', type: 'sleeper' as BusType, totalSeats: 40, status: 'active', routes: ['HCM→Nha Trang'], trips: 98, createdAt: '2022-03-10' },
    { id: 'b3', plateNumber: '51B-34567', name: 'VIP Limousine 20 cho', type: 'vip' as BusType, totalSeats: 20, status: 'active', routes: ['HCM→Da Lat'], trips: 56, createdAt: '2023-05-20' },
    { id: 'b4', plateNumber: '51B-45678', name: 'Xe 45 cho so 2', type: 'seat' as BusType, totalSeats: 45, status: 'maintenance', routes: [], trips: 80, createdAt: '2022-07-01' },
    { id: 'b5', plateNumber: '51B-56789', name: 'Giuong nam VIP 36 cho', type: 'sleeper' as BusType, totalSeats: 36, status: 'active', routes: ['HCM→Nha Trang', 'HCM→Can Tho'], trips: 112, createdAt: '2023-01-12' },
    { id: 'b6', plateNumber: '51B-67890', name: 'Xe 30 cho co', type: 'seat' as BusType, totalSeats: 30, status: 'inactive', routes: [], trips: 22, createdAt: '2020-11-05' },
]

export type FleetItem = typeof MOCK_FLEET[0]
