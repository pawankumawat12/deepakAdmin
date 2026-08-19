import { AlertTriangle, LoaderCircle, X } from "lucide-react";
import Button from "./Button";

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
        <Button
          variant="plain"
          className="modal-close"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close"
        >
          <X size={18} />
        </Button>
        <span className={danger ? "confirm-icon danger" : "confirm-icon"}>
          <AlertTriangle size={22} />
        </span>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        {error && <p className="confirm-error">{error}</p>}
        <div className="confirm-actions">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className={danger ? "danger-btn" : ""}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <LoaderCircle size={16} className="spin" />}
            {isLoading ? "Signing out..." : confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
