import { EBusType } from 'types/bus'
import type { IBus } from 'types/bus'

export const BUS_TYPES = [EBusType.SEAT, EBusType.SLEEPER, EBusType.LIMOUSINE] as const
export type BusType = typeof BUS_TYPES[number]

export type FleetItem = IBus
