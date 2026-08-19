import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/ui/Button";

export default function CategoryList() {
  const categories = useSelector((state) => state.catalog.categories);
  const navigate = useNavigate();
  return (
    <>
      <div className="section-head">
        <div>
          <h1>Categories</h1>
          <p>Organise menu items into useful collections.</p>
        </div>
        <Button onClick={() => navigate("/categories/create")}>
          Add category
        </Button>
      </div>
      <DataTable
        data={categories}
        columns={[
          { key: "name", label: "NAME" },
          { key: "description", label: "DESCRIPTION" },
          { key: "status", label: "STATUS" },
        ]}
        renderActions={(category) => (
          <Button
            variant="plain"
            onClick={() => navigate(`/categories/${category.id}/edit`)}
          >
            Edit
          </Button>
        )}
      />{" "}
    </>
  );
}
