import { useMemo, useState } from "react";
import { Filter, Pencil, Plus, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Button from "../../components/ui/Button";
import SearchInput from "../../components/ui/SearchInput";
import Select from "../../components/ui/Select";
import Pagination from "../../components/ui/Pagination";
import useDebouncedValue from "../../utils/useDebouncedValue";
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from "../../services/categoryApi";

const initialFilters = { isActive: "" };

export default function CategoryList() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [pendingFilters, setPendingFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const debouncedQuery = useDebouncedValue(searchText);
  const [deleteCategory, { isLoading: isDeleting, error: deleteError }] =
    useDeleteCategoryMutation();
  const params = useMemo(
    () => ({
      page,
      sortBy,
      sortOrder,
      ...(debouncedQuery.trim() ? { search: debouncedQuery.trim() } : {}),
      ...(filters.isActive !== "" ? { isActive: filters.isActive } : {}),
    }),
    [page, sortBy, sortOrder, debouncedQuery, filters]
  );
  const {
    data: categoryResponse,
    isLoading,
    error,
  } = useGetCategoriesQuery(params);
  const categories = (categoryResponse?.data || []).map((category) => ({
    ...category,
    status: category.is_active ? "Active" : "Inactive",
  }));
  const pagination = categoryResponse?.pagination;

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
      await deleteCategory(categoryToDelete.id).unwrap();
      setCategoryToDelete(null);
    } catch {
      // The API error is rendered in the dialog.
    }
  };

  return (
    <>
      <div className="section-head">
        <div>
          <h1>Categories</h1>
          <p>Organise menu items into useful collections.</p>
        </div>
        <Button onClick={() => navigate("/categories/create")}>
          <Plus size={18} /> Add category
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
            placeholder="Search categories"
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
              Status
              <Select
                value={pendingFilters.isActive}
                onChange={(event) =>
                  setPendingFilters({ isActive: event.target.value })
                }
              >
                <option value="">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
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
            {error.data?.message || "Unable to load categories"}
          </p>
        )}
        <DataTable
          loading={isLoading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          columns={[
            {
              key: "image",
              label: "IMAGE",
              render: (value) => {
                if (!value) {
                  return <span className="muted">No image</span>;
                }
            
                const imageUrl = value.startsWith("http")
                  ? value
                  : `http://localhost:5000${value}`;
            
                return (
                  <img
                    src={imageUrl}
                    alt="Category"
                    className="table-image"
                  />
                );
              },
            },
            { key: "name", label: "NAME", sortable: true },
            { key: "description", label: "DESCRIPTION", sortable: true },
            {
              key: "status",
              label: "STATUS",
              sortable: true,
              render: (value) => (
                <em className={value === "Active" ? "active" : "inactive"}>
                  {value}
                </em>
              ),
            },
          ]}
          data={categories}
          emptyMessage="No categories found."
          renderActions={(category) => (
            <>
              <Button
                variant="plain"
                aria-label={`Edit ${category.name}`}
                onClick={() => navigate(`/categories/${category.id}/edit`)}
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="plain"
                aria-label={`Delete ${category.name}`}
                onClick={() => setCategoryToDelete(category)}
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
          itemLabel="categories"
        />
      </div>
      {categoryToDelete && (
        <ConfirmDialog
          title="Delete category?"
          message={`Delete ${categoryToDelete.name}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onClose={() => setCategoryToDelete(null)}
          isLoading={isDeleting}
          error={deleteError?.data?.message}
        />
      )}
    </>
  );
}
