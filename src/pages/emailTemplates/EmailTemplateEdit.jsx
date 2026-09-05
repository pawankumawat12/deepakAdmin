import { ArrowLeft } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import EmailTemplateForm from "../../components/forms/EmailTemplateForm";
import { useGetEmailTemplateQuery, useUpdateEmailTemplateMutation } from "../../services/emailTemplateApi";

export default function EmailTemplateEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading: loading, isError } = useGetEmailTemplateQuery(id);
  const [updateTemplate, { isLoading, error }] = useUpdateEmailTemplateMutation();
  const template = data?.data;

  if (isError) return <Navigate to="/email-templates" replace />;
  if (loading) return <p>Loading email template...</p>;
  if (!template) return <Navigate to="/email-templates" replace />;

  const save = async (values) => {
    try {
      await updateTemplate({ id, ...values }).unwrap();
      navigate("/email-templates");
    } catch {
      // The API error is shown below.
    }
  };

  return (
    <>
      <div className="section-head"><div><h1>Edit email template</h1><p>Update {template.name}.</p></div><Button variant="outline" onClick={() => navigate("/email-templates")}><ArrowLeft size={17} /> Back to templates</Button></div>
      <EmailTemplateForm key={template.id} initialValues={template} onSubmit={save} submitLabel="Save changes" isSubmitting={isLoading} />
      {error && <p className="error">{error.data?.message || "Unable to update email template"}</p>}
    </>
  );
}
