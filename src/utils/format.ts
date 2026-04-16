import i18n from '@/i18n'

/**
 * Format a number as Vietnamese Dong (VND)
 */
export function formatVnd(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount)
}

/**
 * Format a Date or ISO string as "DD-MM-YYYY"
 */
export function formatDate(input: string | Date): string {
    const d = new Date(input)
    const dd = String(d.getDate()).padStart(2, '0')
    const MM = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}-${MM}-${yyyy}`
}

/**
 * Format a Date or ISO string as "HH:mm:ss DD-MM-YYYY"
 */
export function formatDateTime(input: string | Date): string {
    const d = new Date(input)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${hh}:${mm}:${ss} ${formatDate(d)}`
}

/**
 * Format duration in minutes to "Xh Ym"
 */
export function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0) return `${m} ${i18n.t('common.minutes')}`
    if (m === 0) return `${h}h`
    return i18n.t('common.duration_format', { h, m })
}

/**
 * Get time string "HH:mm" from a Date or ISO string
 */
export function formatTime(input: string | Date): string {
    const d = new Date(input)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
}

/**
 * Slugify text for URL
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFC')
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
        .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
        .replace(/[ìíịỉĩ]/g, 'i')
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
        .replace(/[ùúụủũưừứựửữ]/g, 'u')
        .replace(/[ỳýỵỷỹ]/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
}

export const toSnakeCaseNoAccent = (str: string) => {
    return str
        // Normalize unicode (separate accents)
        .normalize("NFD")
        // Remove accents
        .replace(/[\u0300-\u036f]/g, "")
        // Convert đ → d
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        // Lowercase
        .toLowerCase()
        // Replace non-alphanumeric with underscore
        .replace(/[^a-z0-9]+/g, "_")
        // Remove leading/trailing underscores
        .replace(/^_+|_+$/g, "")
        // Remove duplicate underscores
        .replace(/_+/g, "_");
}

export const splitBoundaryName = (fullName: string) => {
    const parts = fullName.split('-')
    if (parts.length >= 2) {
        return { prefix: parts[0], name: parts.slice(1).join('-') }
    }
    return { prefix: '', name: fullName }
}
