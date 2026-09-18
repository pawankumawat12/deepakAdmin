import { useState } from "react";
import toast from "react-hot-toast";
import {
  X,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  Store,
  Mail,
  User,
  RefreshCw,
} from "lucide-react";
import {
  useGetStoreRequestsQuery,
  useApproveStoreRequestMutation,
  useRejectStoreRequestMutation,
} from "../services/storeApi";
import Button from "../components/ui/Button";

export default function StoreAccessRequestsModal({ isOpen, onClose }) {
  const [filter, setFilter] = useState("pending");
  const { data, isLoading, refetch, isFetching } = useGetStoreRequestsQuery(
    { status: filter },
    { skip: !isOpen }
  );
  const [approveRequest, { isLoading: isApproving }] = useApproveStoreRequestMutation();
  const [rejectRequest, { isLoading: isRejecting }] = useRejectStoreRequestMutation();
  const [processingId, setProcessingId] = useState(null);

  if (!isOpen) return null;

  const requests = data?.requests || [];

  const handleApprove = async (id, ownerEmail) => {
    try {
      setProcessingId(id);
      const res = await approveRequest(id).unwrap();
      toast.success(res?.message || `Approved! Setup email sent to ${ownerEmail}`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessingId(id);
      const res = await rejectRequest(id).unwrap();
      toast.success(res?.message || "Request rejected.");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="admin-dialog admin-dialog-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="requests-modal-title"
        style={{ display: "flex", flexDirection: "column", maxHeight: "88vh" }}
      >
        <Button
          variant="plain"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </Button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="confirm-icon" style={{ color: "#d97706", background: "#fef3c7" }}>
              <KeyRound size={22} />
            </span>
            <div>
              <h2 id="requests-modal-title" style={{ margin: 0, fontSize: "19px" }}>
                Store Access Requests
              </h2>
              <p style={{ margin: "2px 0 0", color: "#6b7280", fontSize: "12.5px" }}>
                Review and approve first-time login requests from Store Owners.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh requests"
            style={{ padding: "6px 10px",
              position: 'relative',
              top: "45px",
              left: "15px"}}
          >
            <RefreshCw size={15} className={isFetching ? "spin" : ""} />
          </Button>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "8px",
            marginBottom: "16px",
          }}
        >
          {[
            { key: "pending", label: "Pending Approval" },
            { key: "approved", label: "Approved" },
            { key: "rejected", label: "Rejected" },
            { key: "all", label: "All Requests" },
          ].map((tab) => {
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "7px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: isActive ? "#f0fdf4" : "transparent",
                  color: isActive ? "#15803d" : "#6b7280",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Requests List */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
          {isLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>
              <RefreshCw size={24} className="spin" style={{ margin: "0 auto 8px" }} />
              Loading access requests...
            </div>
          ) : requests.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#f3f4f6",
                  color: "#9ca3af",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 12px",
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "#374151" }}>
                No {filter} requests found
              </p>
              <p style={{ margin: "4px 0 0", color: "#9ca3af", fontSize: "12px" }}>
                When a Store Owner enters their email to request access, their request will appear here for live approval.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {requests.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    background: "#ffffff",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>
                        {item.owner_name || item.user_name || "Store Owner"}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          background:
                            item.status === "approved"
                              ? "#dcfce7"
                              : item.status === "rejected"
                              ? "#fee2e2"
                              : "#fef3c7",
                          color:
                            item.status === "approved"
                              ? "#15803d"
                              : item.status === "rejected"
                              ? "#b91c1c"
                              : "#b45309",
                        }}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "4px", fontSize: "12px", color: "#6b7280" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Store size={13} color="#166534" /> {item.store_name}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Mail size={13} color="#6b7280" /> {item.email}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={13} color="#9ca3af" />
                        {new Date(item.created_at).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Pending Requests */}
                  {item.status === "pending" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Button
                        type="button"
                        onClick={() => handleApprove(item.id, item.email)}
                        disabled={processingId === item.id || isApproving || isRejecting}
                        style={{ background: "#166534", fontSize: "12px", padding: "6px 12px" }}
                      >
                        {processingId === item.id && isApproving ? "Approving..." : "Approve & Send Email"}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleReject(item.id)}
                        disabled={processingId === item.id || isApproving || isRejecting}
                        style={{ fontSize: "12px", padding: "6px 12px", color: "#b91c1c", borderColor: "#fecaca" }}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="confirm-actions" style={{ marginTop: "16px", borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </section>
    </div>
  );
}
