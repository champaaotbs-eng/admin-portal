import type {
    BusCompany,
    Bus,
    RouteItinerary,
    Trip,
    Ticket,
} from '@/types'
import { RoleEnum } from 'types/role'
import type { User } from 'types/user'

// ─── Users ────────────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
    {
        id: 'u1',
        name: 'Admin Hệ Thống',
        username: 'admin',
        email: 'admin@vexe.vn',
        password: 'admin123',
        role: RoleEnum.ADMIN,
        phone: '0900000001',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
        id: 'u2',
        name: 'Trần Văn Tuấn',
        username: 'tuanphuong',
        email: 'tuanphuong@vexe.vn',
        password: 'company123',
        role: RoleEnum.BUS_COMPANY,
        companyId: 'c1',
        phone: '0900000002',
        isActive: true,
        createdAt: '2024-01-05T00:00:00.000Z',
    },
    {
        id: 'u3',
        name: 'Lê Thị Hoa',
        username: 'hoathanh',
        email: 'hoathanh@vexe.vn',
        password: 'company123',
        role: RoleEnum.BUS_COMPANY,
        companyId: 'c2',
        phone: '0900000003',
        isActive: true,
        createdAt: '2024-01-08T00:00:00.000Z',
    },
    {
        id: 'u4',
        name: 'Nguyễn Minh Khoa',
        email: 'khoa.nguyen@gmail.com',
        password: 'khach123',
        role: RoleEnum.CUSTOMER,
        phone: '0912345678',
        username: 'khoanguyen',
        isActive: true,
        createdAt: '2024-02-01T00:00:00.000Z',
    },
    {
        id: 'u5',
        name: 'Phạm Thị Lan',
        username: 'lanpham',
        email: 'lan.pham@gmail.com',
        password: 'khach123',
        role: RoleEnum.CUSTOMER,
        phone: '0987654321',
        isActive: true,
        createdAt: '2024-02-10T00:00:00.000Z',
    },
]

// ─── Bus Companies ────────────────────────────────────────────────────────────

export const MOCK_COMPANIES: BusCompany[] = [
    {
        id: 'c1',
        name: 'Phương Trang',
        phone: '1900 6067',
        email: 'contact@phuongtrang.com.vn',
        address: '272 Đề Thám, Phường Phạm Ngũ Lão, Q.1, TP.HCM',
        isActive: true,
        serviceFee: 5,
        status: 'active',
        createdAt: '2024-01-05T00:00:00.000Z',
    },
    {
        id: 'c2',
        name: 'Thành Bưởi',
        phone: '1900 6067',
        email: 'contact@thanhbuoi.vn',
        address: '201 Phạm Ngũ Lão, Q.1, TP.HCM',
        isActive: true,
        serviceFee: 5,
        status: 'active',
        createdAt: '2024-01-08T00:00:00.000Z',
    },
    {
        id: 'c3',
        name: 'Hoàng Long',
        phone: '0243 943 9999',
        email: 'info@hoanglong.vn',
        address: '34 Trần Nhân Tông, Q. Hai Bà Trưng, Hà Nội',
        isActive: true,
        serviceFee: 5,
        status: 'active',
        createdAt: '2024-01-12T00:00:00.000Z',
    },
]

// ─── Buses ────────────────────────────────────────────────────────────────────

export const MOCK_BUSES: Bus[] = [
    {
        id: 'b1',
        companyId: 'c1',
        plateNumber: '51B-123.45',
        name: 'Limousine VIP 9 chỗ',
        totalSeats: 9,
        type: 'vip',
        isActive: true,
    },
    {
        id: 'b2',
        companyId: 'c1',
        plateNumber: '51B-678.90',
        name: 'Giường nằm 40 chỗ',
        totalSeats: 40,
        type: 'sleeper',
        isActive: true,
    },
    {
        id: 'b3',
        companyId: 'c2',
        plateNumber: '51C-111.22',
        name: 'Ghế ngồi 45 chỗ',
        totalSeats: 45,
        type: 'seat',
        isActive: true,
    },
    {
        id: 'b4',
        companyId: 'c2',
        plateNumber: '51C-333.44',
        name: 'Giường nằm 34 chỗ',
        totalSeats: 34,
        type: 'sleeper',
        isActive: true,
    },
    {
        id: 'b5',
        companyId: 'c3',
        plateNumber: '29B-555.66',
        name: 'Ghế ngồi 45 chỗ',
        totalSeats: 45,
        type: 'seat',
        isActive: true,
    },
]

// ─── Routes (Itineraries) ─────────────────────────────────────────────────────

export const MOCK_ROUTES: RouteItinerary[] = [
    {
        id: 'r1',
        from: 'TP. Hồ Chí Minh',
        to: 'Đà Lạt',
        distanceKm: 308,
        estimatedMinutes: 360,
    },
    {
        id: 'r2',
        from: 'TP. Hồ Chí Minh',
        to: 'Nha Trang',
        distanceKm: 448,
        estimatedMinutes: 480,
    },
    {
        id: 'r3',
        from: 'TP. Hồ Chí Minh',
        to: 'Vũng Tàu',
        distanceKm: 125,
        estimatedMinutes: 150,
    },
    {
        id: 'r4',
        from: 'Hà Nội',
        to: 'Đà Nẵng',
        distanceKm: 764,
        estimatedMinutes: 840,
    },
    {
        id: 'r5',
        from: 'Hà Nội',
        to: 'Hải Phòng',
        distanceKm: 105,
        estimatedMinutes: 120,
    },
]

// ─── Trips ────────────────────────────────────────────────────────────────────

const today = new Date()
const d = (offsetDays: number, hour: number, min = 0) => {
    const dt = new Date(today)
    dt.setDate(dt.getDate() + offsetDays)
    dt.setHours(hour, min, 0, 0)
    return dt.toISOString()
}

export const MOCK_TRIPS: Trip[] = [
    {
        id: 't1',
        companyId: 'c1',
        routeId: 'r1',
        busId: 'b1',
        departureTime: d(1, 7, 0),
        arrivalTime: d(1, 13, 0),
        pricePerSeat: 350000,
        availableSeats: 7,
        status: 'scheduled',
    },
    {
        id: 't2',
        companyId: 'c1',
        routeId: 'r1',
        busId: 'b2',
        departureTime: d(1, 20, 0),
        arrivalTime: d(2, 2, 0),
        pricePerSeat: 280000,
        availableSeats: 30,
        status: 'scheduled',
    },
    {
        id: 't3',
        companyId: 'c2',
        routeId: 'r2',
        busId: 'b3',
        departureTime: d(1, 8, 0),
        arrivalTime: d(1, 16, 0),
        pricePerSeat: 250000,
        availableSeats: 28,
        status: 'scheduled',
    },
    {
        id: 't4',
        companyId: 'c2',
        routeId: 'r3',
        busId: 'b4',
        departureTime: d(0, 9, 0),
        arrivalTime: d(0, 11, 30),
        pricePerSeat: 120000,
        availableSeats: 20,
        status: 'scheduled',
    },
    {
        id: 't5',
        companyId: 'c3',
        routeId: 'r4',
        busId: 'b5',
        departureTime: d(2, 18, 0),
        arrivalTime: d(3, 8, 0),
        pricePerSeat: 450000,
        availableSeats: 35,
        status: 'scheduled',
    },
    {
        id: 't6',
        companyId: 'c1',
        routeId: 'r2',
        busId: 'b2',
        departureTime: d(-1, 20, 0),
        arrivalTime: d(-1, 4, 0),
        pricePerSeat: 280000,
        availableSeats: 0,
        status: 'completed',
    },
]

// ─── Tickets ──────────────────────────────────────────────────────────────────

export const MOCK_TICKETS: Ticket[] = [
    {
        id: 'tk1',
        tripId: 't1',
        customerId: 'u4',
        seatNumbers: ['A1', 'A2'],
        totalPrice: 700000,
        status: 'confirmed',
        passengerName: 'Nguyễn Minh Khoa',
        passengerPhone: '0912345678',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 'tk2',
        tripId: 't6',
        customerId: 'u4',
        seatNumbers: ['B3'],
        totalPrice: 280000,
        status: 'completed',
        passengerName: 'Nguyễn Minh Khoa',
        passengerPhone: '0912345678',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
        id: 'tk3',
        tripId: 't3',
        customerId: 'u5',
        seatNumbers: ['C1'],
        totalPrice: 250000,
        status: 'confirmed',
        passengerName: 'Phạm Thị Lan',
        passengerPhone: '0987654321',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
]
