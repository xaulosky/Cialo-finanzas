import './Card.css'

const Card = ({
    children,
    title,
    subtitle,
    icon,
    actions,
    padding = 'md', // none, sm, md, lg
    className = '',
    onClick,
    ...props
}) => {
    const classes = [
        'card',
        `card-padding-${padding}`,
        onClick && 'card-clickable',
        className
    ].filter(Boolean).join(' ')

    return (
        <div className={classes} onClick={onClick} {...props}>
            {(title || actions) && (
                <div className="card-header">
                    <div className="card-header-content">
                        {icon && <span className="card-icon">{icon}</span>}
                        <div className="card-titles">
                            {title && <h3 className="card-title">{title}</h3>}
                            {subtitle && <p className="card-subtitle">{subtitle}</p>}
                        </div>
                    </div>
                    {actions && <div className="card-actions">{actions}</div>}
                </div>
            )}
            <div className="card-body">{children}</div>
        </div>
    )
}

export default Card
