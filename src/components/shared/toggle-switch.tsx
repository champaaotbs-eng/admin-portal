export const ToggleSwitch = ({
    checked,
    onChange,
    disabled,
}: {
    checked: boolean
    onChange: (value: boolean) => void
    disabled?: boolean
}) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={[
            'relative inline-flex h-7 w-12 items-center rounded-full transition-colors',
            checked ? 'bg-primary' : 'bg-slate-300',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        ].join(' ')}
    >
        <span
            className={[
                'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
                checked ? 'translate-x-6' : 'translate-x-1',
            ].join(' ')}
        />
    </button>
)