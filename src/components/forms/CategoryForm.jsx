import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import { categorySchema } from "../../schema/category.schema";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

const getImageSrc = (imageUrl) => {
  if (!imageUrl || /^(?:blob:|data:|https?:\/\/)/i.test(imageUrl)) return imageUrl;

  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
  return `${new URL(apiUrl).origin}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
};

export default function CategoryForm({
  initialValues,
  categories = [],
  existingImage,
  onSubmit,
  submitLabel,
  isSubmitting,
}) {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(existingImage || "");
  const [imageError, setImageError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    setPreviewUrl(existingImage || "");
    setImageFile(null);
  }, [existingImage]);

  useEffect(() => () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setImageError("");
    event.target.value = "";
  };

  const removeImage = () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl(existingImage || "");
  };

  const submit = (data) => {
    if (!imageFile && !existingImage) {
      setImageError("Choose a category image.");
      return;
    }
    onSubmit({ ...data, imageFile });
  };

  return (
    <form className="entity-form card" onSubmit={handleSubmit(submit)}>
      <div className="form-grid">
        <label>
          Category name
          <Input {...register("name")} placeholder="e.g. Starters" />
        </label>
        <label>
          Status
          <Select {...register("status")}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </label>
        <label>
          Parent category
          <Select {...register("parentCategoryId")}>
            <option value="">No parent category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>
        </label>
        <label>
          Category image
          <Input type="file" accept="image/*" onChange={selectImage} />
          <small className="muted">JPG, PNG, or WEBP. Maximum 10 MB.</small>
        </label>
        <label className="full">
          Description
          <textarea {...register("description")} placeholder="Describe this menu category" />
        </label>
      </div>

      {previewUrl && (
        <div className="image-preview-list">
          <div className="image-preview">
            <img src={getImageSrc(previewUrl)} alt="Category preview" />
            {imageFile && (
              <Button type="button" variant="plain" className="image-preview-remove" aria-label="Remove category image" onClick={removeImage}>
                <X size={14} />
              </Button>
            )}
          </div>
        </div>
      )}

      {imageError && <small className="error">{imageError}</small>}
      {Object.values(errors).map((error) => (
        <small className="error" key={error.message}>{error.message}</small>
      ))}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
