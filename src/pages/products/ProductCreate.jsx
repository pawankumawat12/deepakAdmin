import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ProductForm from "../../components/forms/ProductForm";
import { createProduct } from "../../context/catalogSlice";
export default function ProductCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useSelector((state) => state.catalog.categories);
  const save = (data) => {
    dispatch(createProduct(data));
    navigate("/products");
  };
  return (
    <>
      <div className="section-head">
        <div>
          <h1>Add product</h1>
          <p>Create a new menu item for the storefront.</p>
        </div>
      </div>
      <ProductForm
        categories={categories}
        initialValues={{
          name: "",
          categoryId: "",
          price: "",
          stock: 0,
          status: "Active",
        }}
        onSubmit={save}
        submitLabel="Create product"
      />
    </>
  );
}
