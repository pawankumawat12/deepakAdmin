import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import ProductForm from "../../components/forms/ProductForm";
import Button from "../../components/ui/Button";
import {
  useCreateProductMutation,
  useGetProductCategoriesQuery,
} from "../../services/productApi";
import { useGetMyStoreQuery } from "../../services/storeApi";

export default function ProductCreate() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const isStoreOwner = user?.role === "store_owner";

  const { data: storeResponse, isLoading: storeLoading } = useGetMyStoreQuery(
    undefined,
    { skip: !isStoreOwner }
  );

  const { data: categoryResponse, isLoading: categoriesLoading } =
    useGetProductCategoriesQuery();
  const [createProduct, { isLoading, error }] = useCreateProductMutation();
  const categories = categoryResponse?.data || [];

  // Store Owner Location Guard: Must set store location before adding products
  useEffect(() => {
    if (!storeLoading && isStoreOwner && storeResponse?.store) {
      const store = storeResponse.store;
      if (store.latitude == null || store.longitude == null) {
        toast.error(
          "⚠️ Please set your Bakery Store Location on the map first before adding products."
        );
        navigate("/store-location");
      }
    }
  }, [storeLoading, isStoreOwner, storeResponse, navigate]);
  
  const save = async (data) => {
    try {
      await createProduct(data).unwrap();
      toast.success("Product created successfully!");
      navigate("/products");
    } catch {
      // The API error is shown inline below
    }
  };

  return (
    <>
      <div className="section-head">
        <div>
          <h1>Add product</h1>
          <p>Create a new menu item for the storefront.</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/products")}>
          <ArrowLeft size={17} /> Back to products
        </Button>
      </div>
      {categoriesLoading ? (
        <p>Loading categories...</p>
      ) : (
        <>
          <ProductForm
            categories={categories}
            initialValues={{
              name: "",
              description: "",
              categoryId: "",
              price: "",
              availability_type: "IN_STOCK",
              stock: 0,
              status: "Active",
            }}
            onSubmit={save}
            submitLabel="Create product"
            isSubmitting={isLoading}
          />
          {error && error.status !== 401 && (
            <p className="error">
              {error.data?.errors
                ? Object.entries(error.data.errors)
                    .map(([field, msg]) => `${field}: ${msg}`)
                    .join(" | ")
                : error.data?.message || "Unable to create product"}
            </p>
          )}
        </>
      )}
    </>
  );
}
