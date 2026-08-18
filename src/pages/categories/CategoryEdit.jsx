import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import CategoryForm from "../../components/forms/CategoryForm";
import { updateCategory } from "../../context/catalogSlice";
export default function CategoryEdit() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const category = useSelector((state) =>
    state.catalog.categories.find((item) => item.id === id)
  );
  if (!category) return <Navigate to="/categories" replace />;
  const save = (data) => {
    dispatch(updateCategory({ ...data, id }));
    navigate("/categories");
  };
  return (
    <>
      <div className="section-head">
        <div>
          <h1>Edit category</h1>
          <p>Update {category.name}.</p>
        </div>
      </div>
      <CategoryForm
        initialValues={category}
        onSubmit={save}
        submitLabel="Save changes"
      />
    </>
  );
}
