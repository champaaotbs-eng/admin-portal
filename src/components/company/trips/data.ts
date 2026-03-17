export const MOCK_TRIPS = [
    { id: 't1', route: 'TP.HCM → Da Lat', departure: '2025-06-20T07:00:00', arrival: '2025-06-20T15:00:00', bus: '51B-12345', driver: 'Nguyen Van A', seats: 45, sold: 38, price: 220_000, status: 'scheduled' },
    { id: 't2', route: 'TP.HCM → Nha Trang', departure: '2025-06-20T08:30:00', arrival: '2025-06-20T17:30:00', bus: '51B-23456', driver: 'Tran Van B', seats: 40, sold: 32, price: 280_000, status: 'scheduled' },
    { id: 't3', route: 'TP.HCM → Vung Tau', departure: '2025-06-19T09:00:00', arrival: '2025-06-19T12:00:00', bus: '51B-12345', driver: 'Nguyen Van A', seats: 45, sold: 42, price: 130_000, status: 'completed' },
    { id: 't4', route: 'TP.HCM → Da Lat', departure: '2025-06-19T18:00:00', arrival: '2025-06-20T02:00:00', bus: '51B-34567', driver: 'Le Van C', seats: 20, sold: 20, price: 350_000, status: 'completed' },
    { id: 't5', route: 'TP.HCM → Nha Trang', departure: '2025-06-21T19:30:00', arrival: '2025-06-22T04:30:00', bus: '51B-56789', driver: 'Pham Van D', seats: 36, sold: 12, price: 280_000, status: 'scheduled' },
    { id: 't6', route: 'TP.HCM → Can Tho', departure: '2025-06-18T06:00:00', arrival: '2025-06-18T09:30:00', bus: '51B-12345', driver: 'Nguyen Van A', seats: 45, sold: 30, price: 120_000, status: 'cancelled' },
    { id: 't7', route: 'TP.HCM → Vung Tau', departure: '2025-06-22T14:00:00', arrival: '2025-06-22T17:00:00', bus: '51B-23456', driver: 'Tran Van B', seats: 40, sold: 5, price: 130_000, status: 'scheduled' },
]

export const STATUS_LABELS: Record<string, string> = {
    scheduled: 'Sap khoi hanh',
    in_progress: 'Dang chay',
    completed: 'Hoan thanh',
    cancelled: 'Da huy',
}

export const STATUS_VARIANTS: Record<string, 'secondary' | 'success' | 'destructive' | 'warning'> = {
    scheduled: 'secondary',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'destructive',
}

export const MOCK_ROUTES = [
    'TP.HCM → Đà Lạt',
    'TP.HCM → Nha Trang',
    'TP.HCM → Vũng Tàu',
    'TP.HCM → Cần Thơ',
]

export const MOCK_BUSES = [
    { value: '51B-12345', label: '51B-12345 (45 chỗ)' },
    { value: '51B-23456', label: '51B-23456 (40 chỗ)' },
    { value: '51B-34567', label: '51B-34567 (20 chỗ)' },
]

export type TripItem = typeof MOCK_TRIPS[0]
