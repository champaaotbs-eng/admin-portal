import type { IPayment } from 'types/payment'
import { api } from 'utils/axios.instance'

export const getPublicPaymentByBookingId = async (bookingId: string) => {
    const response = await api.get<IPayment>(`/payments/${bookingId}`)
    return response
}
