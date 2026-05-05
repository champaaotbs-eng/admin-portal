import type { IPayment } from 'types/payment'
import type { EPaymentProvider } from 'types/payment'
import { api } from 'utils/axios.instance'

export interface IInitiatePaymentPayload {
    bookingId: string
    provider: EPaymentProvider
    returnUrl: string
}

export const getPublicPaymentByBookingId = async (bookingId: string) => {
    const response = await api.get<IPayment>(`/payments/${bookingId}`)
    return response
}

export const initiatePayment = async (payload: IInitiatePaymentPayload) => {
    const response = await api.post<{ paymentUrl: string }>('/payments/initiate', {
        bookingId: payload.bookingId,
        provider: payload.provider,
        returnUrl: payload.returnUrl,
    })
    return response
}
