import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEntitySchema } from "../../schema/entity.schema";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
export default function EntityForm({
  fields,
  initialValues,
  onSubmit,
  submitLabel,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createEntitySchema(fields)),
    defaultValues: initialValues,
  });
  return (
    <form className="entity-form card" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-grid">
        {fields.map((field) => (
          <label
            key={field.key}
            className={field.type === "textarea" ? "full" : ""}
          >
            {field.label}
            {field.type === "select" ? (
              <Select {...register(field.key)}>
                {field.options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
            ) : field.type === "textarea" ? (
              <textarea
                {...register(field.key)}
                placeholder={field.placeholder}
              />
            ) : (
              <Input
                type={field.type || "text"}
                {...register(field.key)}
                placeholder={field.placeholder}
              />
            )}
            {errors[field.key] && (
              <small className="error">{errors[field.key].message}</small>
            )}
          </label>
        ))}
      </div>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
