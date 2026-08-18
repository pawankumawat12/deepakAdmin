import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Filter, Plus, Search, Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import { deleteProduct } from "../../context/catalogSlice";

export default function ProductList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, categories } = useSelector((state) => state.catalog);
  const [query, setQuery] = useState("");
  const categoryNames = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [category.id, category.name])
      ),
    [categories]
  );
  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products
      .map((product) => ({
        ...product,
        category: categoryNames[product.categoryId] || "—",
      }))
      .filter(
        (product) =>
          !term ||
          [product.name, product.category, product.status].some((value) =>
            String(value).toLowerCase().includes(term)
          )
      );
  }, [products, categoryNames, query]);

  return (
    <>
      <div className="section-head">
        <div>
          <h1>Products</h1>
          <p>Manage the dishes and drinks visible on your storefront.</p>
        </div>
        <button
          className="primary-btn"
          onClick={() => navigate("/products/create")}
        >
          <Plus size={18} /> Add product
        </button>
      </div>
      <div className="card table-card">
        <div className="table-toolbar">
          <label className="search">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
            />
          </label>
          <button className="outline-btn" type="button">
            <Filter size={16} /> Filter
          </button>
        </div>
        <DataTable
          columns={[
            {
              key: "name",
              label: "PRODUCT",
              render: (value, product) => (
                <div className="product-name">
                  <span>{product.image}</span>
                  <b>{value}</b>
                </div>
              ),
            },
            { key: "category", label: "CATEGORY" },
            { key: "price", label: "PRICE", render: (value) => `₹${value}` },
            { key: "stock", label: "STOCK" },
            {
              key: "status",
              label: "STATUS",
              render: (value) => (
                <em className={value === "Active" ? "active" : "inactive"}>
                  {value}
                </em>
              ),
            },
          ]}
          data={rows}
          emptyMessage="No products found."
          renderActions={(product) => (
            <>
              <button
                className="dots"
                aria-label={`Edit ${product.name}`}
                onClick={() => navigate(`/products/${product.id}/edit`)}
              >
                <Pencil size={16} />
              </button>
              <button
                className="dots"
                aria-label={`Delete ${product.name}`}
                onClick={() => dispatch(deleteProduct(product.id))}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        />
      </div>
    </>
  );
}
