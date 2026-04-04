import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import vi from './locales/vi.json'
import { errorsEn } from '@/lib/i18n/errors.en'
import { errorsVi } from '@/lib/i18n/errors.vi'

export const SUPPORTED_LANGS = ['vi', 'en'] as const
export type SupportedLang = (typeof SUPPORTED_LANGS)[number]
export const DEFAULT_LANG: SupportedLang = 'vi'
export const LANG_STORAGE_KEY = 'vexe_lang'

const enTranslations = {
    ...en,
    errors: {
        ...(((en as Record<string, unknown>).errors as Record<string, string> | undefined) ?? {}),
        ...errorsEn,
    },
}

const viTranslations = {
    ...vi,
    errors: {
        ...(((vi as Record<string, unknown>).errors as Record<string, string> | undefined) ?? {}),
        ...errorsVi,
    },
}

i18n
    .use(initReactI18next)
    .init({
        resources: {
            vi: { translation: viTranslations },
            en: { translation: enTranslations },
        },
        // Pin to DEFAULT_LANG so server and client render identically.
        // The client restores the user's saved preference after hydration.
        lng: DEFAULT_LANG,
        fallbackLng: DEFAULT_LANG,
        supportedLngs: SUPPORTED_LANGS,
        interpolation: {
            escapeValue: false,
        },
    })

export default i18n
