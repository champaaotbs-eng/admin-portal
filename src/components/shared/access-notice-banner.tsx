import { ShieldAlert } from 'lucide-react'

interface AccessNoticeBannerProps {
    title: string
    description: string
}

export const AccessNoticeBanner = ({ title, description }: AccessNoticeBannerProps) => {
    return (
        <div className="rounded-lg border border-amber-300/40 bg-amber-50/70 p-4 text-amber-900">
            <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="space-y-1">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-sm text-amber-800">{description}</p>
                </div>
            </div>
        </div>
    )
}
