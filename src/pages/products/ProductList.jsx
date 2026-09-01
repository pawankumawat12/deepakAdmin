import { useMemo, useState } from "react";
import { Filter, Plus, Trash2, Pencil, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Button from "../../components/ui/Button";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import Pagination from "../../components/ui/Pagination";
import useDebouncedValue from "../../utils/useDebouncedValue";
import {
  useDeleteProductMutation,
  useGetProductCategoriesQuery,
  useGetProductsQuery,
} from "../../services/productApi";

const initialFilters = { categoryId: "", isActive: "", availabilityType: "" };

export default function ProductList() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [pendingFilters, setPendingFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteProduct, { isLoading: isDeleting, error: deleteError }] =
    useDeleteProductMutation();
  const debouncedQuery = useDebouncedValue(searchText);
  const params = useMemo(
    () => ({
      page,
      limit,
      sortBy,
      sortOrder,
      ...(debouncedQuery.trim() ? { search: debouncedQuery.trim() } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.isActive !== "" ? { isActive: filters.isActive } : {}),
      ...(filters.availabilityType ? { availabilityType: filters.availabilityType } : {}),
    }),
    [page, limit, debouncedQuery, filters, sortBy, sortOrder]
  );
  const {
    data: productResponse,
    isLoading,
    error,
  } = useGetProductsQuery(params);
  const { data: categoryResponse } = useGetProductCategoriesQuery();
  const rows = (productResponse?.data || []).map((product) => ({
    ...product,
    category: product.category_name || "—",
    status: (product.availability_type === "MADE_TO_ORDER" || product.is_active)
      ? "Active"
      : "Out of stock",
  }));
  const pagination = productResponse?.pagination;

  const applyFilters = () => {
    setFilters(pendingFilters);
    setPage(1);
    setFiltersOpen(false);
  };
  const clearFilters = () => {
    setPendingFilters(initialFilters);
    setFilters(initialFilters);
    setPage(1);
  };

  const handleSort = (nextSortBy, nextSortOrder) => {
    setSortBy(nextSortBy);
    setSortOrder(nextSortOrder);
    setPage(1);
  };
  const confirmDelete = async () => {
    try {
      await deleteProduct(productToDelete.id).unwrap();
      setProductToDelete(null);
    } catch {
      // The API error is rendered in the dialog.
    }
  };

  return (
    <>
      <div className="section-head">
        <div>
          <h1>Products</h1>
          <p>Manage the dishes and drinks visible on your storefront.</p>
        </div>
        <Button onClick={() => navigate("/products/create")}>
          <Plus size={18} /> Add product
        </Button>
      </div>
      <div className="card table-card">
        <div className="table-toolbar">
          <SearchInput
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
              setPage(1);
            }}
            placeholder="Search products"
          />
          <Button
            variant="outline"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
          >
            <Filter size={16} /> Filter
          </Button>
        </div>
        {filtersOpen && (
          <form className="product-filter-bar">
            <label>
              Category
              <Select
                value={pendingFilters.categoryId}
                onChange={(event) =>
                  setPendingFilters((value) => ({
                    ...value,
                    categoryId: event.target.value,
                  }))
                }
              >
                <option value="">All categories</option>
                {(categoryResponse?.data || []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </label>

            <label>
              Fulfillment Type
              <Select
                value={pendingFilters.availabilityType}
                onChange={(event) =>
                  setPendingFilters((value) => ({
                    ...value,
                    availabilityType: event.target.value,
                  }))
                }
              >
                <option value="">All fulfillment types</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="MADE_TO_ORDER">Made to Order</option>
              </Select>
            </label>

            <label>
              Status
              <Select
                value={pendingFilters.isActive}
                onChange={(event) =>
                  setPendingFilters((value) => ({
                    ...value,
                    isActive: event.target.value,
                  }))
                }
              >
                <option value="">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Out of stock</option>
              </Select>
            </label>

            <div className="filter-actions">
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
              <Button onClick={applyFilters}>Apply</Button>
              <Button
                variant="plain"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X size={17} />
              </Button>
            </div>
          </form>
        )}
        {error && (
          <p className="error table-error">
            {error.data?.message || "Unable to load products"}
          </p>
        )}
        <DataTable
          loading={isLoading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          columns={[
            {
              key: "name",
              label: "PRODUCT",
              render: (value) => (
                <div className="product-name">
                  <b>{value}</b>
                </div>
              ),
              sortable: true,
            },
            { key: "category", label: "CATEGORY", sortable: true },
            { key: "price", label: "PRICE", render: (value) => `₹${value}`, sortable: true },
            {
              key: "availability_type",
              label: "FULFILLMENT",
              render: (value, item) => (
                item.availability_type === "MADE_TO_ORDER" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: "#fef3eb", color: "#e86b1a" }}>
                    ⚡ Made to Order
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: "#f0fdf4", color: "#16a34a" }}>
                    📦 In Stock ({item.stock})
                  </span>
                )
              ),
              sortable: true,
            },
            {
              key: "status",
              label: "STATUS",
              render: (value) => (
                <em className={value === "Active" ? "active" : "inactive"}>
                  {value}
                </em>
              ),
              sortable: true,
            },
          ]}
          data={rows}
          emptyMessage="No products found."
          renderActions={(product) => (
            <>
              <Button
                variant="plain"
                aria-label={`Edit ${product.name}`}
                onClick={() => navigate(`/products/${product.id}/edit`)}
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="plain"
                aria-label={`Delete ${product.name}`}
                onClick={() => setProductToDelete(product)}
              >
                <Trash2 size={16} />
              </Button>
            </>
          )}
        />
        <Pagination
          page={pagination?.page || page}
          totalPages={pagination?.totalPages || 1}
          total={pagination?.total || 0}
          limit={limit}
          onPageChange={(p) => setPage(p)}
          itemLabel="products"
        />
      </div>
      {productToDelete && (
        <ConfirmDialog
          title="Delete product?"
          message={`Delete ${productToDelete.name}? This cannot be undone.`}
          confirmLabel="Delete product"
          onConfirm={confirmDelete}
          onClose={() => setProductToDelete(null)}
          isLoading={isDeleting}
          error={deleteError?.data?.message}
        />
      )}
    </>
  );
}
