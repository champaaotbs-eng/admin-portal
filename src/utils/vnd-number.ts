export const parseVndNumberInput = (value: string) => value.replace(/\D/g, '')

export const formatVndNumberInput = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') return ''

    const numericValue = typeof value === 'number'
        ? value
        : Number(parseVndNumberInput(String(value)))

    if (!Number.isFinite(numericValue)) return ''
    return numericValue.toLocaleString('vi-VN')
}
