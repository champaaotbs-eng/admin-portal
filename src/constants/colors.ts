/**
 * Standard color palette for the VéXe admin portal.
 *
 * All components MUST use these tokens instead of arbitrary Tailwind color
 * classes (e.g. "text-blue-500") so that theme changes only require edits
 * here and in styles.css.
 *
 * Semantic tokens map 1-to-1 to the CSS variables declared in styles.css
 * (@theme inline block).  Direct Tailwind utility names are listed for
 * convenience — they are already wired up via the @theme block.
 */

// ─── Semantic design tokens (Tailwind classes) ────────────────────────────────

export const COLORS = {
    // ── Backgrounds ──────────────────────────────────────────────────────────
    bg: {
        /** Page background */
        page: 'bg-background',
        /** Card / panel background */
        card: 'bg-card',
        /** Muted / subtle surface */
        muted: 'bg-muted',
        /** Subtle tinted surface (~30% muted) */
        mutedLight: 'bg-muted/30',
        /** Secondary surface */
        secondary: 'bg-secondary',
        /** Accent surface */
        accent: 'bg-accent',
        /** Sidebar background */
        sidebar: 'bg-sidebar',
    },

    // ── Text ─────────────────────────────────────────────────────────────────
    text: {
        /** Default body text */
        base: 'text-foreground',
        /** Secondary / helper text */
        muted: 'text-muted-foreground',
        /** Text on primary-colored backgrounds */
        onPrimary: 'text-primary-foreground',
        /** Text on card backgrounds */
        onCard: 'text-card-foreground',
    },

    // ── Brand / primary ───────────────────────────────────────────────────────
    primary: {
        bg: 'bg-primary',
        text: 'text-primary',
        border: 'border-primary',
        ring: 'ring-primary',
    },

    // ── Destructive / error ───────────────────────────────────────────────────
    destructive: {
        bg: 'bg-destructive',
        text: 'text-destructive',
        bgLight: 'bg-destructive/10',
    },

    // ── Border / input ────────────────────────────────────────────────────────
    border: 'border-border',
    input: 'border-input',
    ring: 'ring-ring',

    // ── Chart palette ─────────────────────────────────────────────────────────
    chart: {
        1: 'text-chart-1',
        2: 'text-chart-2',
        3: 'text-chart-3',
        4: 'text-chart-4',
        5: 'text-chart-5',
    },
} as const

// ─── Status colors ────────────────────────────────────────────────────────────
// Used for badge + icon colorization across all status fields.

export const STATUS_COLORS = {
    // booking / trip status
    confirmed: { text: 'text-green-600', bg: 'bg-green-500/10', hex: '#16a34a' },
    completed: { text: 'text-blue-600', bg: 'bg-blue-500/10', hex: '#2563eb' },
    cancelled: { text: 'text-red-600', bg: 'bg-red-500/10', hex: '#dc2626' },
    pending: { text: 'text-yellow-700', bg: 'bg-yellow-500/10', hex: '#a16207' },
    expired: { text: 'text-orange-600', bg: 'bg-orange-500/10', hex: '#ea580c' },
    scheduled: { text: 'text-violet-600', bg: 'bg-violet-500/10', hex: '#7c3aed' },
    reserved: { text: 'text-purple-600', bg: 'bg-purple-500/10', hex: '#9333ea' },
    in_progress: { text: 'text-amber-700', bg: 'bg-amber-500/10', hex: '#b45309' },
    active: { text: 'text-green-600', bg: 'bg-green-500/10', hex: '#16a34a' },
    inactive: { text: 'text-slate-500', bg: 'bg-slate-500/10', hex: '#64748b' },
    locked: { text: 'text-red-600', bg: 'bg-red-500/10', hex: '#dc2626' },
} as const

export type StatusKey = keyof typeof STATUS_COLORS

// ─── Payment colors ───────────────────────────────────────────────────────────

export const PAYMENT_COLORS = {
    paid: { text: 'text-green-600', bg: 'bg-green-500/10' },
    unpaid: { text: 'text-yellow-700', bg: 'bg-yellow-500/10' },
    refunded: { text: 'text-slate-500', bg: 'bg-slate-500/10' },
    failed: { text: 'text-red-600', bg: 'bg-red-500/10' },
} as const

export type PaymentColorKey = keyof typeof PAYMENT_COLORS

// ─── Role label colors ────────────────────────────────────────────────────────

export const COMPANY_ROLE_COLORS = {
    owner: 'text-purple-600 bg-purple-50',
    manager: 'text-blue-600   bg-blue-50',
    driver: 'text-green-600  bg-green-50',
    agent: 'text-orange-600 bg-orange-50',
} as const

// ─── HTTP-method badge colors (used in roles/permissions) ─────────────────────

export const HTTP_METHOD_COLORS: Record<string, string> = {
    GET: 'bg-blue-500/10   text-blue-600',
    POST: 'bg-green-500/10  text-green-600',
    PUT: 'bg-yellow-500/10 text-yellow-700',
    PATCH: 'bg-orange-500/10 text-orange-600',
    DELETE: 'bg-red-500/10    text-red-600',
}

// ─── KPI / stat card accent colors ───────────────────────────────────────────
// Used for the icon container in dashboard cards.

export const STAT_COLORS = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-500/10' },
    green: { text: 'text-green-600', bg: 'bg-green-500/10' },
    red: { text: 'text-red-600', bg: 'bg-red-500/10' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-500/10' },
    yellow: { text: 'text-yellow-700', bg: 'bg-yellow-500/10' },
    violet: { text: 'text-violet-600', bg: 'bg-violet-500/10' },
    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-500/10' },
} as const

export type StatColorKey = keyof typeof STAT_COLORS

// ─── Chart hex values ─────────────────────────────────────────────────────────
// Pass these directly to chart components that require raw hex strings.

export const CHART_HEX = {
    blue: '#2563eb',
    green: '#16a34a',
    red: '#dc2626',
    orange: '#ea580c',
    yellow: '#ca8a04',
    violet: '#7c3aed',
    emerald: '#059669',
    purple: '#9333ea',
    slate: '#64748b',
} as const
