import { Building2, UploadCloud } from 'lucide-react'

interface CompanyLogoUploadProps {
    currentLogoUrl?: string
    previewUrl: string | null
    fileName?: string
    fileSizeLabel?: string
    onFileSelect: (file: File) => void
    onRemove: () => void
    error?: string
}

/**
 * Upload and preview logo file with validation messaging.
 */
export const CompanyLogoUpload = ({
    currentLogoUrl,
    previewUrl,
    fileName,
    fileSizeLabel,
    onFileSelect,
    onRemove,
    error,
}: CompanyLogoUploadProps) => {
    const activeLogo = previewUrl ?? currentLogoUrl ?? null

    const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        onFileSelect(file)
    }

    return (
        <div className="space-y-2">
            <label className="mb-2 block text-sm font-medium text-slate-800">Logo</label>

            {activeLogo ? (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <img src={activeLogo} alt="Company logo" className="h-[120px] w-[120px] rounded-lg object-cover" />
                        {fileName ? <p className="max-w-[220px] truncate text-xs text-slate-700">{fileName}</p> : null}
                        {fileSizeLabel ? <p className="text-xs text-slate-500">{fileSizeLabel}</p> : null}
                        <div className="flex items-center gap-3 text-sm">
                            <label className="cursor-pointer text-blue-600 hover:underline">
                                Change
                                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleSelect} />
                            </label>
                            <button type="button" onClick={onRemove} className="text-rose-600 hover:underline">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <label className="block cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-blue-300 hover:bg-blue-50/30">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <UploadCloud className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">Click to upload or drag & drop</p>
                        <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleSelect} />
                </label>
            )}

            {!activeLogo ? (
                <div className="flex h-[120px] w-[120px] items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Building2 className="h-8 w-8" />
                </div>
            ) : null}

            {error ? <p className="text-xs text-rose-600">{error}</p> : null}
        </div>
    )
}
