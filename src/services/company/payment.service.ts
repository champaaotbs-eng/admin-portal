import type { IPayment } from 'types/payment'
import { api } from 'utils/axios.instance'

export const confirmCompanyPaymentOnBoard = async (paymentId: string) => {
    const response = await api.patch<IPayment>(`/company/payments/${paymentId}/confirm-on-board`)
    return response
}
