export interface Province {
    id: string; name: string; code: string; divisionType: string
}

export interface Location {
    id: string; name: string; address: string; provinceId: string; provinceName: string; lat: number; lng: number
}

export interface RouteItem {
    id: string; fromId: string; fromLabel: string; toId: string; toLabel: string
    distanceKm: number; estimatedMinutes: number; tripCount: number; isActive: boolean
}

export const provinces: Province[] = [
    { id: 'p1', name: 'TP. Ho Chi Minh', code: '79', divisionType: 'Thanh pho truc thuoc TW' },
    { id: 'p2', name: 'Ha Noi', code: '01', divisionType: 'Thanh pho truc thuoc TW' },
    { id: 'p3', name: 'Da Nang', code: '48', divisionType: 'Thanh pho truc thuoc TW' },
    { id: 'p4', name: 'Can Tho', code: '92', divisionType: 'Thanh pho truc thuoc TW' },
    { id: 'p5', name: 'Binh Duong', code: '74', divisionType: 'Tinh' },
    { id: 'p6', name: 'Dong Nai', code: '75', divisionType: 'Tinh' },
    { id: 'p7', name: 'Khanh Hoa', code: '56', divisionType: 'Tinh' },
    { id: 'p8', name: 'Lam Dong', code: '68', divisionType: 'Tinh' },
]

export const locations: Location[] = [
    { id: 'l1', name: 'Ben xe Mien Dong', address: '292 Dinh Bo Linh, Q. Binh Thanh', provinceId: 'p1', provinceName: 'TP. Ho Chi Minh', lat: 10.8190, lng: 106.7040 },
    { id: 'l2', name: 'Ben xe Mien Tay', address: '395 Kinh Duong Vuong, Q. Binh Tan', provinceId: 'p1', provinceName: 'TP. Ho Chi Minh', lat: 10.7418, lng: 106.6262 },
    { id: 'l3', name: 'Ben xe Gia Lam', address: 'Yen Vien, Long Bien', provinceId: 'p2', provinceName: 'Ha Noi', lat: 21.0487, lng: 105.8956 },
    { id: 'l4', name: 'Ben xe My Dinh', address: 'My Dinh, Nam Tu Liem', provinceId: 'p2', provinceName: 'Ha Noi', lat: 21.0285, lng: 105.7824 },
    { id: 'l5', name: 'Ben xe Da Nang', address: '33 Tran The Phap, Q. Son Tra', provinceId: 'p3', provinceName: 'Da Nang', lat: 16.0544, lng: 108.2022 },
    { id: 'l6', name: 'Ben xe Can Tho', address: '91B Nguyen Trai, Ninh Kieu', provinceId: 'p4', provinceName: 'Can Tho', lat: 10.0360, lng: 105.7878 },
    { id: 'l7', name: 'Ben xe Nha Trang', address: '30/4 Nha Trang, Khanh Hoa', provinceId: 'p7', provinceName: 'Khanh Hoa', lat: 12.2388, lng: 109.1968 },
    { id: 'l8', name: 'Ben xe Da Lat', address: '01 Ton Duc Thang, Da Lat', provinceId: 'p8', provinceName: 'Lam Dong', lat: 11.9404, lng: 108.4583 },
]

export const routes: RouteItem[] = [
    { id: 'r1', fromId: 'l1', fromLabel: 'TP. HCM (Ben xe Mien Dong)', toId: 'l3', toLabel: 'Ha Noi (Ben xe Gia Lam)', distanceKm: 1726, estimatedMinutes: 1680, tripCount: 45, isActive: true },
    { id: 'r2', fromId: 'l2', fromLabel: 'TP. HCM (Ben xe Mien Tay)', toId: 'l6', toLabel: 'Can Tho (Ben xe Can Tho)', distanceKm: 168, estimatedMinutes: 210, tripCount: 128, isActive: true },
    { id: 'r3', fromId: 'l1', fromLabel: 'TP. HCM (Ben xe Mien Dong)', toId: 'l7', toLabel: 'Nha Trang (Ben xe Nha Trang)', distanceKm: 440, estimatedMinutes: 480, tripCount: 62, isActive: true },
    { id: 'r4', fromId: 'l1', fromLabel: 'TP. HCM (Ben xe Mien Dong)', toId: 'l8', toLabel: 'Da Lat (Ben xe Da Lat)', distanceKm: 308, estimatedMinutes: 360, tripCount: 87, isActive: true },
    { id: 'r5', fromId: 'l4', fromLabel: 'Ha Noi (Ben xe My Dinh)', toId: 'l5', toLabel: 'Da Nang (Ben xe Da Nang)', distanceKm: 764, estimatedMinutes: 840, tripCount: 33, isActive: true },
    { id: 'r6', fromId: 'l5', fromLabel: 'Da Nang (Ben xe Da Nang)', toId: 'l7', toLabel: 'Nha Trang (Ben xe Nha Trang)', distanceKm: 530, estimatedMinutes: 600, tripCount: 24, isActive: false },
]

export const fmtDuration = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}g ${m}p` : `${h}g`
}
