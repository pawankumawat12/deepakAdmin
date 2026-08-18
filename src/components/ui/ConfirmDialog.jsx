import { AlertTriangle, LoaderCircle, X } from "lucide-react";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
  danger = true,
  isLoading = false,
  error = "",
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <section
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <span className={danger ? "confirm-icon danger" : "confirm-icon"}>
          <AlertTriangle size={22} />
        </span>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        {error && <p className="confirm-error">{error}</p>}
        <div className="confirm-actions">
          <button className="outline-btn" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            className={danger ? "danger-btn" : "primary-btn"}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <LoaderCircle size={16} className="spin" />}
            {isLoading ? "Signing out..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
