import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "../../schema/category.schema";
export default function CategoryForm({ initialValues, onSubmit, submitLabel }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: initialValues,
  });
  return (
    <form className="entity-form card" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-grid">
        <label>
          Category name
          <input {...register("name")} placeholder="e.g. Starters" />
        </label>
        <label>
          Status
          <select {...register("status")}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </label>
        <label className="full">
          Description
          <textarea
            {...register("description")}
            placeholder="Describe this menu category"
          />
        </label>
      </div>
      {Object.values(errors).map((error) => (
        <small className="error" key={error.message}>
          {error.message}
        </small>
      ))}
      <button className="primary-btn" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
