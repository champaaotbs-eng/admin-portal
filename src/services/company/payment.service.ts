import type { IPayment } from 'types/payment'
import { api } from 'utils/axios.instance'

export interface ConfirmCompanyPaymentOnBoardPayload {
    collectedAmount: number
    evidence?: string
    note?: string
}

export const confirmCompanyPaymentOnBoard = async (
    paymentId: string,
    payload: ConfirmCompanyPaymentOnBoardPayload,
) => {
    const response = await api.patch<IPayment>(`/v1/company/payments/${paymentId}/confirm-on-board`, payload)
    return response
}
