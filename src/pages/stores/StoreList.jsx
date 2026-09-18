import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getAdminSocket } from "../../services/socket";
import {
  Store,
  Plus,
  KeyRound,
  Trash2,
  Pencil,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Check,
  X,
  Package,
  ShoppingBag,
} from "lucide-react";
import {
  useGetStoresQuery,
  useUpdateStoreMutation,
  useToggleStoreStatusMutation,
  useToggleStoreAutoForwardMutation,
  useDeleteStoreMutation,
  useGetStoreRequestsQuery,
  useApproveStoreRequestMutation,
  useRejectStoreRequestMutation,
} from "../../services/storeApi";
import DataTable from "../../components/common/DataTable";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Pagination from "../../components/ui/Pagination";
import CreateStoreModal from "../../modals/CreateStoreModal";
import EditStoreModal from "../../modals/EditStoreModal";

const EMPTY_STORES = [];

// Modern Toggle Switch with icon inside sliding thumb
function PermissionToggle({
  isActive,
  isPending = false,
  onClick,
  disabled = false,
  title = "",
}) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
      <button
        type="button"
        role="switch"
        aria-checked={Boolean(isActive)}
        onClick={onClick}
        disabled={disabled}
        title={title}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          width: "44px",
          height: "24px",
          borderRadius: "9999px",
          background: isPending ? "#cbd5e1" : isActive ? "#16a34a" : "#dc2626",
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          padding: "2px",
          transition: "background 0.2s ease",
          opacity: disabled ? 0.6 : 1,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            transform: isActive ? "translateX(20px)" : "translateX(0px)",
            transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            color: isPending ? "#64748b" : isActive ? "#16a34a" : "#dc2626",
          }}
        >
          {isActive ? (
            <Check size={12} strokeWidth={3.5} />
          ) : (
            <X size={12} strokeWidth={3.5} />
          )}
        </span>
      </button>

      <span
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: isPending ? "#64748b" : isActive ? "#15803d" : "#b91c1c",
          userSelect: "none",
        }}
      >
        {isPending ? "Pending (Click to Allow)" : isActive ? "Allowed" : "Denied"}
      </span>
    </div>
  );
}

export default function StoreList() {
  const navigate = useNavigate();
  // Primary Tabs: "stores" | "requests"
  const [activeTab, setActiveTab] = useState("stores");

  // Stores State
  const [storeSearch, setStoreSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storesPage, setStoresPage] = useState(1);
  const storesLimit = 10;

  // Access Requests State
  const [requestFilter, setRequestFilter] = useState("all");
  const [requestSearch, setRequestSearch] = useState("");
  const [requestsPage, setRequestsPage] = useState(1);
  const requestsLimit = 10;

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [storeToDelete, setStoreToDelete] = useState(null);

  // Queries
  const {
    data: storesData,
    isLoading: isStoresLoading,
    refetch: refetchStores,
    isFetching: isStoresFetching,
  } = useGetStoresQuery({
    search: storeSearch.trim(),
    is_open: statusFilter === "open" ? true : statusFilter === "closed" ? false : undefined,
    page: storesPage,
    limit: storesLimit,
  });

  const {
    data: requestsData,
    isLoading: isRequestsLoading,
    refetch: refetchRequests,
    isFetching: isRequestsFetching,
  } = useGetStoreRequestsQuery({
    status: requestFilter,
    search: requestSearch.trim(),
    page: requestsPage,
    limit: requestsLimit,
  });

  // Query for pending request count badge
  const { data: pendingRequestsData } = useGetStoreRequestsQuery({ status: "pending" });
  const pendingCount =
    pendingRequestsData?.pagination?.total ?? (pendingRequestsData?.requests?.length || 0);

  // Mutations
  const [updateStore] = useUpdateStoreMutation();
  const [toggleStatus] = useToggleStoreStatusMutation();
  const [toggleAutoForward] = useToggleStoreAutoForwardMutation();
  const [deleteStore, { isLoading: isDeleting }] = useDeleteStoreMutation();
  const [approveRequest, { isLoading: isApproving }] = useApproveStoreRequestMutation();
  const [rejectRequest, { isLoading: isRejecting }] = useRejectStoreRequestMutation();

  const [togglingOpenId, setTogglingOpenId] = useState(null);
  const [togglingAccessId, setTogglingAccessId] = useState(null);
  const [togglingAutoForwardId, setTogglingAutoForwardId] = useState(null);
  const [processingRequestId, setProcessingRequestId] = useState(null);

  const stores = storesData?.stores || EMPTY_STORES;
  const storesPagination = storesData?.pagination;

  const requests = requestsData?.requests || [];
  const requestsPagination = requestsData?.pagination;

  // Counts for metric cards
  const openStoresCount = useMemo(() => stores.filter((s) => s.is_open).length, [stores]);
  const closedStoresCount = useMemo(
    () => stores.length - openStoresCount,
    [stores, openStoresCount]
  );

  // Toggle Branch Open/Closed Status
  const handleToggleOpen = async (store) => {
    try {
      setTogglingOpenId(store.id);
      const res = await toggleStatus({
        id: store.id,
        is_open: !store.is_open,
      }).unwrap();
      toast.success(res?.message || "Store status updated");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update store status");
    } finally {
      setTogglingOpenId(null);
    }
  };

  // Toggle Store Access Permission (Allowed vs Denied)
  const handleToggleStoreAccess = async (store) => {
    try {
      setTogglingAccessId(store.id);
      const newAccessState = !store.is_active;
      await updateStore({
        id: store.id,
        is_active: newAccessState,
      }).unwrap();

      toast.success(
        newAccessState
          ? `Access Allowed for "${store.name}".`
          : `Access Denied for "${store.name}".`
      );
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update access permission");
    } finally {
      setTogglingAccessId(null);
    }
  };

  // Toggle Auto-Forward Orders Directly (Skip Admin Approval)
  const handleToggleAutoForward = async (store) => {
    try {
      setTogglingAutoForwardId(store.id);
      const newAutoForward = !store.auto_forward_orders;
      const res = await toggleAutoForward({
        id: store.id,
        auto_forward_orders: newAutoForward,
      }).unwrap();

      toast.success(
        res?.message ||
          (newAutoForward
            ? `Direct Order Dispatch enabled for "${store.name}". Orders will bypass Admin review.`
            : `Admin Review enabled for "${store.name}". Orders will wait for manual dispatch.`)
      );
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update order routing setting");
    } finally {
      setTogglingAutoForwardId(null);
    }
  };

  // Toggle Access Request: Approve (Access Allowed) or Reject (Access Denied)
  const handleToggleRequestAccess = async (request, targetAction) => {
    try {
      setProcessingRequestId(request.id);
      if (targetAction === "approve") {
        const res = await approveRequest(request.id).unwrap();
        toast.success(
          res?.message ||
            `Access Allowed! Password setup email sent to ${request.owner_email || request.email}`
        );
      } else {
        const res = await rejectRequest(request.id).unwrap();
        toast.success(res?.message || "Access Denied.");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update request permission");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const confirmDelete = async () => {
    if (!storeToDelete) return;
    try {
      await deleteStore(storeToDelete.id).unwrap();
      toast.success("Store deleted successfully");
      setStoreToDelete(null);
    } catch {
      // Handled by ConfirmDialog error prop
    }
  };

  return (
    <>
      {/* 1. Page Header */}
      <div className="section-head">
        <div>
          <h1>Stores &amp; Branch Owners</h1>
          <p>
            Manage bakery branch locations, toggle access permissions, and review owner requests.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Add Store Owner Button */}
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus size={18} /> Add Store Owner
          </Button>
        </div>
      </div>

      {/* 2. Primary Tab Switcher */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "10px",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("stores")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "10px",
            border: activeTab === "stores" ? "1.5px solid #166534" : "1px solid #e5e7eb",
            background: activeTab === "stores" ? "#f0fdf4" : "#ffffff",
            color: activeTab === "stores" ? "#166534" : "#4b5563",
            fontWeight: 700,
            fontSize: "13.5px",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <Store size={17} />
          <span>Stores &amp; Branches</span>
          {storesPagination?.total !== undefined && (
            <span
              style={{
                background: activeTab === "stores" ? "#166534" : "#f3f4f6",
                color: activeTab === "stores" ? "#ffffff" : "#6b7280",
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "9999px",
              }}
            >
              {storesPagination.total}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 18px",
            borderRadius: "10px",
            border: activeTab === "requests" ? "1.5px solid #d97706" : "1px solid #e5e7eb",
            background: activeTab === "requests" ? "#fef3c7" : "#ffffff",
            color: activeTab === "requests" ? "#b45309" : "#4b5563",
            fontWeight: 700,
            fontSize: "13.5px",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <KeyRound size={17} />
          <span>Access Requests</span>
          {pendingCount > 0 && (
            <span
              style={{
                background: "#d97706",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: "9999px",
              }}
            >
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* ====================== TAB 1: STORES & BRANCHES ====================== */}
      {activeTab === "stores" && (
        <>
          {/* Top Metric Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div className="card" style={{ padding: "18px 20px", borderLeft: "4px solid #6253e8" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#6253e8" }}>
                Total Registered Stores
              </span>
              <div
                style={{ fontSize: "24px", fontWeight: 800, color: "#111827", marginTop: "4px" }}
              >
                {storesPagination?.total ?? stores.length}
              </div>
            </div>

            <div className="card" style={{ padding: "18px 20px", borderLeft: "4px solid #16a34a" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#16a34a" }}>
                Open Branches (This Page)
              </span>
              <div
                style={{ fontSize: "24px", fontWeight: 800, color: "#16a34a", marginTop: "4px" }}
              >
                {openStoresCount}
              </div>
            </div>

            <div className="card" style={{ padding: "18px 20px", borderLeft: "4px solid #dc2626" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#dc2626" }}>
                Closed Branches (This Page)
              </span>
              <div
                style={{ fontSize: "24px", fontWeight: 800, color: "#dc2626", marginTop: "4px" }}
              >
                {closedStoresCount}
              </div>
            </div>

            <div
              className="card"
              onClick={() => setActiveTab("requests")}
              style={{
                padding: "18px 20px",
                borderLeft: "4px solid #d97706",
                cursor: "pointer",
                transition: "box-shadow 0.2s ease",
              }}
              title="Click to view pending store owner login requests"
            >
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#d97706" }}>
                Pending Access Requests
              </span>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#d97706",
                  marginTop: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{pendingCount}</span>
                <span style={{ fontSize: "12px", fontWeight: 600, textDecoration: "underline" }}>
                  Review &rarr;
                </span>
              </div>
            </div>
          </div>

          {/* Table Card with Toolbar */}
          <div className="card table-card">
            <div className="table-toolbar">
              <SearchInput
                value={storeSearch}
                onChange={(e) => {
                  setStoreSearch(e.target.value);
                  setStoresPage(1);
                }}
                placeholder="Search store name, city, owner, email..."
              />

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setStoresPage(1);
                  }}
                  style={{ minWidth: "150px" }}
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open Branches</option>
                  <option value="closed">Closed Branches</option>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => refetchStores()}
                  disabled={isStoresFetching}
                  title="Refresh store listings"
                >
                  <RefreshCw size={16} className={isStoresFetching ? "spin" : ""} /> Refresh
                </Button>
              </div>
            </div>

            {/* Core DataTable Component */}
            <DataTable
              loading={isStoresLoading}
              columns={[
                {
                  key: "name",
                  label: "STORE / BRANCH",
                  render: (_, store) => (
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "13.5px", color: "#111827" }}>
                        {store.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginTop: "3px",
                          color: "#6b7280",
                          fontSize: "11.5px",
                        }}
                      >
                        {store.city && (
                          <span
                            style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}
                          >
                            <MapPin size={12} /> {store.city}, {store.state || "RJ"}
                          </span>
                        )}
                        {store.phone && (
                          <span
                            style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}
                          >
                            <Phone size={11} /> {store.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "owner",
                  label: "STORE OWNER",
                  render: (_, store) => (
                    <div>
                      <div style={{ fontWeight: 600, color: "#1f2937", fontSize: "13px" }}>
                        {store.owner_name || "Unassigned"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          color: "#6b7280",
                          fontSize: "11.5px",
                          marginTop: "2px",
                        }}
                      >
                        <Mail size={11} /> {store.owner_email || store.email}
                      </div>
                      <div style={{ marginTop: "4px" }}>
                        {store.owner_is_active ? (
                          <span
                            style={{
                              color: "#16a34a",
                              fontSize: "11px",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            <CheckCircle2 size={12} /> Active &amp; Password Set
                          </span>
                        ) : (
                          <span
                            style={{
                              color: "#d97706",
                              fontSize: "11px",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            <Clock size={12} /> Pending Access Request
                          </span>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "orders_summary",
                  label: "ORDERS & REVENUE",
                  render: (_, store) => (
                    <div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontWeight: 700,
                          fontSize: "13px",
                          color: "#111827",
                        }}
                      >
                        <ShoppingBag size={13} style={{ color: "#059669" }} />
                        {Number(store.total_orders || 0)} {Number(store.total_orders || 0) === 1 ? "order" : "orders"}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#059669",
                          marginTop: "2px",
                        }}
                      >
                        ₹{Number(store.total_revenue || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "assigned_categories",
                  label: "PERMITTED CATEGORIES",
                  render: (cats) => (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "5px",
                        maxWidth: "280px",
                      }}
                    >
                      {Array.isArray(cats) && cats.length > 0 ? (
                        cats.map((c) => (
                          <span
                            key={c.id}
                            style={{
                              background: "#f0fdf4",
                              color: "#166534",
                              border: "1px solid #bbf7d0",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 600,
                            }}
                          >
                            {c.name}
                          </span>
                        ))
                      ) : (
                        <span className="muted" style={{ fontSize: "11px" }}>
                          No categories assigned
                        </span>
                      )}
                    </div>
                  ),
                },
                {
                  key: "is_open",
                  label: "BRANCH STATUS",
                  render: (isOpen, store) => (
                    <button
                      type="button"
                      onClick={() => handleToggleOpen(store)}
                      disabled={togglingOpenId === store.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        fontSize: "11px",
                        fontWeight: 800,
                        cursor: "pointer",
                        border: isOpen ? "1px solid #bbf7d0" : "1px solid #fecaca",
                        background: isOpen ? "#f0fdf4" : "#fef2f2",
                        color: isOpen ? "#15803d" : "#b91c1c",
                        transition: "all 0.15s ease",
                      }}
                      title={isOpen ? "Click to set store closed" : "Click to set store open"}
                    >
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: isOpen ? "#16a34a" : "#dc2626",
                        }}
                      />
                      {togglingOpenId === store.id ? "Updating..." : isOpen ? "OPEN" : "CLOSED"}
                    </button>
                  ),
                },
                {
                  key: "is_active",
                  label: "ACCESS PERMISSION",
                  render: (isActive, store) => {
                    const hasAccess = isActive ?? true;
                    return (
                      <PermissionToggle
                        isActive={hasAccess}
                        onClick={() => handleToggleStoreAccess(store)}
                        disabled={togglingAccessId === store.id}
                        title={hasAccess ? "Click to Deny Store Access" : "Click to Allow Store Access"}
                      />
                    );
                  },
                },
                {
                  key: "auto_forward_orders",
                  label: "DIRECT ORDER DISPATCH",
                  render: (autoForward, store) => {
                    const isDirect = Boolean(autoForward);
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <PermissionToggle
                          isActive={isDirect}
                          onClick={() => handleToggleAutoForward(store)}
                          disabled={togglingAutoForwardId === store.id}
                          title={
                            isDirect
                              ? "Auto-Forward Active: Orders sent straight to Store Owner without Admin review. Click to require Admin approval."
                              : "Admin Review Required: Orders wait for Admin to forward to Store Owner. Click to enable Direct Dispatch."
                          }
                        />
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: isDirect ? "#0369a1" : "#64748b",
                          }}
                        >
                          {togglingAutoForwardId === store.id
                            ? "Updating..."
                            : isDirect
                            ? "Direct to Store"
                            : "Requires Admin"}
                        </span>
                      </div>
                    );
                  },
                },
              ]}
              data={stores}
              stickyActions
              emptyMessage="No stores found. Click 'Add Store Owner' to register your first branch."
              renderActions={(store) => (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {/* View Store Products */}
                  <Button
                    variant="outline"
                    title={`View products for ${store.name}`}
                    aria-label={`View products for ${store.name}`}
                    onClick={() => navigate(`/stores/${store.id}/products`)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 11px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#4338ca",
                      borderColor: "#c7d2fe",
                      background: "#eef2ff",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Package size={14} />
                    Products
                  </Button>

                  {/* View Store Orders */}
                  <Button
                    variant="outline"
                    title={`View orders for ${store.name}`}
                    aria-label={`View orders for ${store.name}`}
                    onClick={() => navigate(`/stores/${store.id}/orders`)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 11px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#059669",
                      borderColor: "#a7f3d0",
                      background: "#ecfdf5",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <ShoppingBag size={14} />
                    Orders
                  </Button>

                  {/* Edit Store (includes category assignment) */}
                  <Button
                    variant="edit"
                    title={`Edit ${store.name}`}
                    aria-label={`Edit ${store.name}`}
                    onClick={() => setEditingStore(store)}
                  >
                    <Pencil size={14} />
                  </Button>

                  {/* Delete Store */}
                  <Button
                    variant="delete"
                    title={`Delete ${store.name}`}
                    aria-label={`Delete ${store.name}`}
                    onClick={() => setStoreToDelete(store)}
                    style={{ padding: "5px 8px" }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              )}
            />

            {/* Stores Pagination */}
            <Pagination
              page={storesPage}
              totalPages={storesPagination?.totalPages || 1}
              total={storesPagination?.total || stores.length}
              limit={storesLimit}
              onPageChange={(p) => setStoresPage(p)}
              itemLabel="stores"
            />
          </div>
        </>
      )}

      {/* ====================== TAB 2: ACCESS REQUESTS ====================== */}
      {activeTab === "requests" && (
        <div className="card table-card">
          {/* Sub-Tabs / Filter Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              padding: "16px 20px 12px",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
                { key: "pending", label: "Pending Approval" },
                { key: "approved", label: "Approved" },
                { key: "rejected", label: "Rejected" },
                { key: "all", label: "All Requests" },
              ].map((tab) => {
                const isActive = requestFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setRequestFilter(tab.key);
                      setRequestsPage(1);
                    }}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: isActive ? "#166534" : "#f3f4f6",
                      color: isActive ? "#ffffff" : "#4b5563",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Button
                variant="outline"
                onClick={() => refetchRequests()}
                disabled={isRequestsFetching}
                title="Refresh requests"
              >
                <RefreshCw size={15} className={isRequestsFetching ? "spin" : ""} /> Refresh
              </Button>
            </div>
          </div>

          {/* Search bar inside Access Requests */}
          <div style={{ padding: "12px 20px" }}>
            <SearchInput
              value={requestSearch}
              onChange={(e) => {
                setRequestSearch(e.target.value);
                setRequestsPage(1);
              }}
              placeholder="Search request by owner name, email, store..."
            />
          </div>

          {/* DataTable for Access Requests */}
          <DataTable
            loading={isRequestsLoading}
            columns={[
              {
                key: "owner",
                label: "STORE OWNER",
                render: (_, item) => (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "13.5px", color: "#111827" }}>
                      {item.owner_name || item.user_name || "Store Owner"}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#6b7280",
                        fontSize: "12px",
                        marginTop: "2px",
                      }}
                    >
                      <Mail size={12} /> {item.owner_email || item.email}
                    </div>
                    {item.owner_phone && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "#6b7280",
                          fontSize: "12px",
                          marginTop: "2px",
                        }}
                      >
                        <Phone size={12} /> {item.owner_phone}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "store",
                label: "LINKED STORE",
                render: (_, item) => (
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "13px",
                        color: "#166534",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Store size={13} /> {item.store_name}
                    </div>
                    {item.store_city && (
                      <div style={{ color: "#6b7280", fontSize: "11.5px", marginTop: "2px" }}>
                        <MapPin
                          size={11}
                          style={{
                            display: "inline",
                            verticalAlign: "middle",
                            marginRight: "3px",
                          }}
                        />
                        {item.store_city}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "created_at",
                label: "REQUESTED ON",
                render: (dt) => (
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} color="#9ca3af" />
                      {new Date(dt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ),
              },
                {
                  key: "permission_toggle",
                  label: "ACCESS PERMISSION (TOGGLE)",
                  render: (_, item) => {
                    const isPending = item.status === "pending";
                    const isApproved = item.status === "approved";
                    return (
                      <PermissionToggle
                        isActive={isApproved}
                        isPending={isPending}
                        disabled={processingRequestId === item.id || isApproving || isRejecting}
                        onClick={() => {
                          if (isApproved) {
                            handleToggleRequestAccess(item, "reject");
                          } else {
                            handleToggleRequestAccess(item, "approve");
                          }
                        }}
                        title={
                          isPending
                            ? "Pending Approval - Click to Allow Access & Send Email"
                            : isApproved
                            ? "Access is Allowed - Click to Deny Access"
                            : "Access is Denied - Click to Allow Access & Send Email"
                        }
                      />
                    );
                  },
                },
            ]}
            data={requests}
            emptyMessage={`No ${requestFilter} access requests found.`}
            renderActions={(item) => (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {/* Copy Password Setup Link for approved requests */}
                {item.setup_token && item.status === "approved" && (
                  <Button
                    variant="outline"
                    title="Copy Password Setup Link"
                    onClick={() => {
                      const link = `${window.location.origin}/store/set-password?token=${encodeURIComponent(item.setup_token)}&email=${encodeURIComponent(item.owner_email || item.email)}`;
                      navigator.clipboard.writeText(link);
                      toast.success("Password setup link copied to clipboard!");
                    }}
                    style={{ padding: "5px 8px", color: "#166534" }}
                  >
                    <KeyRound size={13} style={{ marginRight: "4px" }} /> Setup Link
                  </Button>
                )}

                {/* Edit Store (allows modifying categories & details) */}
                <Button
                  variant="outline"
                  title={`Edit store "${item.store_name}"`}
                  onClick={() =>
                    setEditingStore({
                      id: item.store_id,
                      name: item.store_name,
                      email: item.store_email,
                      phone: item.store_phone,
                      city: item.store_city,
                      address: item.store_address,
                      assigned_categories: item.assigned_categories,
                      is_open: item.store_is_open,
                      is_active: item.store_is_active,
                    })
                  }
                  style={{ padding: "5px 8px" }}
                >
                  <Pencil size={13} style={{ marginRight: "4px" }} /> Edit Store
                </Button>
              </div>
            )}
          />

          {/* Access Requests Pagination */}
          <Pagination
            page={requestsPage}
            totalPages={requestsPagination?.totalPages || 1}
            total={requestsPagination?.total || requests.length}
            limit={requestsLimit}
            onPageChange={(p) => setRequestsPage(p)}
            itemLabel="requests"
          />
        </div>
      )}

      {/* Modals */}
      <CreateStoreModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <EditStoreModal
        isOpen={Boolean(editingStore)}
        store={editingStore}
        onClose={() => setEditingStore(null)}
      />

      {/* Confirm Delete Store Dialog */}
      {storeToDelete && (
        <ConfirmDialog
          isOpen={Boolean(storeToDelete)}
          title="Delete Store?"
          message={`Are you sure you want to delete "${storeToDelete.name}"? All associated products and owner permissions will be permanently removed.`}
          confirmLabel="Delete Store"
          danger={true}
          isLoading={isDeleting}
          onConfirm={confirmDelete}
          onClose={() => setStoreToDelete(null)}
        />
      )}
    </>
  );
}
