import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Sparkles, Package } from "lucide-react";

import { productSchema } from "../../schema/product.schema";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

const EMPTY_IMAGES = [];

export default function ProductForm({
  categories = [],
  initialValues,
  existingImages = EMPTY_IMAGES,
  onSubmit,
  submitLabel,
  isSubmitting,
}) {
  const [selectedImages, setSelectedImages] = useState([]);
  const selectedImagesRef = useRef([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      availability_type: "IN_STOCK",
      stock: 0,
      ...initialValues,
      imageFiles: [],
    },
  });

  const availabilityType = watch("availability_type") || "IN_STOCK";
  const isMadeToOrder = availabilityType === "MADE_TO_ORDER";

  useEffect(() => {
    if (!existingImages?.length) {
      setSelectedImages([]);
      selectedImagesRef.current = [];
      return;
    }

    const images = existingImages.map((image, index) => ({
      id: `existing-${index}-${image}`,
      file: null,
      originalUrl: image,
      previewUrl: image.startsWith("http")
        ? image
        : `http://localhost:5000${image}`,
      isExisting: true,
    }));

    setSelectedImages(images);
    selectedImagesRef.current = images;
  }, [existingImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) => {
        if (!image.isExisting && image.previewUrl) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });
    };
  }, []);

  const addImages = (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    setSelectedImages((current) => {
      const remainingSlots = 5 - current.length;

      if (remainingSlots <= 0) {
        return current;
      }

      const allowedFiles = files.slice(0, remainingSlots);

      const nextImages = allowedFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        isExisting: false,
      }));

      const updated = [...current, ...nextImages];

      selectedImagesRef.current = updated;
      setValue(
        "imageFiles",
        updated
          .filter((image) => !image.isExisting)
          .map((image) => image.file),
        {
          shouldValidate: true,
          shouldDirty: true,
        }
      );

      return updated;
    });

    event.target.value = "";
  };

  const removeImage = (id) => {
    setSelectedImages((current) => {
      const removed = current.find((image) => image.id === id);

      if (removed && !removed.isExisting) {
        URL.revokeObjectURL(removed.previewUrl);
      }

      const updated = current.filter((image) => image.id !== id);

      selectedImagesRef.current = updated;

      setValue(
        "imageFiles",
        updated
          .filter((image) => !image.isExisting)
          .map((image) => image.file),
        {
          shouldValidate: true,
          shouldDirty: true,
        }
      );

      return updated;
    });
  };

  const submit = (data) => {
    const existingImagesToKeep = selectedImages
      .filter((image) => image.isExisting)
      .map((image) => image.originalUrl);

    onSubmit({
      ...data,
      availabilityType: data.availability_type,
      stock: data.availability_type === "MADE_TO_ORDER" ? 0 : data.stock,
      imageFiles: data.imageFiles || [],
      existingImages: existingImagesToKeep,
    });
  };

  return (
    <form className="entity-form card" onSubmit={handleSubmit(submit)}>
      <div className="form-grid">
        <label>
          Product name
          <Input {...register("name")} placeholder="e.g. Special Paneer Tikka" />
        </label>

        <label>
          Category
          <Select {...register("categoryId")}>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </label>

        <label>
          Description
          <textarea
            {...register("description")}
            rows="3"
            placeholder="Short product description"
          />
        </label>

        <label>
          Price (₹)
          <Input
            type="number"
            min="0"
            step="0.01"
            {...register("price")}
          />
        </label>

        <label>
          Availability / Fulfillment Type
          <Select {...register("availability_type")}>
            <option value="IN_STOCK">In Stock (Track Inventory)</option>
            <option value="MADE_TO_ORDER">Made to Order (Cooked / Produced on Demand)</option>
          </Select>
        </label>

        <label>
          Available stock
          <Input
            type="number"
            min="0"
            disabled={isMadeToOrder}
            placeholder={isMadeToOrder ? "Unlimited (Made to order)" : "0"}
            {...register("stock")}
          />
          {isMadeToOrder ? (
            <small className="muted" style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-primary, #7cb324)" }}>
              <Sparkles size={13} /> Stock tracking not required. Customers can order on demand.
            </small>
          ) : (
            <small className="muted">
              Stock quantity will automatically decrease upon successful orders.
            </small>
          )}
        </label>

        <label>
          Status
          <Select {...register("status")}>
            <option value="Active">Active</option>
            <option value="Out of stock">Out of stock</option>
          </Select>
        </label>

        <label>
          Product images
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={addImages}
          />
          <small className="muted">
            Maximum 5 images. {selectedImages.length}/5 selected
          </small>
        </label>
      </div>

      {selectedImages.length > 0 && (
        <div className="image-preview-list">
          {selectedImages.map((image) => {
            return (
              <div className="image-preview" key={image.id}>
                <img
                  src={image.previewUrl}
                  alt={image.file?.name || "Product image"}
                />
                <Button
                  type="button"
                  variant="plain"
                  className="image-preview-remove"
                  aria-label="Remove image"
                  onClick={() => removeImage(image.id)}
                >
                  <X size={14} />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {errors.imageFiles && (
        <small className="error">{errors.imageFiles.message}</small>
      )}

      {Object.entries(errors)
        .filter(([key]) => key !== "imageFiles")
        .map(([key, error]) => (
          <small className="error" key={key}>
            {error.message}
          </small>
        ))}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
