import React, { useState } from "react";
import {
  useGetAdminReviewsQuery,
  useToggleReviewVisibilityMutation,
  useDeleteReviewMutation,
  useGetReviewStatsQuery,
} from "../../services/reviewApi";
import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  Search,
  MessageSquare,
  Package,
  Store,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ReviewList() {
  const [activeTab, setActiveTab] = useState("all"); // "all" | "product" | "site" | "hidden"
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);

  // Query parameters
  const queryParams = {
    page,
    limit: 10,
    search: searchTerm || undefined,
    rating: ratingFilter || undefined,
    type:
      activeTab === "product"
        ? "product"
        : activeTab === "site"
        ? "site"
        : undefined,
    status: activeTab === "hidden" ? "hidden" : undefined,
  };

  const { data: reviewsData, isLoading, isError, refetch } =
    useGetAdminReviewsQuery(queryParams, { refetchOnFocus: true });
  const { data: statsData } = useGetReviewStatsQuery(undefined, {
    refetchOnFocus: true,
  });

  const [toggleVisibility, { isLoading: isToggling }] =
    useToggleReviewVisibilityMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const reviews = reviewsData?.data?.reviews || [];
  const pagination = reviewsData?.data?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };
  const stats = statsData?.data || {
    totalReviews: 0,
    productReviews: 0,
    siteReviews: 0,
    publishedReviews: 0,
    hiddenReviews: 0,
    averageRating: 0,
  };

  const handleToggleVisibility = async (review) => {
    try {
      const nextHidden = !review.is_hidden;
      await toggleVisibility({
        id: review.id,
        is_hidden: nextHidden,
      }).unwrap();

      toast.success(
        nextHidden
          ? "Review is now hidden from customers."
          : "Review is published and visible to customers."
      );
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update review visibility");
    }
  };

  const handleOpenDelete = (review) => {
    setSelectedReview(review);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedReview) return;
    try {
      await deleteReview(selectedReview.id).unwrap();
      toast.success("Review deleted permanently.");
      setDeleteModalOpen(false);
      setSelectedReview(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete review");
    }
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={star <= rating ? "#f59e0b" : "none"}
            color={star <= rating ? "#f59e0b" : "#d1d5db"}
          />
        ))}
        <span
          style={{
            marginLeft: "4px",
            fontSize: "12px",
            fontWeight: 700,
            color: "#374151",
          }}
        >
          {rating}/5
        </span>
      </div>
    );
  };

  return (
    <>
      <div className="section-head">
        <div>
          <h1>Customer Reviews & Ratings</h1>
          <p>
            Monitor and manage product reviews and store feedback submitted by
            customers.
          </p>
        </div>
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
            background: "#fff",
            padding: "18px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>
            AVERAGE RATING
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "6px",
            }}
          >
            <span
              style={{ fontSize: "28px", fontWeight: 800, color: "#111827" }}
            >
              {stats.averageRating || "0.0"}
            </span>
            <div style={{ display: "flex", color: "#f59e0b" }}>
              <Star size={20} fill="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
            Across all {stats.totalReviews} customer reviews
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "18px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>
            PRODUCT REVIEWS
          </div>
          <div
            style={{ fontSize: "28px", fontWeight: 800, color: "#3b82f6", marginTop: "6px" }}
          >
            {stats.productReviews}
          </div>
          <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
            Direct customer menu item ratings
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "18px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>
            SITE / STORE REVIEWS
          </div>
          <div
            style={{ fontSize: "28px", fontWeight: 800, color: "#8b5cf6", marginTop: "6px" }}
          >
            {stats.siteReviews}
          </div>
          <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
            Overall cafe experience feedback
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "18px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>
            HIDDEN REVIEWS
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: stats.hiddenReviews > 0 ? "#ef4444" : "#10b981",
              marginTop: "6px",
            }}
          >
            {stats.hiddenReviews}
          </div>
          <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
            {stats.publishedReviews} currently published
          </div>
        </div>
      </div>

      {/* CONTROLS BAR: TABS, SEARCH, AND FILTERS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        {/* TAB BUTTONS */}
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { id: "all", label: `All (${stats.totalReviews})`, icon: MessageSquare },
            {
              id: "product",
              label: `Product (${stats.productReviews})`,
              icon: Package,
            },
            { id: "site", label: `Store (${stats.siteReviews})`, icon: Store },
            {
              id: "hidden",
              label: `Hidden (${stats.hiddenReviews})`,
              icon: EyeOff,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "13px",
                  border: "1px solid #e5e7eb",
                  background: isActive ? "#3b82f6" : "#fff",
                  color: isActive ? "#fff" : "#4b5563",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* SEARCH & RATING FILTER */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "6px 12px",
              minWidth: "220px",
            }}
          >
            <Search size={16} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              style={{
                border: "none",
                outline: "none",
                fontSize: "13px",
                width: "100%",
              }}
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "7px 12px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontSize: "13px",
              color: "#374151",
              fontWeight: 600,
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars ★★★★★</option>
            <option value="4">4 Stars ★★★★☆</option>
            <option value="3">3 Stars ★★★☆☆</option>
            <option value="2">2 Stars ★★☆☆☆</option>
            <option value="1">1 Star ★☆☆☆☆</option>
          </select>
        </div>
      </div>

      {/* REVIEWS TABLE */}
      {isLoading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px",
            color: "#6b7280",
            gap: "8px",
          }}
        >
          <LoaderCircle size={20} className="animate-spin" />
          <span>Loading reviews...</span>
        </div>
      ) : isError ? (
        <div style={{ padding: "32px", textAlign: "center", color: "#dc2626" }}>
          Failed to load reviews.
        </div>
      ) : reviews.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            padding: "48px",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          <MessageSquare
            size={36}
            style={{ margin: "0 auto 8px auto", opacity: 0.4 }}
          />
          <p style={{ fontWeight: 600, color: "#111827" }}>No reviews found</p>
          <p style={{ fontSize: "13px" }}>
            No customer reviews match the selected filters.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "13.5px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                    color: "#6b7280",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    fontSize: "11px",
                    letterSpacing: "0.05em",
                  }}
                >
                  <th style={{ padding: "12px 16px" }}>Customer</th>
                  <th style={{ padding: "12px 16px" }}>Target</th>
                  <th style={{ padding: "12px 16px" }}>Rating</th>
                  <th style={{ padding: "12px 16px", width: "35%" }}>
                    Review / Comment
                  </th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                  <th style={{ padding: "12px 16px" }}>Date</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev) => {
                  const isHidden = Boolean(rev.is_hidden);
                  return (
                    <tr
                      key={rev.id}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        background: isHidden ? "#fffbeb" : "transparent",
                      }}
                    >
                      {/* CUSTOMER */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600, color: "#111827" }}>
                          {rev.user_name || "Customer"}
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#6b7280" }}>
                          {rev.user_email || `User #${rev.user_id}`}
                        </div>
                      </td>

                      {/* TARGET */}
                      <td style={{ padding: "12px 16px" }}>
                        {rev.type === "site" ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              background: "#f3e8ff",
                              color: "#7e22ce",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "11.5px",
                              fontWeight: 700,
                            }}
                          >
                            <Store size={12} /> Store Review
                          </span>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                background: "#eff6ff",
                                color: "#1d4ed8",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontSize: "11.5px",
                                fontWeight: 700,
                              }}
                            >
                              <Package size={12} />{" "}
                              {rev.product_name || `Product #${rev.product_id}`}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* RATING */}
                      <td style={{ padding: "12px 16px" }}>
                        {renderStars(rev.rating)}
                      </td>

                      {/* COMMENT */}
                      <td style={{ padding: "12px 16px" }}>
                        {rev.title && (
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#111827",
                              marginBottom: "2px",
                            }}
                          >
                            {rev.title}
                          </div>
                        )}
                        <p
                          style={{
                            margin: 0,
                            color: "#4b5563",
                            fontSize: "13px",
                            lineHeight: "1.4",
                          }}
                        >
                          {rev.comment}
                        </p>
                      </td>

                      {/* STATUS */}
                      <td style={{ padding: "12px 16px" }}>
                        {isHidden ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              background: "#fee2e2",
                              color: "#b91c1c",
                              padding: "3px 8px",
                              borderRadius: "9999px",
                              fontSize: "11.5px",
                              fontWeight: 700,
                            }}
                          >
                            <EyeOff size={11} /> Hidden
                          </span>
                        ) : (
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
                            }}
                          >
                            <CheckCircle size={11} /> Published
                          </span>
                        )}
                      </td>

                      {/* DATE */}
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: "12px",
                          color: "#6b7280",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {new Date(rev.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* ACTIONS */}
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "right",
                        }}
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            gap: "6px",
                            justifyContent: "flex-end",
                          }}
                        >
                          {/* HIDE / UNHIDE */}
                          <button
                            type="button"
                            title={
                              isHidden
                                ? "Unhide & Publish to Customers"
                                : "Hide from Customers"
                            }
                            onClick={() => handleToggleVisibility(rev)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              background: isHidden ? "#10b981" : "#fff",
                              color: isHidden ? "#fff" : "#4b5563",
                              fontWeight: 600,
                              fontSize: "12px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            {isHidden ? (
                              <>
                                <Eye size={14} /> Unhide
                              </>
                            ) : (
                              <>
                                <EyeOff size={14} /> Hide
                              </>
                            )}
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            title="Delete Review"
                            onClick={() => handleOpenDelete(rev)}
                            style={{
                              padding: "6px",
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              background: "#fff",
                              color: "#dc2626",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderTop: "1px solid #e5e7eb",
                background: "#f9fafb",
                fontSize: "13px",
                color: "#6b7280",
              }}
            >
              <div>
                Showing page <b>{pagination.page}</b> of{" "}
                <b>{pagination.totalPages}</b> ({pagination.total} total reviews)
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    cursor: page <= 1 ? "not-allowed" : "pointer",
                    opacity: page <= 1 ? 0.5 : 1,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    cursor:
                      page >= pagination.totalPages
                        ? "not-allowed"
                        : "pointer",
                    opacity: page >= pagination.totalPages ? 0.5 : 1,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedReview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "420px",
              padding: "24px",
            }}
          >
            <h3
              style={{
                margin: "0 0 10px 0",
                fontSize: "18px",
                fontWeight: 700,
                color: "#dc2626",
              }}
            >
              Delete Review?
            </h3>
            <p style={{ fontSize: "14px", color: "#4b5563", margin: "0 0 20px 0" }}>
              Are you sure you want to permanently delete the review from{" "}
              <b>{selectedReview.user_name || "Customer"}</b>? This action
              cannot be undone.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedReview(null);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  color: "#374151",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
