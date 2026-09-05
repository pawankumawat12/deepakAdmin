import { useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Button from "../../components/ui/Button";
import SearchInput from "../../components/ui/SearchInput";
import Pagination from "../../components/ui/Pagination";
import useDebouncedValue from "../../utils/useDebouncedValue";
import {
  useDeleteEmailTemplateMutation,
  useGetEmailTemplatesQuery,
} from "../../services/emailTemplateApi";

export default function EmailTemplateList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const debouncedSearch = useDebouncedValue(search);
  const { data, isLoading, error } = useGetEmailTemplatesQuery({
    page,
    limit: 10,
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
  });
  const [deleteTemplate, { isLoading: isDeleting, error: deleteError }] = useDeleteEmailTemplateMutation();
  const templates = data?.data || [];
  const pagination = data?.pagination;

  const confirmDelete = async () => {
    try {
      await deleteTemplate(templateToDelete.id).unwrap();
      setTemplateToDelete(null);
    } catch {
      // The API error is shown in the dialog.
    }
  };

  return (
    <>
      <div className="section-head">
        <div>
          <h1>Email templates</h1>
          <p>Manage reusable email content without changing delivery flows.</p>
        </div>
        <Button onClick={() => navigate("/email-templates/create")}><Plus size={18} /> Add template</Button>
      </div>
      <div className="card table-card">
        <div className="table-toolbar">
          <SearchInput value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search templates" />
        </div>
        {error && <p className="error table-error">{error.data?.message || "Unable to load email templates"}</p>}
        <DataTable
          loading={isLoading}
          data={templates}
          emptyMessage="No email templates found."
          columns={[
            { key: "name", label: "NAME", sortable: false },
            { key: "slug", label: "SLUG" },
            { key: "subject", label: "SUBJECT" },
            { key: "description", label: "DESCRIPTION" },
            { key: "isActive", label: "STATUS", render: (value) => <em className={value ? "active" : "inactive"}>{value ? "Active" : "Inactive"}</em> },
          ]}
          renderActions={(template) => (
            <>
              <Button variant="plain" aria-label={`View ${template.name}`} onClick={() => navigate(`/email-templates/${template.id}`)}><Eye size={16} /></Button>
              <Button variant="plain" aria-label={`Edit ${template.name}`} onClick={() => navigate(`/email-templates/${template.id}/edit`)}><Pencil size={16} /></Button>
              <Button variant="plain" aria-label={`Delete ${template.name}`} onClick={() => setTemplateToDelete(template)}><Trash2 size={16} /></Button>
            </>
          )}
        />
        <Pagination page={pagination?.page || page} totalPages={pagination?.totalPages || 1} total={pagination?.total || 0} limit={10} onPageChange={setPage} itemLabel="templates" />
      </div>
      {templateToDelete && <ConfirmDialog title="Delete email template?" message={`Delete ${templateToDelete.name}? This cannot be undone.`} confirmLabel="Delete" onConfirm={confirmDelete} onClose={() => setTemplateToDelete(null)} isLoading={isDeleting} error={deleteError?.data?.message} />}
    </>
  );
}
