import React, { useState } from "react";
import {
  MessageSquare,
  Search,
  Check,
  Clock,
  CheckCircle2,
  Trash2,
  Eye,
  RefreshCw,
  Mail,
  Phone,
  User,
  AlertCircle,
  X,
  Send,
  LoaderCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import DataTable from "../../components/common/DataTable";
import SearchInput from "../../components/ui/SearchInput";
import Pagination from "../../components/ui/Pagination";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import useDebouncedValue from "../../utils/useDebouncedValue";
import {
  useGetContactQueriesQuery,
  useGetContactStatsQuery,
  useUpdateContactQueryMutation,
  useDeleteContactQueryMutation,
} from "../../services/contactApi";

export default function MessageList() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 600);

  // Queries & Mutations
  const {
    data: queriesResponse,
    isLoading: loadingQueries,
    isFetching,
    refetch,
  } = useGetContactQueriesQuery({
    page,
    limit: 10,
    status: statusFilter,
    search: debouncedSearch,
  });

  const { data: statsResponse } = useGetContactStatsQuery();

  const [updateQuery, { isLoading: isUpdating }] = useUpdateContactQueryMutation();
  const [deleteQuery, { isLoading: isDeleting }] = useDeleteContactQueryMutation();

  // Modal states
  const [activeModalQuery, setActiveModalQuery] = useState(null);
  const [editStatus, setEditStatus] = useState("pending");
  const [editNotes, setEditNotes] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const rawQueries = queriesResponse?.data || [];
  const pagination = queriesResponse?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  };

  const stats = statsResponse?.data || {
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
  };

  const handleOpenDetailModal = (query) => {
    setActiveModalQuery(query);
    setEditStatus(query.status || "pending");
    setEditNotes(query.admin_notes || "");
  };

  const handleCloseDetailModal = () => {
    setActiveModalQuery(null);
  };

  const handleSaveStatus = async (e) => {
    if (e) e.preventDefault();
    if (!activeModalQuery) return;

    try {
      await updateQuery({
        id: activeModalQuery.id,
        status: editStatus,
        admin_notes: editNotes,
      }).unwrap();

      toast.success("Inquiry updated successfully! ✨");
      handleCloseDetailModal();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update inquiry");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      await deleteQuery(deleteConfirmId).unwrap();
      toast.success("Contact inquiry deleted");
      setDeleteConfirmId(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete inquiry");
    }
  };

  const getStatusBadge = (status) => {
    if (status === "resolved") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            background: "#d1fae5",
            color: "#065f46",
            padding: "3px 8px",
            borderRadius: "9999px",
            fontSize: "11.5px",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          <CheckCircle2 size={12} /> Resolved
        </span>
      );
    }
    if (status === "in_progress") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            background: "#dbeafe",
            color: "#1e40af",
            padding: "3px 8px",
            borderRadius: "9999px",
            fontSize: "11.5px",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          <Clock size={12} /> In Progress
        </span>
      );
    }
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          background: "#fef3c7",
          color: "#b45309",
          padding: "3px 8px",
          borderRadius: "9999px",
          fontSize: "11.5px",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        <AlertCircle size={12} /> Pending
      </span>
    );
  };

  const columns = [
    {
      key: "customer",
      label: "CUSTOMER",
      maxWidth: "200px",
      render: (_, row) => (
        <div style={{ maxWidth: "200px" }}>
          <div
            style={{
              fontWeight: 700,
              color: "#111827",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={row.name}
          >
            {row.name}
          </div>
          <div
            style={{
              fontSize: "11.5px",
              color: "#6b7280",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={row.email}
          >
            {row.email}
          </div>
          {row.phone && (
            <div style={{ fontSize: "11px", color: "#9ca3af" }}>
              📞 {row.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "subject",
      label: "SUBJECT & MESSAGE",
      maxWidth: "340px",
      render: (_, row) => (
        <div style={{ maxWidth: "340px" }}>
          <div
            style={{
              fontWeight: 700,
              color: "#1f2937",
              fontSize: "13px",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
            title={row.subject}
          >
            {row.subject}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#6b7280",
              marginTop: "2px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
            title={row.message}
          >
            {row.message}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (status) => getStatusBadge(status),
    },
    {
      key: "created_at",
      label: "RECEIVED",
      render: (date) => (
        <div style={{ fontSize: "12px", color: "#4b5563" }}>
          {new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
          <div style={{ fontSize: "11px", color: "#9ca3af" }}>
            {new Date(date).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ paddingBottom: "32px" }}>
      {/* SECTION HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={24} color="#4f7d16" />
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>
              Customer Inquiries & Messages
            </h1>
          </div>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "13px" }}>
            Review, track, and respond to incoming customer queries from the Contact Us form.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            color: "#374151",
            fontWeight: 600,
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* TOTAL */}
        <div
          style={{
            background: "#ffffff",
            padding: "16px 20px",
            borderRadius: "16px",
            border: "1px solid #f0f0f5",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "#f4f8ec",
              display: "grid",
              placeItems: "center",
              color: "#4f7d16",
            }}
          >
            <MessageSquare size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#8b8ba0" }}>
              TOTAL INQUIRIES
            </p>
            <h3 style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: 800, color: "#1f2937" }}>
              {stats.total}
            </h3>
          </div>
        </div>

        {/* PENDING */}
        <div
          style={{
            background: "#ffffff",
            padding: "16px 20px",
            borderRadius: "16px",
            border: "1px solid #f0f0f5",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "#fffbeb",
              display: "grid",
              placeItems: "center",
              color: "#d97706",
            }}
          >
            <AlertCircle size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#8b8ba0" }}>
              PENDING REVIEW
            </p>
            <h3 style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: 800, color: "#d97706" }}>
              {stats.pending}
            </h3>
          </div>
        </div>

        {/* IN PROGRESS */}
        <div
          style={{
            background: "#ffffff",
            padding: "16px 20px",
            borderRadius: "16px",
            border: "1px solid #f0f0f5",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "#eff6ff",
              display: "grid",
              placeItems: "center",
              color: "#2563eb",
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#8b8ba0" }}>
              IN PROGRESS
            </p>
            <h3 style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: 800, color: "#2563eb" }}>
              {stats.in_progress}
            </h3>
          </div>
        </div>

        {/* RESOLVED */}
        <div
          style={{
            background: "#ffffff",
            padding: "16px 20px",
            borderRadius: "16px",
            border: "1px solid #f0f0f5",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "#ecfdf5",
              display: "grid",
              placeItems: "center",
              color: "#059669",
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#8b8ba0" }}>
              RESOLVED
            </p>
            <h3 style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: 800, color: "#059669" }}>
              {stats.resolved}
            </h3>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div
        style={{
          background: "#ffffff",
          padding: "16px 20px",
          borderRadius: "16px",
          border: "1px solid #f0f0f5",
          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {/* Status Filter Tabs */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: "All Inquiries" },
            { id: "pending", label: "Pending" },
            { id: "in_progress", label: "In Progress" },
            { id: "resolved", label: "Resolved" },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: "10px",
                  border: isActive ? "1px solid #4f7d16" : "1px solid #e5e7eb",
                  background: isActive ? "#4f7d16" : "#ffffff",
                  color: isActive ? "#ffffff" : "#4b5563",
                  fontWeight: 700,
                  fontSize: "12.5px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Debounced Search Input */}
        <div style={{ minWidth: "260px", flex: 1, maxWidth: "420px" }}>
          <SearchInput
            placeholder="Search by customer, subject, message..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* INQUIRIES DATA TABLE */}
      <DataTable
        loading={loadingQueries || isFetching}
        data={rawQueries}
        columns={columns}
        emptyMessage="No customer contact inquiries found."
        renderActions={(row) => (
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              onClick={() => handleOpenDetailModal(row)}
              title="View & Manage Inquiry"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 10px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                color: "#374151",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Eye size={13} /> View
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirmId(row.id)}
              title="Delete Inquiry"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                border: "1px solid #fee2e2",
                background: "#fef2f2",
                color: "#dc2626",
                cursor: "pointer",
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      />

      {/* PAGINATION */}
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={pagination.limit || 10}
        onPageChange={(p) => setPage(p)}
        itemLabel="inquiries"
      />

      {/* VIEW & MANAGE INQUIRY MODAL */}
      {activeModalQuery && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1050,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            className="modal-container"
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              width: "100%",
              maxWidth: "600px",
              padding: "24px",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "16px",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#111827" }}>
                  Customer Inquiry #{activeModalQuery.id}
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6b7280" }}>
                  Received on {new Date(activeModalQuery.created_at).toLocaleString("en-IN")}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseDetailModal}
                style={{
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Customer Details Box */}
            <div
              style={{
                margin: "16px 0",
                background: "#f9fafb",
                borderRadius: "14px",
                padding: "14px",
                border: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <User size={15} color="#4f7d16" />
                <span style={{ fontWeight: 700, fontSize: "13.5px", color: "#111827" }}>
                  {activeModalQuery.name}
                </span>
                {activeModalQuery.user_id && (
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#15803d",
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "1px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    Registered Customer
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "12.5px" }}>
                <a
                  href={`mailto:${activeModalQuery.email}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#2563eb",
                    fontWeight: 600,
                  }}
                >
                  <Mail size={13} /> {activeModalQuery.email}
                </a>

                {activeModalQuery.phone && (
                  <a
                    href={`tel:${activeModalQuery.phone}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#059669",
                      fontWeight: 600,
                    }}
                  >
                    <Phone size={13} /> {activeModalQuery.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Subject & Message Content */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#6b7280", textTransform: "uppercase" }}>
                Subject
              </label>
              <p
                style={{
                  margin: "4px 0 12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#111827",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                {activeModalQuery.subject}
              </p>

              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#6b7280", textTransform: "uppercase" }}>
                Message
              </label>
              <div
                style={{
                  marginTop: "4px",
                  padding: "14px",
                  borderRadius: "12px",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  fontSize: "13.5px",
                  lineHeight: "1.6",
                  color: "#374151",
                  maxHeight: "180px",
                  overflowY: "auto",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                {activeModalQuery.message}
              </div>
            </div>

            {/* Status & Admin Notes Form */}
            <form onSubmit={handleSaveStatus}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#6b7280", textTransform: "uppercase", marginBottom: "4px" }}>
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    fontSize: "13px",
                    fontWeight: 600,
                    outline: "none",
                    background: "#ffffff",
                  }}
                >
                  <option value="pending">Pending Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#6b7280", textTransform: "uppercase", marginBottom: "4px" }}>
                  Admin Decision Notes (Internal)
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes about resolution, customer call, email response..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    fontSize: "13px",
                    outline: "none",
                    resize: "none",
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleCloseDetailModal}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    background: "#ffffff",
                    color: "#4b5563",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "9px 18px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#4f7d16",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: isUpdating ? "not-allowed" : "pointer",
                    opacity: isUpdating ? 0.7 : 1,
                  }}
                >
                  {isUpdating ? (
                    <>
                      <LoaderCircle size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {deleteConfirmId && (
      <ConfirmDialog
        open={deleteConfirmId}
        title="Delete Contact Inquiry?"
        message="Are you sure you want to delete this customer inquiry? This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={isDeleting}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
      />
    )}
    </div>
  );
}
