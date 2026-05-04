// Request payload types
export interface ICreateSeat {
    seatCode: string;
    row: number;
    col: number;
    floor: number;
    seatType: SeatType;
}

export interface ICreateSeatLayout {
    busCompanyId: string;
    name: string;
    numberRows: number;
    numberCols: number;
    numberFloors?: number;
    seats?: ICreateSeat[];
}

export interface IUpdateSeatLayout extends Partial<ICreateSeatLayout> { }

// API response types
export interface ISeatLayout {
    seatLayoutId: string;
    busCompanyId: string;
    name: string;
    numberRows: number;
    numberCols: number;
    numberFloors: number;
    createdAt: Date;
    updatedAt: Date;
    seats?: ISeat[];
}

export interface ISeat {
    seatId: string
    layoutId: string
    seatCode: string
    row: number
    col: number
    floor: number
    seatType: SeatType
}

// Aliases for compatibility
export type SeatType = ESeatType
export type ISeatLayoutUpsertPayload = ICreateSeatLayout

export enum ESeatType {
    STANDARD = 'STANDARD',
    VIP = 'VIP',
    BED = 'BED',
}
