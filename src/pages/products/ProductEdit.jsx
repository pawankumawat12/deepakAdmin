import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import ProductForm from "../../components/forms/ProductForm";
import Button from "../../components/ui/Button";

import {
  useGetProductCategoriesQuery,
  useGetProductQuery,
  useUpdateProductMutation,
} from "../../services/productApi";

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: productResponse,
    isLoading: productLoading,
    isError,
  } = useGetProductQuery(id);

  const {
    data: categoryResponse,
    isLoading: categoriesLoading,
  } = useGetProductCategoriesQuery();

  const [updateProduct, { isLoading, error }] =
    useUpdateProductMutation();

  const product = productResponse?.data;

  if (isError) {
    return <Navigate to="/products" replace />;
  }

  if (productLoading || categoriesLoading) {
    return <p>Loading product...</p>;
  }

  if (!product) {
    return <Navigate to="/products" replace />;
  }

  const save = async (data) => {
    console.log("FORM DATA:", data);

    try {
      await updateProduct({
        id,

        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price,
        stock: data.stock,
        status: data.status,

        // Existing images jo user ne keep ki hain
        existingImages: data.existingImages || [],

        // Sirf newly selected File objects
        imageFiles: Array.from(data.imageFiles || []),
      }).unwrap();

      navigate("/products");
    } catch (error) {
      console.error("Update product error:", error);
    }
  };

  return (
    <>
      <div className="section-head">
        <div>
          <h1>Edit product</h1>
          <p>Update {product.name}.</p>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate("/products")}
        >
          <ArrowLeft size={17} />
          Back to products
        </Button>
      </div>

      <ProductForm
        categories={categoryResponse?.data || []}
        initialValues={{
          name: product.name,
          description: product.description || "",
          categoryId: String(product.category_id),
          price: product.price,
          stock: product.stock,
          status: product.is_active
            ? "Active"
            : "Out of stock",
        }}
        existingImages={product.images || []}
        onSubmit={save}
        submitLabel="Save changes"
        isSubmitting={isLoading}
      />

      {error && (
        <p className="error">
          {error.data?.message ||
            "Unable to update product"}
        </p>
      )}
    </>
  );
}