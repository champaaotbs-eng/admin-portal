export interface ISeatLayout {
    seatLayoutId: string
    companyId: string
    name: string
    rows: number
    columns: number
    createdAt: string
}

export interface ISeat {
    seatId: string
    layoutId: string
    seatCode: string
    row: number
    col: number
    floor: number
    seatType: ESeatType
    price: number
}

export enum ESeatType {
    STANDARD = 'STANDARD',
    VIP = 'VIP',
    BED = 'BED',
}
