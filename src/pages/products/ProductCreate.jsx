import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
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
  const categories = categoryResponse?.data ||  [];
  
  const save = async (data) => {
    try {
      await createProduct(data).unwrap();
      toast.success("Product created successfully!");
      navigate("/products");
    } catch (err) {
      if (err?.status !== 401) {
        const errorMsg =
          err?.data?.message ||
          (err?.data?.errors && Object.values(err.data.errors)[0]) ||
          "Failed to create product. Please check form details.";
        toast.error(errorMsg);
      }
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
