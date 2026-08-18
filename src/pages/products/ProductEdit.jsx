import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import ProductForm from "../../components/forms/ProductForm";
import { updateProduct } from "../../context/catalogSlice";
export default function ProductEdit() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const product = useSelector((state) =>
    state.catalog.products.find((item) => item.id === id)
  );
  const categories = useSelector((state) => state.catalog.categories);
  if (!product) return <Navigate to="/products" replace />;
  const save = (data) => {
    dispatch(updateProduct({ ...data, id }));
    navigate("/products");
  };
  return (
    <>
      <div className="section-head">
        <div>
          <h1>Edit product</h1>
          <p>Update {product.name}.</p>
        </div>
      </div>
      <ProductForm
        categories={categories}
        initialValues={product}
        onSubmit={save}
        submitLabel="Save changes"
      />
    </>
  );
}
