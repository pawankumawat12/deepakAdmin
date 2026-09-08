import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import CKEditorField from "../ui/CKEditorField";
import { cmsPageSchema } from "../../schema/cmsPage.schema";
import { Globe, Lock, Unlock, Sparkles } from "lucide-react";

const emptyValues = {
  title: "",
  slug: "",
  content: "",
  status: "published",
  isActive: true,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
};

function generateSlug(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CmsPageForm({
  initialValues = {},
  onSubmit,
  submitLabel = "Save Page",
  isSubmitting = false,
  backendErrors = {},
}) {
  const [values, setValues] = useState({ ...emptyValues, ...initialValues });
  const [errors, setErrors] = useState({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(
    Boolean(initialValues?.slug)
  );

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setValues({
        ...emptyValues,
        ...initialValues,
      });
      setIsSlugManuallyEdited(true);
    }
  }, [initialValues]);

  const update = (field, value) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-update slug if not manually locked/edited
      if (field === "title" && !isSlugManuallyEdited) {
        next.slug = generateSlug(value);
      }
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSlugChange = (e) => {
    setIsSlugManuallyEdited(true);
    update("slug", generateSlug(e.target.value));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      title: values.title?.trim() || "",
      slug: values.slug?.trim() || generateSlug(values.title),
      content: values.content || "",
      status: values.status || "published",
      isActive: Boolean(values.isActive),
      seoTitle: values.seoTitle?.trim() || "",
      seoDescription: values.seoDescription?.trim() || "",
      seoKeywords: values.seoKeywords?.trim() || "",
    };

    const result = cmsPageSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(payload);
  };

  const mergedErrors = { ...errors, ...backendErrors };

  return (
    <form className="entity-form card cms-page-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        {/* Page Title */}
        <div className="full">
          <label htmlFor="cms-title">
            Page Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="cms-title"
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g., Refund & Cancellation Policy"
            disabled={isSubmitting}
          />
          {mergedErrors.title && <small className="error text-red-500">{mergedErrors.title}</small>}
        </div>

        {/* Slug */}
        <div className="full">
          <div className="flex items-center justify-between">
            <label htmlFor="cms-slug">
              Slug (URL Identifier) <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setIsSlugManuallyEdited(false);
                update("slug", generateSlug(values.title));
              }}
              className="text-xs text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
              title="Regenerate slug from title"
            >
              <Sparkles size={12} /> Sync from Title
            </button>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs text-gray-400 font-mono select-none">
              /
            </span>
            <Input
              id="cms-slug"
              value={values.slug}
              onChange={handleSlugChange}
              placeholder="refund-policy"
              className="pl-7 font-mono text-sm"
              disabled={isSubmitting}
            />
          </div>
          <small className="text-xs text-gray-500 mt-1 block">
            Public URL preview: <code>/{values.slug || "your-slug"}</code>
          </small>
          {mergedErrors.slug && <small className="error text-red-500">{mergedErrors.slug}</small>}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="cms-status">Status</label>
          <Select
            id="cms-status"
            value={values.status}
            onChange={(e) => update("status", e.target.value)}
            disabled={isSubmitting}
          >
            <option value="published">Published (Visible to public)</option>
            <option value="draft">Draft (Hidden)</option>
          </Select>
          {mergedErrors.status && <small className="error text-red-500">{mergedErrors.status}</small>}
        </div>

        {/* Active Toggle */}
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(e) => update("isActive", e.target.checked)}
              disabled={isSubmitting}
              className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <span className="text-sm font-medium">Active (Enable page)</span>
          </label>
        </div>

        {/* CKEditor Field for Page Content */}
        <div className="full mt-2">
          <CKEditorField
            id="cms-page-content"
            label="Page Content (HTML)"
            value={values.content}
            onChange={(html) => update("content", html)}
            height={420}
          />
          {mergedErrors.content && <small className="error text-red-500">{mergedErrors.content}</small>}
        </div>

        {/* SEO Meta Information Section */}
        <div className="full mt-6 border-t border-gray-100 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={18} className="text-[var(--color-primary)]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Search Engine Optimization (SEO)
            </h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Configure custom meta tags to optimize this page for Google and other search engines.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="cms-seo-title">SEO Title (Meta Title)</label>
              <Input
                id="cms-seo-title"
                value={values.seoTitle}
                onChange={(e) => update("seoTitle", e.target.value)}
                placeholder="e.g., Refund & Cancellation Policy | SFC Bakers"
                disabled={isSubmitting}
              />
              <small className="text-xs text-gray-400">
                Recommended: 50-60 characters
              </small>
            </div>

            <div>
              <label htmlFor="cms-seo-description">SEO Description (Meta Description)</label>
              <textarea
                id="cms-seo-description"
                rows={3}
                value={values.seoDescription}
                onChange={(e) => update("seoDescription", e.target.value)}
                placeholder="Brief summary of the page for search engine results..."
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-200 p-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none"
              />
              <small className="text-xs text-gray-400">
                Recommended: 120-160 characters
              </small>
            </div>

            <div>
              <label htmlFor="cms-seo-keywords">SEO Keywords</label>
              <Input
                id="cms-seo-keywords"
                value={values.seoKeywords}
                onChange={(e) => update("seoKeywords", e.target.value)}
                placeholder="e.g., refund policy, food cancellation, sfc bakers refund"
                disabled={isSubmitting}
              />
              <small className="text-xs text-gray-400">
                Comma-separated keywords
              </small>
            </div>
          </div>
        </div>

        {/* Global Error Notice */}
        {mergedErrors.general && (
          <div className="full p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {mergedErrors.general}
          </div>
        )}

        {/* Form Actions */}
        <div className="full flex items-center justify-end gap-3 mt-6 border-t border-gray-100 pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

