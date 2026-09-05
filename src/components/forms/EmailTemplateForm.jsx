import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import CKEditorField from "../ui/CKEditorField";
import { emailTemplateSchema } from "../../schema/emailTemplate.schema";

const emptyValues = {
  name: "",
  slug: "",
  subject: "",
  description: "",
  body: "",
  isActive: true,
};

export default function EmailTemplateForm({ initialValues, onSubmit, submitLabel, isSubmitting }) {
  const [values, setValues] = useState({ ...emptyValues, ...initialValues });
  const [error, setError] = useState("");

  useEffect(() => {
    setValues({ ...emptyValues, ...initialValues });
  }, [initialValues]);

  const update = (field, value) => setValues((current) => ({ ...current, [field]: value }));

  const submit = (event) => {
    event.preventDefault();
    const result = emailTemplateSchema.safeParse(values);
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Please complete the required fields.");
      return;
    }
    setError("");
    onSubmit(result.data);
  };

  return (
    <form className="entity-form card email-template-form" onSubmit={submit}>
      <div className="form-grid">
        <label>
          Template name
          <Input value={values.name} onChange={(event) => update("name", event.target.value)} placeholder="Order confirmation" />
        </label>
        <label>
          Slug
          <Input value={values.slug} onChange={(event) => update("slug", event.target.value)} placeholder="order-confirmation" />
        </label>
        <label className="full">
          Subject
          <Input value={values.subject} onChange={(event) => update("subject", event.target.value)} placeholder="Your order has been confirmed" />
        </label>
        <label className="full">
          Description
          <textarea value={values.description} onChange={(event) => update("description", event.target.value)} placeholder="When this template is intended to be used" />
        </label>
        <CKEditorField value={values.body} onChange={(body) => update("body", body)} />
        <label className="template-active-toggle">
          <span>Active</span>
          <input type="checkbox" checked={values.isActive} onChange={(event) => update("isActive", event.target.checked)} />
        </label>
      </div>
      {error && <small className="error">{error}</small>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
