interface IPermissionRowProps {
    label: string
    hasWrite: boolean
    readLabel: string
    writeLabel: string
    read: boolean
    write: boolean
    rowIndex: number
    disabled?: boolean
    onReadChange: (checked: boolean) => void
    onWriteChange: (checked: boolean) => void
}

export const PermissionRow = ({
    label,
    hasWrite,
    readLabel,
    writeLabel,
    read,
    write,
    rowIndex,
    disabled,
    onReadChange,
    onWriteChange,
}: IPermissionRowProps) => (
    <div
        className={[
            'grid grid-cols-[minmax(0,1fr)_90px_90px] items-center px-4 py-3 text-[13px]',
            rowIndex % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white',
        ].join(' ')}
    >
        <span className="font-medium text-slate-800">{label}</span>

        <label className="flex items-center justify-center gap-2 text-sm text-slate-700">
            <span>{readLabel}</span>
            <input
                type="checkbox"
                checked={read}
                disabled={disabled}
                onChange={(event) => onReadChange(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
            />
        </label>

        {hasWrite ? (
            <label className="flex items-center justify-center gap-2 text-sm text-slate-700">
                <span>{writeLabel}</span>
                <input
                    type="checkbox"
                    checked={write}
                    disabled={disabled || !read}
                    onChange={(event) => onWriteChange(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                />
            </label>
        ) : (
            <div />
        )}
    </div>
)
