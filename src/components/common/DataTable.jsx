export default function DataTable({
  columns,
  data,
  renderActions,
  emptyMessage = "No records found.",
}) {
  return (
    <div className="card table-card">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              {renderActions && <th>ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              data.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="actions">{renderActions(row)}</td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="empty-cell"
                  colSpan={columns.length + Number(Boolean(renderActions))}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
