import React, { useMemo, useState } from "react";
import {
  Heart,
  Star,
  Sparkles,
  Award,
  RefreshCw,
  Search,
  Filter,
  X,
  Package,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import DataTable from "../../components/common/DataTable";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import Pagination from "../../components/ui/Pagination";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import useDebouncedValue from "../../utils/useDebouncedValue";
import { toAssetUrl } from "../../utils/assetUrl";
import { useGetAdminFavouritesQuery } from "../../services/favouriteApi";
import { useGetProductCategoriesQuery } from "../../services/productApi";

function formatRupee(num) {
  if (num == null) return "0";
  return Number(num).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export default function FavouriteList() {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState("favourites");
  const [sortOrder, setSortOrder] = useState("desc");

  const debouncedQuery = useDebouncedValue(searchText);

  const cleanSearch =
    typeof debouncedQuery === "string" ? debouncedQuery.trim() : "";

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      sortBy,
      sortOrder,
      ...(cleanSearch ? { search: cleanSearch } : {}),
      ...(selectedCategory ? { category: selectedCategory } : {}),
    }),
    [page, limit, sortBy, sortOrder, cleanSearch, selectedCategory]
  );

  const {
    data: favouritesResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAdminFavouritesQuery(queryParams);

  const { data: categoryResponse } = useGetProductCategoriesQuery();

  const items = favouritesResponse?.data || [];
  const pagination = favouritesResponse?.pagination;
  const stats = favouritesResponse?.stats || {
    totalFavourites: 0,
    uniqueProductsFavourited: 0,
    topProduct: null,
  };

  const categoryOptions = useMemo(() => {
    const rawCategories = categoryResponse?.data || [];
    return [
      { value: "", label: "All Categories" },
      ...rawCategories.map((c) => ({
        value: String(c.id),
        label: c.name,
      })),
    ];
  }, [categoryResponse]);

  const handleSort = (key, nextOrder) => {
    setSortBy(key);
    setSortOrder(nextOrder);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchText("");
    setSelectedCategory("");
    setSortBy("favourites");
    setSortOrder("desc");
    setPage(1);
  };

  const columns = useMemo(
    () => [
      {
        key: "product",
        label: "PRODUCT",
        sortable: true,
        minWidth: "260px",
        render: (_, row) => {
          const defaultFallback =
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&q=80";
          const imgSrc = toAssetUrl(row.image) || defaultFallback;
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                }}
              >
                <img
                  src={imgSrc}
                  alt={row.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = defaultFallback;
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "#111827",
                    fontSize: "14px",
                    lineHeight: "1.2",
                  }}
                >
                  {row.name}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    marginTop: "2px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {row.availability_type === "MADE_TO_ORDER" ? (
                    <span style={{ color: "#059669", fontWeight: 600 }}>
                      Made to order
                    </span>
                  ) : row.stock > 0 ? (
                    <span>{row.stock} in stock</span>
                  ) : (
                    <span style={{ color: "#dc2626", fontWeight: 600 }}>
                      Out of stock
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        key: "category",
        label: "CATEGORY",
        sortable: false,
        minWidth: "140px",
        render: (_, row) => (
          <span
            style={{
              display: "inline-block",
              padding: "3px 10px",
              borderRadius: "9999px",
              background: "#f3f4f6",
              color: "#374151",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {row.category_name || "Uncategorized"}
          </span>
        ),
      },
      {
        key: "price",
        label: "PRICE",
        sortable: true,
        minWidth: "110px",
        render: (_, row) => (
          <span style={{ fontWeight: 700, color: "#111827", fontSize: "13px" }}>
            ₹{formatRupee(row.price)}
          </span>
        ),
      },
      {
        key: "favourites",
        label: "FAVOURITES",
        sortable: true,
        minWidth: "150px",
        render: (_, row) => (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "9999px",
              background: "#fee2e2",
              color: "#dc2626",
              fontWeight: 700,
              fontSize: "12px",
            }}
          >
            <Heart size={14} fill="#dc2626" />
            <span>
              {row.favourites_count} {row.favourites_count === 1 ? "save" : "saves"}
            </span>
          </div>
        ),
      },
      {
        key: "rating",
        label: "RATING",
        sortable: true,
        minWidth: "150px",
        render: (_, row) => {
          const ratingVal = Number(row.rating) || 0;
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  background: ratingVal > 0 ? "#fef3c7" : "#f3f4f6",
                  color: ratingVal > 0 ? "#b45309" : "#6b7280",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <Star
                  size={13}
                  fill={ratingVal > 0 ? "#f59e0b" : "none"}
                  color={ratingVal > 0 ? "#f59e0b" : "#9ca3af"}
                />
                <span>{ratingVal > 0 ? ratingVal.toFixed(1) : "—"}</span>
              </div>
              <span style={{ fontSize: "11px", color: "#6b7280" }}>
                ({row.review_count || 0})
              </span>
            </div>
          );
        },
      },
      {
        key: "status",
        label: "STATUS",
        sortable: false,
        minWidth: "100px",
        render: (_, row) => {
          const isActive = row.is_active;
          return (
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 700,
                background: isActive ? "#dcfce7" : "#fee2e2",
                color: isActive ? "#15803d" : "#991b1b",
              }}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <>
      {/* SECTION HEADER */}
      <div className="section-head">
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>Customer Favourites</span>
            {isFetching && !isLoading && (
              <RefreshCw size={18} className="animate-spin text-muted" />
            )}
          </h1>
          <p>Real-time analytics on the dishes your customers save and love most.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* OVERVIEW STATS CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        {/* CARD 1: TOTAL FAVOURITES */}
        <div
          className="card border-0 shadow-sm"
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Heart size={24} fill="#dc2626" />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>
              Total Wishlist Adds
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#111827", marginTop: "2px" }}>
              {isLoading ? "—" : stats.totalFavourites}
            </div>
            <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: 600, marginTop: "2px" }}>
              Active customer saves
            </div>
          </div>
        </div>

        {/* CARD 2: UNIQUE PRODUCTS FAVOURITED */}
        <div
          className="card border-0 shadow-sm"
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "#ede9fe",
              color: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>
              Unique Loved Dishes
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#111827", marginTop: "2px" }}>
              {isLoading ? "—" : stats.uniqueProductsFavourited}
            </div>
            <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500, marginTop: "2px" }}>
              Distinct items with saves
            </div>
          </div>
        </div>

        {/* CARD 3: TOP PRODUCT */}
        <div
          className="card border-0 shadow-sm"
          style={{
            padding: "20px",
            borderRadius: "16px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "#fef3c7",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Award size={24} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>
              Top Favourite Dish
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#111827",
                marginTop: "2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={stats.topProduct?.name || "No favourites yet"}
            >
              {isLoading
                ? "—"
                : stats.topProduct?.name || "None yet"}
            </div>
            <div style={{ fontSize: "11px", color: "#b45309", fontWeight: 700, marginTop: "2px" }}>
              {stats.topProduct
                ? `${stats.topProduct.count} customer ${stats.topProduct.count === 1 ? "save" : "saves"}`
                : "Awaiting customer picks"}
            </div>
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div
          style={{
            padding: "16px",
            borderRadius: "12px",
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            color: "#991b1b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600 }}>
            <AlertCircle size={18} />
            <span>
              {error?.data?.message || "Failed to load customer favourites data. Please try again."}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* MAIN DATA TABLE CARD */}
      <div className="card table-card border-0 shadow-sm" style={{ borderRadius: "16px", overflow: "hidden" }}>
        {/* TOOLBAR */}
        <div
          className="table-toolbar"
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "260px" }}>
            <SearchInput
              value={searchText}
              onChange={(e) => {
                const val = typeof e === "string" ? e : e?.target?.value ?? "";
                setSearchText(val);
                setPage(1);
              }}
              placeholder="Search dishes or categories..."
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Category Select */}
            <div style={{ minWidth: "160px" }}>
            <Select
  value={selectedCategory}
  onChange={(e) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  }}
>
  {categoryOptions.map((option) => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))}
</Select>
</div>

            {/* Clear Filters */}
            {(searchText || selectedCategory) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding:"5px", borderRadius: "4px", background:"#333", color:"white" }}
              >
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* DATA TABLE */}
        <DataTable
          data={items}
          columns={columns}
          loading={isLoading}
          showSerialNumber={true}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          emptyMessage={
            searchText || selectedCategory
              ? `No favourite products matching "${searchText || "selected filters"}".`
              : "No customer favourites recorded yet. When customers add dishes to their wishlist, they will appear here with live statistics."
          }
        />

        {/* PAGINATION */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => setPage(p)}
            itemLabel="favourited dishes"
          />
        )}
      </div>
    </>
  );
}
