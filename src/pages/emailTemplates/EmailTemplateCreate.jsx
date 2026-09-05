import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import EmailTemplateForm from "../../components/forms/EmailTemplateForm";
import { useCreateEmailTemplateMutation } from "../../services/emailTemplateApi";

export default function EmailTemplateCreate() {
  const navigate = useNavigate();
  const [createTemplate, { isLoading, error }] = useCreateEmailTemplateMutation();

  const save = async (values) => {
    try {
      await createTemplate(values).unwrap();
      navigate("/email-templates");
    } catch {
      // The API error is shown below.
    }
  };

  return (
    <>
      <div className="section-head"><div><h1>Add email template</h1><p>Create reusable content for future email workflows.</p></div><Button variant="outline" onClick={() => navigate("/email-templates")}><ArrowLeft size={17} /> Back to templates</Button></div>
      <EmailTemplateForm initialValues={{}} onSubmit={save} submitLabel="Create template" isSubmitting={isLoading} />
      {error && <p className="error">{error.data?.message || "Unable to create email template"}</p>}
    </>
  );
}
