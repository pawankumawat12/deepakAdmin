import { useState, useMemo } from "react";
import {
  useGetAdminOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useToggleOfferStatusMutation,
  useDeleteOfferMutation,
} from "../../services/offerApi";
import { useGetProductsQuery } from "../../services/productApi";
import { useGetCategoriesQuery } from "../../services/categoryApi";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import useDebouncedValue from "../../utils/useDebouncedValue";
import {
  Tag,
  Plus,
  Search,
  Percent,
  Flame,
  Clock,
  Sparkles,
  Zap,
  Edit2,
  Trash2,
  Check,
  X,
  Copy,
  AlertCircle,
  Calendar,
  Layers,
  ShoppingBag,
  Sliders,
  RefreshCw,
  Gift,
  Target,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toAssetUrl } from "../../utils/assetUrl";

export default function OfferList() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const debouncedSearch = useDebouncedValue(search, 600);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState("");

  // Form State
  const initialForm = {
    title: "",
    code: "",
    description: "",
    badge: "",
    type: "",
    discount_value: 0,
    min_order_amount: 0 ,
    max_discount_amount: "",
    target_product_ids: [],
    target_category_ids: [],
    buy_qty: 1,
    get_qty: 1,
    banner_image: "",
    start_date: "",
    end_date: "",
    usage_limit: "",
    is_active: true,
    auto_apply: false,
    priority: 0,
  };

  const [formData, setFormData] = useState(initialForm);

  // API Queries
  const {
    data: offersData,
    isLoading,
    isFetching,
  } = useGetAdminOffersQuery({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
    type: typeFilter,
    status: statusFilter,
  });

  const { data: productsData } = useGetProductsQuery({ limit: 100 });
  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 });

  const [createOffer, { isLoading: isCreating }] = useCreateOfferMutation();
  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();
  const [toggleOfferStatus] = useToggleOfferStatusMutation();
  const [deleteOffer, { isLoading: isDeleting }] = useDeleteOfferMutation();

  const offers = offersData?.data?.offers || [];
  const pagination = offersData?.data?.pagination;
  const stats = offersData?.data?.stats || {
    totalOffers: 0,
    activeOffers: 0,
    autoApplyOffers: 0,
    expiredOffers: 0,
  };

  const allProducts = productsData?.data || [];
  const allCategories = categoriesData?.data || [];

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openCreateModal = () => {
    setEditingOffer(null);
    setFormData(initialForm);
    setBannerImageFile(null);
    setBannerPreviewUrl("");
    setStatusMessage({ text: "", type: "" });
    setModalOpen(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title || "",
      code: offer.code || "",
      description: offer.description || "",
      badge: offer.badge || "",
      type: offer.type || "PERCENTAGE",
      discount_value: offer.discount_value ?? 0,
      min_order_amount: offer.min_order_amount ?? 0,
      max_discount_amount: offer.max_discount_amount ?? "",
      target_product_ids: offer.target_product_ids || [],
      target_category_ids: offer.target_category_ids || [],
      buy_qty: offer.buy_qty || 1,
      get_qty: offer.get_qty || 1,
      banner_image: offer.banner_image || "",
      start_date: offer.start_date ? new Date(offer.start_date).toISOString().slice(0, 16) : "",
      end_date: offer.end_date ? new Date(offer.end_date).toISOString().slice(0, 16) : "",
      usage_limit: offer.usage_limit ?? "",
      is_active: Boolean(offer.is_active),
      auto_apply: Boolean(offer.auto_apply),
      priority: offer.priority ?? 0,
    });
    setBannerImageFile(null);
    setBannerPreviewUrl(offer.banner_image || "");
    setStatusMessage({ text: "", type: "" });
    setModalOpen(true);
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerImageFile(file);
    setBannerPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveBannerImage = () => {
    setBannerImageFile(null);
    setBannerPreviewUrl("");
    setFormData((prev) => ({ ...prev, banner_image: "" }));
  };

  const handleStatusToggle = async (offer) => {
    try {
      await toggleOfferStatus({
        id: offer.id,
        is_active: !offer.is_active,
      }).unwrap();
    } catch (err) {
      alert(err?.data?.message || "Failed to update offer status");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOffer(id).unwrap();
      setDeleteConfirmId(null);
    } catch (err) {
      alert(err?.data?.message || "Failed to delete offer");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ text: "", type: "" });

    if (!formData.title.trim()) {
      setStatusMessage({ text: "Offer title is required", type: "error" });
      return;
    }
    if (!formData.code.trim()) {
      setStatusMessage({ text: "Offer code is required", type: "error" });
      return;
    }

    if (formData.type === "BOGO") {
      const pIds = formData.target_product_ids || [];
      if (pIds.length === 0) {
        setStatusMessage({
          text: "Please select a target product for this BOGO offer.",
          type: "error",
        });
        return;
      }
      if (Number(formData.buy_qty) < 1 || Number(formData.get_qty) < 1) {
        setStatusMessage({
          text: "Buy Quantity and Get Quantity must each be at least 1.",
          type: "error",
        });
        return;
      }
    }

    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      discount_value: Number(formData.discount_value) || 0,
      min_order_amount: Number(formData.min_order_amount) || 0,
      max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
      buy_qty: Number(formData.buy_qty) || 1,
      get_qty: Number(formData.get_qty) || 1,
      usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
      priority: Number(formData.priority) || 0,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };

    let submitBody;
    if (bannerImageFile instanceof File) {
      const fd = new FormData();
      Object.entries(payload).forEach(([key, val]) => {
        if (key === "banner_image") return;
        if (Array.isArray(val)) {
          fd.append(key, JSON.stringify(val));
        } else if (val !== null && val !== undefined) {
          fd.append(key, String(val));
        }
      });
      fd.append("banner_image", bannerImageFile);
      submitBody = fd;
    } else {
      submitBody = payload;
    }

    try {
      if (editingOffer) {
        await updateOffer({ id: editingOffer.id, body: submitBody }).unwrap();
      } else {
        await createOffer(submitBody).unwrap();
      }
      setModalOpen(false);
    } catch (err) {
      setStatusMessage({
        text: err?.data?.message || "Failed to save offer. Check promo code uniqueness.",
        type: "error",
      });
    }
  };

  const columns = [
    {
      key: "code",
      label: "PROMO CODE & BADGE",
      render: (_, row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontFamily: "monospace",
                fontWeight: 800,
                fontSize: "13px",
                letterSpacing: "0.5px",
                color: "#4f7d16",
                background: "#f0fdf4",
                padding: "3px 8px",
                borderRadius: "6px",
                border: "1px dashed #86efac",
              }}
            >
              {row.code}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(row.code)}
              style={{
                border: "none",
                background: "transparent",
                color: "#6b7280",
                cursor: "pointer",
                padding: "2px",
              }}
              title="Copy promo code"
            >
              {copiedCode === row.code ? (
                <Check size={14} color="#16a34a" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
            {row.badge && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  background: "#fef3c7",
                  color: "#b45309",
                  padding: "1px 6px",
                  borderRadius: "4px",
                }}
              >
                {row.badge}
              </span>
            )}
            {row.auto_apply && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  fontSize: "10px",
                  fontWeight: 700,
                  background: "#ede9fe",
                  color: "#6d28d9",
                  padding: "1px 6px",
                  borderRadius: "4px",
                }}
              >
                <Zap size={11} /> Auto-Apply
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "title",
      label: "OFFER DETAILS",
      render: (_, row) => (
        <div style={{ maxWidth: "260px" }}>
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: "13px",
              color: "#1f2937",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
            title={row.title}
          >
            {row.title}
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "11px",
              color: "#6b7280",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={row.description || "No description provided."}
          >
            {row.description || "No description provided."}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      label: "OFFER TYPE & DISCOUNT",
      render: (_, row) => {
        let typeColor = "#3b82f6";
        let typeBg = "#eff6ff";
        let discountLabel = `${row.discount_value}% OFF`;

        if (row.type === "FLAT") {
          typeColor = "#10b981";
          typeBg = "#ecfdf5";
          discountLabel = `₹${row.discount_value} FLAT`;
        } else if (row.type === "BOGO") {
          typeColor = "#f59e0b";
          typeBg = "#fffbeb";
          discountLabel = `BUY ${row.buy_qty || 1} GET ${row.get_qty || 1} FREE`;
        } else if (row.type === "PRODUCT") {
          typeColor = "#8b5cf6";
          typeBg = "#f5f3ff";
          discountLabel = `${row.discount_value}% Product Deal`;
        } else if (row.type === "CATEGORY") {
          typeColor = "#ec4899";
          typeBg = "#fdf2f8";
          discountLabel = `${row.discount_value}% Category Deal`;
        }

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 800,
                color: typeColor,
                background: typeBg,
                padding: "2px 6px",
                borderRadius: "4px",
                width: "fit-content",
              }}
            >
              {row.type}
            </span>
            <span style={{ fontWeight: 800, fontSize: "12px", color: "#111827" }}>
              {discountLabel}
            </span>
          </div>
        );
      },
    },
    {
      key: "rules",
      label: "MIN ORDER / CAP",
      render: (_, row) => (
        <div style={{ fontSize: "11px", color: "#374151" }}>
          <div>
            <strong>Min:</strong> ₹{row.min_order_amount || 0}
          </div>
          {row.max_discount_amount ? (
            <div style={{ color: "#6b7280" }}>
              <strong>Cap:</strong> ₹{row.max_discount_amount}
            </div>
          ) : (
            <div style={{ color: "#9ca3af" }}>No Max Cap</div>
          )}
        </div>
      ),
    },
    {
      key: "usage",
      label: "USAGE & LIMIT",
      render: (_, row) => (
        <div style={{ fontSize: "11px", color: "#374151" }}>
          <div>
            <strong>Used:</strong> {row.used_count || 0} times
          </div>
          <div style={{ color: "#6b7280" }}>
            <strong>Limit:</strong> {row.usage_limit ? `${row.usage_limit} total` : "Unlimited"}
          </div>
        </div>
      ),
    },
    {
      key: "is_active",
      label: "STATUS",
      render: (_, row) => {
        const isExpired = row.end_date && new Date(row.end_date) < new Date();
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label
              style={{
                position: "relative",
                display: "inline-block",
                width: "36px",
                height: "20px",
                cursor: isExpired ? "not-allowed" : "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={row.is_active && !isExpired}
                disabled={isExpired}
                onChange={() => handleStatusToggle(row)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: row.is_active && !isExpired ? "#4f7d16" : "#d1d5db",
                  transition: ".3s",
                  borderRadius: "20px",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    content: '""',
                    height: "14px",
                    width: "14px",
                    left: row.is_active && !isExpired ? "18px" : "3px",
                    bottom: "3px",
                    backgroundColor: "white",
                    transition: ".3s",
                    borderRadius: "50%",
                  }}
                />
              </span>
            </label>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: isExpired ? "#ef4444" : row.is_active ? "#16a34a" : "#6b7280",
              }}
            >
              {isExpired ? "Expired" : row.is_active ? "Active" : "Disabled"}
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            type="button"
            onClick={() => openEditModal(row)}
            style={{
              padding: "6px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              color: "#374151",
              cursor: "pointer",
            }}
            className="action-btn action-btn-edit"
            title="Edit Offer"
            aria-label="Edit Offer"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteConfirmId(row.id)}
            style={{
              padding: "6px",
              borderRadius: "8px",
              border: "1px solid #fee2e2",
              background: "#fff5f5",
              color: "#dc2626",
              cursor: "pointer",
            }}
            className="action-btn action-btn-delete"
            title="Delete Offer"
            aria-label="Delete Offer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="section-head" style={{ marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Tag size={24} color="#4f7d16" />
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>Offers & Promotions</h1>
          </div>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "13px" }}>
            Create and manage promo codes, percentage discounts, flat deals, and auto-applied rewards.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreateModal}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#4f7d16",
            borderColor: "#4f7d16",
          }}
        >
          <Plus size={16} />
          Create New Offer
        </Button>
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
            <Tag size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#8b8ba0" }}>
              TOTAL OFFERS
            </p>
            <h3 style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: 800, color: "#1f2937" }}>
              {stats.totalOffers}
            </h3>
          </div>
        </div>

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
              color: "#10b981",
            }}
          >
            <Flame size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#8b8ba0" }}>
              ACTIVE DEALS
            </p>
            <h3 style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: 800, color: "#10b981" }}>
              {stats.activeOffers}
            </h3>
          </div>
        </div>

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
              background: "#ede9fe",
              display: "grid",
              placeItems: "center",
              color: "#7c3aed",
            }}
          >
            <Zap size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#8b8ba0" }}>
              AUTO-APPLIED
            </p>
            <h3 style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: 800, color: "#7c3aed" }}>
              {stats.autoApplyOffers}
            </h3>
          </div>
        </div>

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
              background: "#fee2e2",
              display: "grid",
              placeItems: "center",
              color: "#ef4444",
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "#8b8ba0" }}>
              EXPIRED DEALS
            </p>
            <h3 style={{ margin: "2px 0 0", fontSize: "20px", fontWeight: 800, color: "#ef4444" }}>
              {stats.expiredOffers}
            </h3>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div
        style={{
          background: "#ffffff",
          padding: "14px 18px",
          borderRadius: "16px",
          border: "1px solid #f0f0f5",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by code or title..."
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              fontSize: "12px",
              color: "#374151",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            <option value="all">All Types</option>
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FLAT">Flat (₹)</option>
            <option value="BOGO">BOGO (Buy/Get)</option>
            <option value="PRODUCT">Target Products</option>
            <option value="CATEGORY">Target Categories</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              fontSize: "12px",
              color: "#374151",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Disabled Only</option>
            <option value="expired">Expired Only</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <DataTable data={offers} columns={columns} loading={isLoading || isFetching} />

      <Pagination
        page={pagination?.page || page}
        totalPages={pagination?.totalPages || 1}
        total={pagination?.total || offers.length}
        limit={limit}
        onPageChange={(p) => setPage(p)}
        itemLabel="offers"
      />

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "26px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #f0f0f5",
                paddingBottom: "14px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    padding: "8px",
                    borderRadius: "12px",
                    background: "#f4f8ec",
                    color: "#4f7d16",
                  }}
                >
                  <Tag size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#111827" }}>
                    {editingOffer ? `Edit Offer: ${editingOffer.code}` : "Create New Promotional Offer"}
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6b7280" }}>
                    Set discount rules, validity, eligibility thresholds, and promo codes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#6b7280",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {statusMessage.text && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  backgroundColor: statusMessage.type === "error" ? "#fee2e2" : "#ecfdf5",
                  color: statusMessage.type === "error" ? "#991b1b" : "#065f46",
                  border: `1px solid ${statusMessage.type === "error" ? "#fca5a5" : "#a7f3d0"}`,
                }}
              >
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                {/* Title */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                    Offer Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Burger Combo Saver"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                    }}
                  />
                </div>

                {/* Promo Code */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                    Promo Code * (Uppercase)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. BURGER24"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}
                  />
                </div>

                {/* Offer Type */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                    Offer Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                      background: "#ffffff",
                    }}
                  >
                    <option value="PERCENTAGE">PERCENTAGE (% Off Subtotal)</option>
                    <option value="FLAT">FLAT (₹ Rupee Discount)</option>
                    <option value="BOGO">BOGO (Buy X, Get Y Free)</option>
                    <option value="PRODUCT">PRODUCT (Target Specific Items)</option>
                    <option value="CATEGORY">CATEGORY (Target Food Categories)</option>
                  </select>
                </div>

                {/* Badge Text */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. HOT DEAL, BEST VALUE"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                    }}
                  />
                </div>

                {/* Discount Value */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                    {formData.type === "PERCENTAGE" || formData.type === "PRODUCT" || formData.type === "CATEGORY"
                      ? "Discount Percentage (%) *"
                      : "Discount Amount (₹) *"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.type === "PERCENTAGE" || formData.type === "PRODUCT" || formData.type === "CATEGORY" ? "100" : undefined}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    placeholder={formData.type === "FLAT" ? "50" : "20"}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                    }}
                  />
                </div>

                {/* Min Order */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                    Minimum Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    placeholder="0"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                    }}
                  />
                </div>

                {/* Max Discount Cap */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                    Max Discount Cap (₹) (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.max_discount_amount}
                    onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                    placeholder="Leave empty for no limit"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                    }}
                  />
                </div>

                {/* Usage Limit */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                    Max Total Redemptions (Usage Limit)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder="Unlimited if empty"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                    }}
                  />
                </div>

                {/* BOGO Rules if BOGO */}
                {formData.type === "BOGO" && (
                  <>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                        Buy Quantity * (e.g. 1)
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.buy_qty}
                        onChange={(e) => setFormData({ ...formData, buy_qty: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "10px",
                          border: "1px solid #e5e7eb",
                          fontSize: "13px",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                        Get Free Quantity * (e.g. 1)
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.get_qty}
                        onChange={(e) => setFormData({ ...formData, get_qty: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "10px",
                          border: "1px solid #e5e7eb",
                          fontSize: "13px",
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Start Date */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                    Validity Start Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                    Validity Expiration Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                  />
                </div>

                {/* Banner Image File Upload */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                    Offer Banner Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageChange}
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                      background: "#ffffff",
                    }}
                  />
                  <small style={{ color: "#6b7280", fontSize: "11px", display: "block", marginTop: "4px" }}>
                    Select JPG, PNG, or WEBP banner image
                  </small>

                  {bannerPreviewUrl && (
                    <div style={{ marginTop: "8px", position: "relative", display: "inline-block" }}>
                      <img
                        src={toAssetUrl(bannerPreviewUrl)}
                        alt="Offer banner preview"
                        style={{
                          width: "120px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          display: "block",
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveBannerImage}
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          background: "#ef4444",
                          color: "#ffffff",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          display: "grid",
                          placeItems: "center",
                          border: "none",
                          cursor: "pointer",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                        title="Remove banner"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                    Priority Ranking (Higher = Evaluated First)
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    placeholder="0"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #e5e7eb",
                      fontSize: "13px",
                    }}
                  />
                </div>
              </div>

              {/* Target Product Selection for BOGO */}
              {formData.type === "BOGO" && (
                <div
                  style={{
                    marginBottom: "18px",
                    padding: "14px",
                    borderRadius: "12px",
                    background: "#fffbeb",
                    border: "1px solid #fde68a",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 800,
                      marginBottom: "6px",
                      color: "#92400e",
                    }}
                  >
                    <Target size={14} className="inline mr-1 text-amber-700" /> Select Target Product for BOGO * (Required)
                  </label>
                  <select
                    value={(formData.target_product_ids && formData.target_product_ids[0]) || ""}
                    onChange={(e) => {
                      const val = e.target.value ? [Number(e.target.value)] : [];
                      setFormData({ ...formData, target_product_ids: val });
                    }}
                    required
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "10px",
                      border: "1px solid #d97706",
                      fontSize: "13px",
                      fontWeight: 600,
                      background: "#ffffff",
                      outline: "none",
                    }}
                  >
                    <option value="">-- Choose a Product for BOGO --</option>
                    {allProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.price}) {p.category_name ? `• ${p.category_name}` : ""}
                      </option>
                    ))}
                  </select>

                  {formData.target_product_ids && formData.target_product_ids.length > 0 && (
                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#b45309",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span> Deal Summary:</span>
                      <span>
                        Buy {formData.buy_qty || 1}{" "}
                        <strong>
                          {allProducts.find((p) => p.id === formData.target_product_ids[0])?.name || "Product"}
                        </strong>
                        , Get {formData.get_qty || 1} FREE
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Target Product Multi-Select if PRODUCT type */}
              {formData.type === "PRODUCT" && (
                <div style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                    Select Eligible Products:
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "140px", overflowY: "auto", padding: "8px", border: "1px solid #e5e7eb", borderRadius: "10px" }}>
                    {allProducts.map((prod) => {
                      const isSelected = (formData.target_product_ids || []).includes(prod.id);
                      return (
                        <button
                          type="button"
                          key={prod.id}
                          onClick={() => {
                            const cur = formData.target_product_ids || [];
                            const next = isSelected ? cur.filter((x) => x !== prod.id) : [...cur, prod.id];
                            setFormData({ ...formData, target_product_ids: next });
                          }}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "8px",
                            border: `1px solid ${isSelected ? "#4f7d16" : "#e5e7eb"}`,
                            background: isSelected ? "#f4f8ec" : "#ffffff",
                            color: isSelected ? "#4f7d16" : "#374151",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            {isSelected && <Check size={12} />}
                            <span>{prod.name} (₹{prod.price})</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Target Category Multi-Select if Category */}
              {formData.type === "CATEGORY" && (
                <div style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                    Select Eligible Categories:
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "120px", overflowY: "auto", padding: "8px", border: "1px solid #e5e7eb", borderRadius: "10px" }}>
                    {allCategories.map((cat) => {
                      const isSelected = (formData.target_category_ids || []).includes(cat.id);
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => {
                            const cur = formData.target_category_ids || [];
                            const next = isSelected ? cur.filter((x) => x !== cat.id) : [...cur, cat.id];
                            setFormData({ ...formData, target_category_ids: next });
                          }}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "8px",
                            border: `1px solid ${isSelected ? "#4f7d16" : "#e5e7eb"}`,
                            background: isSelected ? "#f4f8ec" : "#ffffff",
                            color: isSelected ? "#4f7d16" : "#374151",
                            fontSize: "11px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            {isSelected && <Check size={12} />}
                            <span>{cat.name}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px", color: "#374151" }}>
                  Description / Terms
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Offer details shown to customers..."
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                  }}
                />
              </div>

              {/* Toggles */}
              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  borderTop: "1px solid #f0f0f5",
                  paddingTop: "16px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.auto_apply}
                    onChange={(e) => setFormData({ ...formData, auto_apply: e.target.checked })}
                    style={{ width: "16px", height: "16px", accentColor: "#7c3aed" }}
                  />
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 700, color: "#374151" }}>
                    <Zap size={13} className="text-purple-600" /> Auto-Apply (Automatically applied if eligible)
                  </span>
                </label>

                <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: "16px", height: "16px", accentColor: "#4f7d16" }}
                  />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>
                    Active & Available to Customers
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#4f7d16",
                    borderColor: "#4f7d16",
                  }}
                >
                  {isCreating || isUpdating ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      {editingOffer ? "Update Offer" : "Create Offer"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              maxWidth: "400px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#fee2e2",
                color: "#dc2626",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 16px",
              }}
            >
              <Trash2 size={24} />
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 800, color: "#111827" }}>
              Delete Offer Permanently?
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: "12px", color: "#6b7280" }}>
              This promo code will no longer be available or accepted during checkout.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <Button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                style={{
                  background: "#dc2626",
                  borderColor: "#dc2626",
                  color: "#ffffff",
                }}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
