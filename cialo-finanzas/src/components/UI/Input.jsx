import './Input.css'

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    helperText,
    icon,
    required = false,
    disabled = false,
    fullWidth = true,
    className = '',
    ...props
}) => {
    const classes = [
        'input-wrapper',
        fullWidth && 'input-full',
        error && 'input-error',
        disabled && 'input-disabled',
        className
    ].filter(Boolean).join(' ')

    return (
        <div className={classes}>
            {label && (
                <label className="input-label">
                    {label}
                    {required && <span className="input-required">*</span>}
                </label>
            )}
            <div className="input-container">
                {icon && <span className="input-icon">{icon}</span>}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={`input ${icon ? 'input-with-icon' : ''}`}
                    {...props}
                />
            </div>
            {(error || helperText) && (
                <span className={`input-helper ${error ? 'input-helper-error' : ''}`}>
                    {error || helperText}
                </span>
            )}
        </div>
    )
}

export const Select = ({
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Seleccionar...',
    error,
    required = false,
    disabled = false,
    fullWidth = true,
    className = '',
    ...props
}) => {
    const classes = [
        'input-wrapper',
        fullWidth && 'input-full',
        error && 'input-error',
        disabled && 'input-disabled',
        className
    ].filter(Boolean).join(' ')

    return (
        <div className={classes}>
            {label && (
                <label className="input-label">
                    {label}
                    {required && <span className="input-required">*</span>}
                </label>
            )}
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className="input select"
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <span className="input-helper input-helper-error">{error}</span>}
        </div>
    )
}

export const Textarea = ({
    label,
    value,
    onChange,
    placeholder,
    error,
    rows = 4,
    required = false,
    disabled = false,
    fullWidth = true,
    className = '',
    ...props
}) => {
    const classes = [
        'input-wrapper',
        fullWidth && 'input-full',
        error && 'input-error',
        disabled && 'input-disabled',
        className
    ].filter(Boolean).join(' ')

    return (
        <div className={classes}>
            {label && (
                <label className="input-label">
                    {label}
                    {required && <span className="input-required">*</span>}
                </label>
            )}
            <textarea
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                rows={rows}
                className="input textarea"
                {...props}
            />
            {error && <span className="input-helper input-helper-error">{error}</span>}
        </div>
    )
}

export default Input
