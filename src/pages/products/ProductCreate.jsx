import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../../components/forms/ProductForm";
import Button from "../../components/ui/Button";
import {
  useCreateProductMutation,
  useGetProductCategoriesQuery,
} from "../../services/productApi";

export default function ProductCreate() {
  const navigate = useNavigate();
  const { data: categoryResponse, isLoading: categoriesLoading } =
    useGetProductCategoriesQuery();
  const [createProduct, { isLoading, error }] = useCreateProductMutation();
  const categories = categoryResponse?.data || [];
  
  const save = async (data) => {
    try {
      await createProduct(data).unwrap();
      navigate("/products");
    } catch {
      // The API error is shown below.
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
          {error && (
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
