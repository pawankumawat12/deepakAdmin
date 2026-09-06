import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import Skeleton from "../ui/Skeleton";

export default function DataTable({
  columns,
  data = [],
  renderActions,
  emptyMessage = "No records found.",
  
  // Backend sorting
  sortBy,
  sortOrder = "asc",
  onSort,
  
  // States
  loading = false,
  
  // Optional
  showSerialNumber = false,
  
  // Selection
  selectable = false,
  selectedIds = [],
  onSelectAll,
  onSelectRow,
  getRowId = (row) => row.id,
}) {
  const handleSort = (column) => {
    // Only sortable columns can trigger sorting
    if (!column.sortable || !onSort) return;

    let newSortOrder = "asc";

    if (sortBy === column.key) {
      newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    }

    onSort(column.key, newSortOrder);
  };

  const renderSortIcon = (column) => {
    if (!column.sortable) return null;

    if (sortBy !== column.key) {
      return <FaSort className="ms-2 text-muted" size={12} />;
    }

    return sortOrder === "asc" ? (
      <FaSortUp className="ms-2" size={12} />
    ) : (
      <FaSortDown className="ms-2" size={12} />
    );
  };

  const totalColumns =
    columns.length +
    Number(Boolean(renderActions)) +
    Number(Boolean(showSerialNumber)) +
    Number(Boolean(selectable));

  const allPageIds = data.map(getRowId);
  const isAllSelected =
    data.length > 0 && allPageIds.every((id) => selectedIds.includes(id));
  const isSomeSelected =
    data.length > 0 &&
    !isAllSelected &&
    allPageIds.some((id) => selectedIds.includes(id));

  return (
    <div className="card border-0 shadow-sm">
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              {selectable && (
                <th scope="col" style={{ width: "42px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isSomeSelected;
                    }}
                    onChange={(e) => onSelectAll && onSelectAll(e.target.checked, allPageIds)}
                    aria-label="Select all on this page"
                  />
                </th>
              )}

              {showSerialNumber && (
                <th scope="col" style={{ width: "70px" }}>
                  #
                </th>
              )}

              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  style={{
                    cursor:
                      column.sortable && onSort ? "pointer" : "default",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => handleSort(column)}
                >
                  <div> {column.label}
                    {renderSortIcon(column)}</div>
                </th>
              ))}

              {renderActions && (
                <th
                  scope="col"
                  style={{
                    width: "120px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ACTIONS
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <Skeleton variant="table-rows" rows={6} columns={totalColumns} />
            ) : data.length > 0 ? (
              data.map((row, index) => {
                const rowId = getRowId(row);
                const isSelected = selectedIds.includes(rowId);
                return (
                <tr key={row.id || row._id || index} className={isSelected ? "table-active" : ""}>
                  {selectable && (
                    <td style={{ width: "42px", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={isSelected}
                        onChange={(e) => onSelectRow && onSelectRow(rowId, e.target.checked, row)}
                        aria-label={`Select row ${rowId}`}
                      />
                    </td>
                  )}

                  {showSerialNumber && (
                    <td>{index + 1}</td>
                  )}

                  {columns.map((column) => (
                    <td
                      key={column.key}
                      style={{
                     
                        maxWidth: column.maxWidth || "320px",
                        minWidth: column.minWidth || "140px",
                      }}
                      title={
                        typeof row[column.key] === "string" && !column.render
                          ? row[column.key]
                          : undefined
                      }
                    >
                      {column.render
                        ? column.render(row[column.key], row, index)
                        : row[column.key] ?? "-"}
                    </td>
                  ))}

                  {renderActions && (
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {renderActions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })) : (
              <tr>
                <td
                  colSpan={totalColumns}
                  className="text-center text-muted py-5"
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