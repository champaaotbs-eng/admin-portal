// ─── Roles ────────────────────────────────────────────────────────────────────

// ─── User ─────────────────────────────────────────────────────────────────────



// ─── Bus Company ──────────────────────────────────────────────────────────────

export interface BusCompany {
    id: string
    name: string
    phone: string
    email: string
    address: string
    serviceFee: number // percentage
    logoUrl?: string
    status: 'active' | 'locked'
    isActive: boolean
    createdAt: string
}

// ─── Bus ──────────────────────────────────────────────────────────────────────

export type BusType = 'seat' | 'sleeper' | 'vip'

export interface Bus {
    id: string
    companyId: string
    plateNumber: string
    name: string
    busCode?: string
    description?: string
    totalSeats: number
    type: BusType
    isActive: boolean
    createdAt?: string
}

// ─── Bus Version ──────────────────────────────────────────────────────────────

export interface BusVersion {
    id: string
    busId: string
    versionNo: number
    driverPhone?: string
    status: string
    createdAt: string
}

// ─── Location & Geography ─────────────────────────────────────────────────────

export interface Province {
    id: string
    name: string
    code: string
    divisionType?: string
}

export interface Ward {
    id: string
    provinceId: string
    name: string
    code: string
    divisionType?: string
}

export interface Location {
    id: string
    name: string
    address?: string
    wardId?: string
    provinceId: string
    latitude?: number
    longitude?: number
    isActive: boolean
    createdAt: string
}

// ─── Route (Itinerary) ────────────────────────────────────────────────────────

export interface RouteItinerary {
    id: string
    from: string
    to: string
    fromLocationId?: string
    toLocationId?: string
    distanceKm: number
    estimatedMinutes: number
}

// ─── Trip ─────────────────────────────────────────────────────────────────────

export type TripStatus = 'scheduled' | 'active' | 'completed' | 'cancelled'

export interface Trip {
    id: string
    companyId: string
    routeId: string
    busId: string
    busVersionId?: string
    departureTime: string // ISO string
    arrivalTime: string   // ISO string
    pricePerSeat: number  // VND (base_price)
    availableSeats: number
    status: TripStatus
    isPublished?: boolean
    cancelReason?: string
    createdAt?: string
}

// ─── Trip Pickup / Dropoff Points ─────────────────────────────────────────────

export interface TripPickupPoint {
    id: string
    tripId: string
    locationId: string
    pickupTime: string
    note?: string
    location?: Location
}

export interface TripDropoffPoint {
    id: string
    tripId: string
    locationId: string
    dropoffTime: string
    note?: string
    location?: Location
}

// ─── Seat Layout ──────────────────────────────────────────────────────────────

export interface SeatLayout {
    id: string
    companyId: string
    name: string
    rows: number
    columns: number
    createdAt: string
}

export interface Seat {
    id: string
    layoutId: string
    seatCode: string
    row: number
    col: number
    floor: number
    seatType: string
    price: number
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export type BookingStatus =
    | 'pending_payment'
    | 'reserved'
    | 'confirmed'
    | 'cancelled'
    | 'expired'
    | 'completed'

export type PaymentMethod = 'online' | 'pay_on_board'

export interface Booking {
    id: string
    bookingCode: string
    userId: string
    tripId: string
    totalAmount: number
    paymentMethod: PaymentMethod
    status: BookingStatus
    expiresAt?: string
    createdAt: string
}

export interface BookingSeat {
    id: string
    bookingId: string
    seatId: string
    price: number
}

// ─── Ticket (kept for backward compatibility with mock) ───────────────────────

export type TicketStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Ticket {
    id: string
    tripId: string
    customerId: string
    seatNumbers: string[]
    totalPrice: number
    status: TicketStatus
    passengerName: string
    passengerPhone: string
    note?: string
    createdAt: string
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Payment {
    id: string
    bookingId: string
    provider: string
    method: PaymentMethod
    transactionCode: string
    status: PaymentStatus
    amount: number
    completedAt?: string
    createdAt: string
}

// ─── Revenue ──────────────────────────────────────────────────────────────────

export interface Revenue {
    id: string
    bookingId: string
    bookingCode: string
    companyId: string
    companyName: string
    grossAmount: number
    commissionRate: number
    commissionAmount: number
    netAmount: number
    paymentType: PaymentMethod
    createdAt: string
}

// ─── Settlement ───────────────────────────────────────────────────────────────

export type SettlementStatus = 'pending' | 'paid'

export interface Settlement {
    id: string
    companyId: string
    companyName: string
    periodFrom: string
    periodTo: string
    totalGross: number
    totalCommission: number
    totalNet: number
    status: SettlementStatus
    paidAt?: string
    referenceCode?: string
    bookingCount: number
    createdAt: string
}

// ─── Admin / RBAC ─────────────────────────────────────────────────────────────

export interface AdminAccount {
    id: string
    username: string
    fullName: string
    roleId: string
    roleName: string
    isActive: boolean
    avatarUrl?: string
    createdAt: string
}

export interface PermissionItem {
    id: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    path: string
    description: string
    module: string
}

export interface PermissionModule {
    id: string
    name: string
    description: string
    permissions: PermissionItem[]
}

// ─── Bus Company Admin ────────────────────────────────────────────────────────

export interface BusCompanyAdmin {
    id: string
    adminId: string
    companyId: string
    position: 'owner' | 'staff'
    fullName: string
    username: string
    email: string
    phone?: string
    isActive: boolean
    createdAt: string
}

// ─── Booking extended (with user/trip info) ───────────────────────────────────

export interface BookingExtended extends Booking {
    userEmail: string
    userPhone: string
    userName: string
    routeLabel: string
    companyName: string
    companyId: string
    departureTime: string
    seatCount: number
    paymentStatus: PaymentStatus
}

// ─── Trip extended ────────────────────────────────────────────────────────────

export interface TripExtended extends Trip {
    routeLabel: string
    fromLabel: string
    toLabel: string
    busName: string
    seatsSold: number
    totalSeats: number
    revenue: number
}

// ─── Daily Revenue (for charts) ───────────────────────────────────────────────

export interface DailyRevenue {
    date: string
    label: string
    gross: number
    commission: number
    net: number
    bookings: number
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface TripSearchParams {
    from: string
    to: string
    date: string // YYYY-MM-DD
    passengers?: number
}

export interface TripWithDetails extends Trip {
    company: BusCompany
    route: RouteItinerary
    bus: Bus
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface AdminStats {
    totalUsers: number
    totalCompanies: number
    totalTrips: number
    totalTickets: number
    totalRevenueVnd: number
}

export interface CompanyStats {
    totalBuses: number
    totalTrips: number
    totalBookings: number
    revenueVnd: number
    upcomingTrips: number
}
