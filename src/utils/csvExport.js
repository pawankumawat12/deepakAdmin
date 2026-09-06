/**
 * Exports data to a CSV file and triggers a browser download.
 * Handles commas, double quotes, newlines, and prepends UTF-8 BOM
 * for perfect compatibility with Microsoft Excel and Google Sheets.
 *
 * @param {Object} options
 * @param {string} options.filename - e.g. "orders-export-2026-09-05.csv"
 * @param {Array<{ key: string, label: string }>} options.columns - Column definitions
 * @param {Array<Object>} options.data - Array of row objects
 */
export function exportToCsv({ filename = "export.csv", columns, data }) {
  if (!Array.isArray(columns) || columns.length === 0) {
    console.warn("exportToCsv: No columns specified.");
    return;
  }

  if (!Array.isArray(data)) {
    data = [];
  }

  const escapeField = (val) => {
    if (val === null || val === undefined) return "";
    let str = typeof val === "object" ? JSON.stringify(val) : String(val);
    // If field contains quote, comma, or newline, escape quotes and wrap in quotes
    if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
      str = `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Header row
  const headerRow = columns.map((col) => escapeField(col.label || col.key)).join(",");

  // Data rows
  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        let value;
        if (typeof col.getValue === "function") {
          value = col.getValue(row);
        } else {
          value = row[col.key];
        }
        return escapeField(value);
      })
      .join(",")
  );

  const csvContent = [headerRow, ...dataRows].join("\r\n");

  // \uFEFF is UTF-8 BOM so Excel opens UTF-8 characters without corruption
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

