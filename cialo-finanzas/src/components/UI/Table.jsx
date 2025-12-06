import './Table.css'

const Table = ({
    columns = [],
    data = [],
    loading = false,
    emptyMessage = 'No hay datos disponibles',
    emptyIcon = '📋',
    onRowClick,
    className = '',
}) => {
    if (loading) {
        return (
            <div className="table-loading">
                <div className="loading-spinner" />
                <p>Cargando datos...</p>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="table-empty">
                <span className="table-empty-icon">{emptyIcon}</span>
                <p>{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className={`table-container ${className}`}>
            <table className="table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                style={{ width: col.width, textAlign: col.align || 'left' }}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={row.id || rowIndex}
                            onClick={() => onRowClick?.(row)}
                            className={onRowClick ? 'clickable' : ''}
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    style={{ textAlign: col.align || 'left' }}
                                >
                                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Table
