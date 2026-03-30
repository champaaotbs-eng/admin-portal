import type {
    BookingExtended,
    Revenue,
    Settlement,
    Payment,
    AdminAccount,
    PermissionModule,
    BusCompanyAdmin,
    TripExtended,
    DailyRevenue,
} from '@/types'

// ─── Daily Revenue (last 30 days) ─────────────────────────────────────────────

const now = new Date()
export const MOCK_DAILY_REVENUES: DailyRevenue[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (29 - i))
    const gross = 15_000_000 + Math.floor(Math.random() * 35_000_000)
    const commission = Math.floor(gross * 0.05)
    return {
        date: d.toISOString().slice(0, 10),
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        gross,
        commission,
        net: gross - commission,
        bookings: 40 + Math.floor(Math.random() * 120),
    }
})

// ─── Bookings ─────────────────────────────────────────────────────────────────

const ROUTES = [
    { label: 'TP.HCM → Đà Lạt', companyId: 'c1', companyName: 'Phương Trang', routeId: 'r1' },
    { label: 'TP.HCM → Nha Trang', companyId: 'c2', companyName: 'Thành Bưởi', routeId: 'r2' },
    { label: 'Hà Nội → Huế', companyId: 'c3', companyName: 'Hoàng Long', routeId: 'r3' },
    { label: 'TP.HCM → Vũng Tàu', companyId: 'c1', companyName: 'Phương Trang', routeId: 'r4' },
    { label: 'Hà Nội → Đà Nẵng', companyId: 'c3', companyName: 'Hoàng Long', routeId: 'r5' },
]

const USERS = [
    { name: 'Nguyễn Minh Khoa', email: 'khoa.nguyen@gmail.com', phone: '0912345678' },
    { name: 'Phạm Thị Lan', email: 'lan.pham@gmail.com', phone: '0987654321' },
    { name: 'Trần Quốc Bảo', email: 'bao.tran@gmail.com', phone: '0901234567' },
    { name: 'Lê Thị Thu', email: 'thu.le@gmail.com', phone: '0976543210' },
    { name: 'Võ Văn Nam', email: 'nam.vo@gmail.com', phone: '0923456789' },
    { name: 'Đặng Thị Hương', email: 'huong.dang@gmail.com', phone: '0934567890' },
    { name: 'Bùi Văn Đức', email: 'duc.bui@gmail.com', phone: '0945678901' },
    { name: 'Hoàng Thị Yến', email: 'yen.hoang@gmail.com', phone: '0956789012' },
]

const STATUSES: BookingExtended['status'][] = [
    'confirmed', 'confirmed', 'confirmed', 'confirmed',
    'cancelled', 'expired', 'pending_payment', 'completed', 'completed',
]

const PAYMENT_METHODS: BookingExtended['paymentMethod'][] = ['online', 'online', 'online', 'pay_on_board']

export const MOCK_BOOKINGS: BookingExtended[] = Array.from({ length: 40 }, (_, i) => {
    const route = ROUTES[i % ROUTES.length]
    const user = USERS[i % USERS.length]
    const status = STATUSES[i % STATUSES.length]
    const method = PAYMENT_METHODS[i % PAYMENT_METHODS.length]
    const d = new Date(now)
    d.setDate(d.getDate() - Math.floor(Math.random() * 14))
    const dep = new Date(d)
    dep.setDate(dep.getDate() + 1 + Math.floor(Math.random() * 7))
    const seats = 1 + Math.floor(Math.random() * 3)
    const amount = (seats * (180_000 + Math.floor(Math.random() * 220_000)))

    return {
        id: `bk${i + 1}`,
        bookingCode: `VX${String(1000 + i).padStart(6, '0')}`,
        userId: `u${(i % 5) + 3}`,
        tripId: `t${(i % 6) + 1}`,
        totalAmount: amount,
        paymentMethod: method,
        status,
        paymentStatus: status === 'confirmed' || status === 'completed' ? 'completed' : 'pending',
        expiresAt: new Date(d.getTime() + 30 * 60000).toISOString(),
        createdAt: d.toISOString(),
        userEmail: user.email,
        userPhone: user.phone,
        userName: user.name,
        routeLabel: route.label,
        companyName: route.companyName,
        companyId: route.companyId,
        departureTime: dep.toISOString(),
        seatCount: seats,
    }
})

// ─── Revenues ─────────────────────────────────────────────────────────────────

export const MOCK_REVENUES: Revenue[] = MOCK_BOOKINGS
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .map((b, i) => ({
        id: `rev${i + 1}`,
        bookingId: b.id,
        bookingCode: b.bookingCode,
        companyId: b.companyId,
        companyName: b.companyName,
        grossAmount: b.totalAmount,
        commissionRate: 5,
        commissionAmount: Math.floor(b.totalAmount * 0.05),
        netAmount: Math.floor(b.totalAmount * 0.95),
        paymentType: b.paymentMethod,
        createdAt: b.createdAt,
    }))

// ─── Payments ─────────────────────────────────────────────────────────────────

export const MOCK_PAYMENTS: Payment[] = MOCK_BOOKINGS.map((b, i) => ({
    id: `pay${i + 1}`,
    bookingId: b.id,
    provider: b.paymentMethod === 'online' ? ['VNPay', 'Momo', 'ZaloPay'][i % 3] : 'Nhà xe',
    method: b.paymentMethod,
    transactionCode: `TXN${String(100000 + i).padStart(8, '0')}`,
    status: b.paymentStatus,
    amount: b.totalAmount,
    completedAt: b.paymentStatus === 'completed' ? b.createdAt : undefined,
    createdAt: b.createdAt,
}))

// ─── Settlements ──────────────────────────────────────────────────────────────

export const MOCK_SETTLEMENTS: Settlement[] = [
    {
        id: 's1',
        companyId: 'c1',
        companyName: 'Phương Trang',
        periodFrom: '2025-02-01',
        periodTo: '2025-02-28',
        totalGross: 485_000_000,
        totalCommission: 24_250_000,
        totalNet: 460_750_000,
        status: 'paid',
        paidAt: '2025-03-05T10:00:00.000Z',
        referenceCode: 'SETTLE-PT-202502',
        bookingCount: 312,
        createdAt: '2025-03-01T00:00:00.000Z',
    },
    {
        id: 's2',
        companyId: 'c2',
        companyName: 'Thành Bưởi',
        periodFrom: '2025-02-01',
        periodTo: '2025-02-28',
        totalGross: 320_000_000,
        totalCommission: 16_000_000,
        totalNet: 304_000_000,
        status: 'paid',
        paidAt: '2025-03-05T10:00:00.000Z',
        referenceCode: 'SETTLE-TB-202502',
        bookingCount: 198,
        createdAt: '2025-03-01T00:00:00.000Z',
    },
    {
        id: 's3',
        companyId: 'c3',
        companyName: 'Hoàng Long',
        periodFrom: '2025-02-01',
        periodTo: '2025-02-28',
        totalGross: 270_000_000,
        totalCommission: 13_500_000,
        totalNet: 256_500_000,
        status: 'pending',
        bookingCount: 165,
        createdAt: '2025-03-01T00:00:00.000Z',
    },
    {
        id: 's4',
        companyId: 'c1',
        companyName: 'Phương Trang',
        periodFrom: '2025-03-01',
        periodTo: '2025-03-31',
        totalGross: 512_000_000,
        totalCommission: 25_600_000,
        totalNet: 486_400_000,
        status: 'pending',
        bookingCount: 334,
        createdAt: '2025-04-01T00:00:00.000Z',
    },
    {
        id: 's5',
        companyId: 'c2',
        companyName: 'Thành Bưởi',
        periodFrom: '2025-03-01',
        periodTo: '2025-03-31',
        totalGross: 290_000_000,
        totalCommission: 14_500_000,
        totalNet: 275_500_000,
        status: 'pending',
        bookingCount: 178,
        createdAt: '2025-04-01T00:00:00.000Z',
    },
]

// ─── Admin Accounts ───────────────────────────────────────────────────────────

export const MOCK_ADMINS: AdminAccount[] = [
    {
        id: 'a1',
        username: 'superadmin',
        fullName: 'Nguyễn Văn Admin',
        roleId: 'role1',
        roleName: 'Super Admin',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
        id: 'a2',
        username: 'moderator1',
        fullName: 'Trần Thị Mod',
        roleId: 'role2',
        roleName: 'Moderator',
        isActive: true,
        createdAt: '2024-02-01T00:00:00.000Z',
    },
    {
        id: 'a3',
        username: 'finance1',
        fullName: 'Lê Văn Tài',
        roleId: 'role3',
        roleName: 'Finance',
        isActive: true,
        createdAt: '2024-02-15T00:00:00.000Z',
    },
    {
        id: 'a4',
        username: 'support1',
        fullName: 'Phạm Thị Hỗ Trợ',
        roleId: 'role4',
        roleName: 'Support',
        isActive: true,
        createdAt: '2024-03-01T00:00:00.000Z',
    },
    {
        id: 'a5',
        username: 'support2',
        fullName: 'Võ Đình Hùng',
        roleId: 'role4',
        roleName: 'Support',
        isActive: false,
        createdAt: '2024-03-10T00:00:00.000Z',
    },
]

// ─── Permission Modules ───────────────────────────────────────────────────────

export const MOCK_PERMISSION_MODULES: PermissionModule[] = [
    {
        id: 'pm1',
        name: 'Nhà xe',
        description: 'Quản lý nhà xe',
        permissions: [
            { id: 'p1', method: 'GET', path: '/admin/companies', description: 'Xem danh sách nhà xe', module: 'Nhà xe' },
            { id: 'p2', method: 'POST', path: '/admin/companies', description: 'Thêm nhà xe', module: 'Nhà xe' },
            { id: 'p3', method: 'PUT', path: '/admin/companies/:id', description: 'Cập nhật nhà xe', module: 'Nhà xe' },
            { id: 'p4', method: 'DELETE', path: '/admin/companies/:id', description: 'Xóa nhà xe', module: 'Nhà xe' },
        ],
    },
    {
        id: 'pm2',
        name: 'Người dùng',
        description: 'Quản lý tài khoản người dùng',
        permissions: [
            { id: 'p5', method: 'GET', path: '/admin/users', description: 'Xem danh sách người dùng', module: 'Người dùng' },
            { id: 'p6', method: 'POST', path: '/admin/users', description: 'Tạo người dùng', module: 'Người dùng' },
            { id: 'p7', method: 'PUT', path: '/admin/users/:id', description: 'Cập nhật người dùng', module: 'Người dùng' },
            { id: 'p8', method: 'DELETE', path: '/admin/users/:id', description: 'Xóa người dùng', module: 'Người dùng' },
        ],
    },
    {
        id: 'pm3',
        name: 'Đặt vé',
        description: 'Quản lý đặt vé',
        permissions: [
            { id: 'p9', method: 'GET', path: '/admin/bookings', description: 'Xem đặt vé', module: 'Đặt vé' },
            { id: 'p10', method: 'PUT', path: '/admin/bookings/:id', description: 'Cập nhật đặt vé', module: 'Đặt vé' },
            { id: 'p11', method: 'DELETE', path: '/admin/bookings/:id', description: 'Hủy đặt vé', module: 'Đặt vé' },
        ],
    },
    {
        id: 'pm4',
        name: 'Doanh thu',
        description: 'Quản lý doanh thu & quyết toán',
        permissions: [
            { id: 'p12', method: 'GET', path: '/admin/revenues', description: 'Xem doanh thu', module: 'Doanh thu' },
            { id: 'p13', method: 'GET', path: '/admin/settlements', description: 'Xem quyết toán', module: 'Doanh thu' },
            { id: 'p14', method: 'POST', path: '/admin/settlements', description: 'Tạo kỳ quyết toán', module: 'Doanh thu' },
            { id: 'p15', method: 'PUT', path: '/admin/settlements/:id', description: 'Cập nhật quyết toán', module: 'Doanh thu' },
        ],
    },
    {
        id: 'pm5',
        name: 'Tuyến đường',
        description: 'Quản lý tuyến đường & địa điểm',
        permissions: [
            { id: 'p16', method: 'GET', path: '/admin/locations', description: 'Xem địa điểm', module: 'Tuyến đường' },
            { id: 'p17', method: 'POST', path: '/admin/locations', description: 'Thêm địa điểm', module: 'Tuyến đường' },
            { id: 'p18', method: 'GET', path: '/admin/routes', description: 'Xem tuyến đường', module: 'Tuyến đường' },
            { id: 'p19', method: 'POST', path: '/admin/routes', description: 'Thêm tuyến đường', module: 'Tuyến đường' },
        ],
    },
    {
        id: 'pm6',
        name: 'Quản trị',
        description: 'Quản lý admin & phân quyền',
        permissions: [
            { id: 'p20', method: 'GET', path: '/admin/admins', description: 'Xem danh sách admin', module: 'Quản trị' },
            { id: 'p21', method: 'POST', path: '/admin/admins', description: 'Tạo admin', module: 'Quản trị' },
            { id: 'p22', method: 'GET', path: '/admin/roles', description: 'Xem roles', module: 'Quản trị' },
            { id: 'p23', method: 'POST', path: '/admin/roles', description: 'Tạo role', module: 'Quản trị' },
            { id: 'p24', method: 'PUT', path: '/admin/roles/:id', description: 'Cập nhật role', module: 'Quản trị' },
        ],
    },
]

// ─── Bus Company Admins ───────────────────────────────────────────────────────

export const MOCK_COMPANY_ADMINS: BusCompanyAdmin[] = [
    {
        id: 'ca1', adminId: 'u2', companyId: 'c1', position: 'owner',
        fullName: 'Trần Văn Tuấn', username: 'tuanphuong', email: 'tuanphuong@vexe.vn',
        phone: '0900000002', isActive: true, createdAt: '2024-01-05T00:00:00.000Z',
    },
    {
        id: 'ca2', adminId: 'ca_staff1', companyId: 'c1', position: 'staff',
        fullName: 'Phan Thị Nga', username: 'ngaphuongtrang', email: 'nga@phuongtrang.com.vn',
        phone: '0911111001', isActive: true, createdAt: '2024-02-01T00:00:00.000Z',
    },
    {
        id: 'ca3', adminId: 'u3', companyId: 'c2', position: 'owner',
        fullName: 'Lê Thị Hoa', username: 'hoathanh', email: 'hoathanh@vexe.vn',
        phone: '0900000003', isActive: true, createdAt: '2024-01-08T00:00:00.000Z',
    },
    {
        id: 'ca4', adminId: 'ca_staff2', companyId: 'c3', position: 'owner',
        fullName: 'Ngô Đức Trung', username: 'trunghoanlong', email: 'trung@hoanglong.vn',
        phone: '0935000001', isActive: true, createdAt: '2024-01-12T00:00:00.000Z',
    },
]

// ─── Extended Trips ───────────────────────────────────────────────────────────

export const MOCK_TRIPS_EXTENDED: TripExtended[] = [
    {
        id: 't1', companyId: 'c1', routeId: 'r1', busId: 'b1', busVersionId: 'bv1',
        departureTime: new Date(Date.now() + 2 * 3600000).toISOString(),
        arrivalTime: new Date(Date.now() + 8 * 3600000).toISOString(),
        pricePerSeat: 250_000, availableSeats: 4, status: 'scheduled', isPublished: true,
        routeLabel: 'TP.HCM → Đà Lạt', fromLabel: 'TP.HCM', toLabel: 'Đà Lạt',
        busName: 'Limousine VIP 9 chỗ', seatsSold: 5, totalSeats: 9, revenue: 1_250_000,
        createdAt: '2025-03-01T00:00:00.000Z',
    },
    {
        id: 't2', companyId: 'c1', routeId: 'r4', busId: 'b2', busVersionId: 'bv2',
        departureTime: new Date(Date.now() + 5 * 3600000).toISOString(),
        arrivalTime: new Date(Date.now() + 7 * 3600000).toISOString(),
        pricePerSeat: 150_000, availableSeats: 12, status: 'scheduled', isPublished: true,
        routeLabel: 'TP.HCM → Vũng Tàu', fromLabel: 'TP.HCM', toLabel: 'Vũng Tàu',
        busName: 'Ghế ngồi 40 chỗ', seatsSold: 28, totalSeats: 40, revenue: 4_200_000,
        createdAt: '2025-03-01T00:00:00.000Z',
    },
    {
        id: 't3', companyId: 'c2', routeId: 'r2', busId: 'b3', busVersionId: 'bv3',
        departureTime: new Date(Date.now() + 3 * 3600000).toISOString(),
        arrivalTime: new Date(Date.now() + 12 * 3600000).toISOString(),
        pricePerSeat: 320_000, availableSeats: 8, status: 'scheduled', isPublished: true,
        routeLabel: 'TP.HCM → Nha Trang', fromLabel: 'TP.HCM', toLabel: 'Nha Trang',
        busName: 'Sleeper 34 chỗ', seatsSold: 26, totalSeats: 34, revenue: 8_320_000,
        createdAt: '2025-03-01T00:00:00.000Z',
    },
    {
        id: 't4', companyId: 'c3', routeId: 'r3', busId: 'b4', busVersionId: 'bv4',
        departureTime: new Date(Date.now() + 6 * 3600000).toISOString(),
        arrivalTime: new Date(Date.now() + 20 * 3600000).toISOString(),
        pricePerSeat: 420_000, availableSeats: 10, status: 'scheduled', isPublished: true,
        routeLabel: 'Hà Nội → Huế', fromLabel: 'Hà Nội', toLabel: 'Huế',
        busName: 'Giường nằm 40 chỗ', seatsSold: 30, totalSeats: 40, revenue: 12_600_000,
        createdAt: '2025-03-01T00:00:00.000Z',
    },
    {
        id: 't5', companyId: 'c3', routeId: 'r5', busId: 'b4', busVersionId: 'bv4',
        departureTime: new Date(Date.now() - 2 * 3600000).toISOString(),
        arrivalTime: new Date(Date.now() + 12 * 3600000).toISOString(),
        pricePerSeat: 380_000, availableSeats: 0, status: 'active', isPublished: true,
        routeLabel: 'Hà Nội → Đà Nẵng', fromLabel: 'Hà Nội', toLabel: 'Đà Nẵng',
        busName: 'Giường nằm 40 chỗ', seatsSold: 40, totalSeats: 40, revenue: 15_200_000,
        createdAt: '2025-03-01T00:00:00.000Z',
    },
]

// ─── Company stats (for top 10 bar chart) ────────────────────────────────────

export const MOCK_COMPANY_REVENUE: { name: string; revenue: number; bookings: number }[] = [
    { name: 'Phương Trang', revenue: 512_000_000, bookings: 334 },
    { name: 'Thành Bưởi', revenue: 290_000_000, bookings: 178 },
    { name: 'Hoàng Long', revenue: 270_000_000, bookings: 165 },
    { name: 'Phúc Xuyên', revenue: 185_000_000, bookings: 120 },
    { name: 'An Phú', revenue: 156_000_000, bookings: 98 },
    { name: 'Minh Hải', revenue: 134_000_000, bookings: 85 },
    { name: 'Toàn Thắng', revenue: 112_000_000, bookings: 72 },
    { name: 'Thuận An', revenue: 98_000_000, bookings: 63 },
    { name: 'Bình Dương Express', revenue: 76_000_000, bookings: 48 },
    { name: 'Mai Linh Express', revenue: 64_000_000, bookings: 41 },
]
