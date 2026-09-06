import { CheckSquare, X } from "lucide-react";
import Button from "../ui/Button";

export default function BulkActionBar({
  selectedCount = 0,
  onClearSelection,
  itemLabel = "items",
  children,
}) {
  if (selectedCount === 0) return null;

  return (
    <div
      className="bulk-action-bar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        padding: "10px 16px",
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "8px",
        marginBottom: "14px",
        color: "#166534",
        fontSize: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <CheckSquare size={18} color="#15803d" />
        <span>
          <strong>{selectedCount}</strong> {selectedCount === 1 ? itemLabel.replace(/s$/, "") : itemLabel} selected
        </span>
        {onClearSelection && (
          <button
            type="button"
            onClick={onClearSelection}
            style={{
              background: "none",
              border: "none",
              color: "#6b7280",
              cursor: "pointer",
              fontSize: "13px",
              textDecoration: "underline",
              padding: "2px 6px",
              marginLeft: "4px",
            }}
          >
            Deselect all
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {children}
      </div>
    </div>
  );
}

