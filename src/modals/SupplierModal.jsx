import { useState, useEffect } from "react";
import { X, Truck } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import {
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
} from "../services/inventoryApi";

export default function SupplierModal({
  isOpen,
  onClose,
  supplier = null,
  onSuccess = null,
}) {
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();

  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    gstin: "",
    notes: "",
    is_active: true,
  });

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        contact_person: supplier.contact_person || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
        gstin: supplier.gstin || "",
        notes: supplier.notes || "",
        is_active: supplier.is_active !== undefined ? Boolean(supplier.is_active) : true,
      });
    } else {
      setFormData({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        gstin: "",
        notes: "",
        is_active: true,
      });
    }
    setErrorMsg("");
  }, [supplier, isOpen]);

  if (!isOpen) return null;

  const isEdit = Boolean(supplier?.id);
  const isLoading = isCreating || isUpdating;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Supplier name is required");
      return;
    }

    try {
      if (isEdit) {
        const res = await updateSupplier({ id: supplier.id, ...formData }).unwrap();
        toast.success("Supplier updated successfully");
        if (onSuccess) onSuccess(res.data);
      } else {
        const res = await createSupplier(formData).unwrap();
        toast.success("Supplier added successfully");
        if (onSuccess) onSuccess(res.data);
      }
      onClose();
    } catch (err) {
      const msg = err?.data?.message || "Failed to save supplier";
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <div
      className="modal-backdrop"
      style={{ zIndex: 1100 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <section
        className="admin-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="supplier-modal-title"
      >
        <Button
          variant="plain"
          className="modal-close"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close"
        >
          <X size={18} />
        </Button>

        <span className="confirm-icon">
          <Truck size={22} />
        </span>

        <h2 id="supplier-modal-title">
          {isEdit ? "Edit Supplier" : "Add New Supplier"}
        </h2>
        <p>Manage vendor directory details, tax GSTIN, and contact information.</p>

        {errorMsg && <div className="confirm-error">{errorMsg}</div>}

        <form className="entity-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="full">
              Supplier / Company Name *
              <Input
                type="text"
                placeholder="e.g. Metro Bakery Supplies, Amul Distributors"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                autoFocus
              />
              <small className="muted">Registered business or trade name</small>
            </label>

            <label>
              Contact Person
              <Input
                type="text"
                placeholder="e.g. Rajesh Kumar"
                value={formData.contact_person}
                onChange={(e) => handleChange("contact_person", e.target.value)}
              />
              <small className="muted">Primary vendor contact</small>
            </label>

            <label>
              Phone Number
              <Input
                type="tel"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              <small className="muted">Direct phone or mobile</small>
            </label>

            <label>
              Email Address
              <Input
                type="email"
                placeholder="e.g. orders@metro.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              <small className="muted">Purchase order email</small>
            </label>

            <label>
              GSTIN (Optional)
              <Input
                type="text"
                placeholder="e.g. 07AAAAA0000A1Z5"
                value={formData.gstin}
                onChange={(e) => handleChange("gstin", e.target.value)}
              />
              <small className="muted">Tax identification number</small>
            </label>

            <label className="full">
              Address
              <Input
                type="text"
                placeholder="e.g. Shop 12, Food Market, Sector 18"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
              <small className="muted">Warehouse or office address</small>
            </label>

            <label>
              Status
              <Select
                value={formData.is_active ? "true" : "false"}
                onChange={(e) => handleChange("is_active", e.target.value === "true")}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
              <small className="muted">Active suppliers can be linked to ingredients</small>
            </label>

            <label className="full">
              Internal Notes (Optional)
              <textarea
                placeholder="Payment terms, delivery schedules, account numbers..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
              />
              <small className="muted">Visible only to admins</small>
            </label>
          </div>

          <div className="confirm-actions">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              loading={isLoading}
            >
              {isEdit ? "Save Changes" : "Create Supplier"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
