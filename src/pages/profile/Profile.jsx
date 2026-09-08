import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  Camera,
  Upload,
  Trash2,
  Mail,
  ShieldCheck,
  UserRound,
  Phone,
  Save,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";
import { useUpdateProfileMutation } from "../../services/authApi";
import { setUser } from "../../context/authSlice";
import { toAssetUrl } from "../../utils/assetUrl";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function Profile() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [updateProfile] = useUpdateProfileMutation();

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const initials = user?.name?.slice(0, 2).toUpperCase() || "AD";

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPG, PNG, or WEBP).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", user?.name || name || "Administrator");
    if (user?.email) formData.append("email", user.email);
    if (user?.phone || phone) formData.append("phone", user?.phone || phone || "");

    try {
      setIsUploadingPhoto(true);
      const res = await updateProfile(formData).unwrap();
      if (res?.user) {
        dispatch(setUser(res.user));
      }
      toast.success(res?.message || "Profile image updated successfully!");
    } catch (err) {
      const msg =
        err?.data?.message ||
        (err?.data?.errors && Object.values(err.data.errors)[0]) ||
        "Failed to upload profile image.";
      toast.error(typeof msg === "string" ? msg : "Failed to upload image.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    const formData = new FormData();
    formData.append("remove_image", "true");
    formData.append("name", user?.name || name || "Administrator");
    if (user?.email) formData.append("email", user.email);
    if (user?.phone || phone) formData.append("phone", user?.phone || phone || "");

    try {
      setIsRemovingPhoto(true);
      const res = await updateProfile(formData).unwrap();
      if (res?.user) {
        dispatch(setUser(res.user));
      }
      toast.success("Profile photo removed successfully.");
      setShowRemoveConfirm(false);
    } catch (err) {
      const msg = err?.data?.message || "Failed to remove profile photo.";
      toast.error(typeof msg === "string" ? msg : "Failed to remove photo.");
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 3) {
      setNameError("Full name must be at least 3 characters.");
      return;
    }
    setNameError("");

    try {
      setIsSavingDetails(true);
      const res = await updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: user?.email,
      }).unwrap();

      if (res?.user) {
        dispatch(setUser(res.user));
      }
      toast.success(res?.message || "Profile details updated successfully!");
    } catch (err) {
      const msg =
        err?.data?.message ||
        (err?.data?.errors && Object.values(err.data.errors)[0]) ||
        "Failed to update profile details.";
      toast.error(typeof msg === "string" ? msg : "Failed to update profile.");
    } finally {
      setIsSavingDetails(false);
    }
  };

  return (
    <>
      <div className="section-head">
        <div>
          <h1>My profile</h1>
          <p>Manage your administrator account details and profile photo.</p>
        </div>
      </div>

      <section
        className="profile-page-card"
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid var(--line)",
          overflow: "hidden",
          boxShadow: "0 4px 20px -2px rgba(0,0,0,0.05)",
        }}
      >
        {/* Profile Image & Quick Actions Header */}
        <div
          style={{
            padding: "32px 28px",
            background: "linear-gradient(135deg, #f7f6fe 0%, #ffffff 100%)",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {/* Avatar Container with Camera Overlay */}
          <div style={{ position: "relative", width: "96px", height: "96px", flexShrink: 0 }}>
            {user?.image ? (
              <img
                src={toAssetUrl(user.image)}
                alt={user?.name || "Administrator"}
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #ffffff",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #8578ff, #5142dc)",
                  color: "#ffffff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "32px",
                  fontWeight: 700,
                  border: "3px solid #ffffff",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                }}
              >
                {initials}
              </div>
            )}

            {/* Camera Overlay Icon Badge */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              title="Change profile picture"
              style={{
                position: "absolute",
                bottom: "0",
                right: "0",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#4e42be",
                color: "#ffffff",
                border: "2px solid #ffffff",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                transition: "all 0.15s ease",
              }}
            >
              {isUploadingPhoto ? (
                <LoaderCircle size={15} className="spin animate-spin" />
              ) : (
                <Camera size={15} />
              )}
            </button>
          </div>

          {/* User Summary & Photo Actions */}
          <div style={{ flex: 1, minWidth: "220px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "var(--ink)" }}>
                {user?.name || "Administrator"}
              </h2>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  borderRadius: "16px",
                  padding: "3px 10px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#4e42be",
                  background: "var(--purple-soft)",
                  textTransform: "capitalize",
                }}
              >
                <ShieldCheck size={13} /> {user?.role || "admin"}
              </span>
            </div>
            <p style={{ margin: "4px 0 14px", color: "var(--muted)", fontSize: "13px" }}>
              {user?.email || "admin@example.com"}
            </p>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />

            {/* Photo Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                loading={isUploadingPhoto}
                style={{
                  fontSize: "12px",
                  height: "34px",
                  padding: "0 14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Upload size={13} />
                <span>{user?.image ? "Change Photo" : "Upload Photo"}</span>
              </Button>

              {user?.image && (
                <Button
                  variant="danger"
                  onClick={() => setShowRemoveConfirm(true)}
                  disabled={isUploadingPhoto}
                  style={{
                    fontSize: "12px",
                    height: "34px",
                    padding: "0 14px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Trash2 size={13} />
                  <span>Remove Photo</span>
                </Button>
              )}
            </div>
            <p style={{ margin: "8px 0 0", color: "#9ca3af", fontSize: "11px" }}>
              Supported: JPG, PNG, WEBP. Maximum file size: 5MB.
            </p>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveDetails} style={{ padding: "28px" }}>
          <h3
            style={{
              margin: "0 0 20px",
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--ink)",
              borderBottom: "1px solid var(--line)",
              paddingBottom: "12px",
            }}
          >
            Account Information
          </h3>

          <div style={{ display: "grid", gap: "20px" }}>
            {/* Full Name */}
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--muted)",
                  marginBottom: "6px",
                }}
              >
                <UserRound size={15} /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError("");
                }}
                placeholder="Enter your full name"
                style={{
                  width: "100%",
                  height: "42px",
                  borderRadius: "8px",
                  border: `1px solid ${nameError ? "#ef4444" : "#dedde6"}`,
                  padding: "0 14px",
                  fontSize: "13.5px",
                  color: "var(--ink)",
                  background: "#ffffff",
                  outline: "none",
                }}
              />
              {nameError && (
                <small style={{ color: "#ef4444", fontSize: "11.5px", marginTop: "4px", display: "block" }}>
                  {nameError}
                </small>
              )}
            </div>

            {/* Email Address (Read-only credential) */}
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--muted)",
                  marginBottom: "6px",
                }}
              >
                <Mail size={15} /> Email Address
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  readOnly
                  style={{
                    width: "100%",
                    height: "42px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    padding: "0 14px",
                    fontSize: "13.5px",
                    color: "#6b7280",
                    background: "#f9fafb",
                    cursor: "not-allowed",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#16a34a",
                  }}
                >
                  <CheckCircle2 size={13} /> Verified
                </span>
              </div>
              <small style={{ color: "#9ca3af", fontSize: "11px", marginTop: "4px", display: "block" }}>
                Email address serves as your primary admin login identity.
              </small>
            </div>

            {/* Phone Number */}
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--muted)",
                  marginBottom: "6px",
                }}
              >
                <Phone size={15} /> Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                style={{
                  width: "100%",
                  height: "42px",
                  borderRadius: "8px",
                  border: "1px solid #dedde6",
                  padding: "0 14px",
                  fontSize: "13.5px",
                  color: "var(--ink)",
                  background: "#ffffff",
                  outline: "none",
                }}
              />
            </div>

            {/* Role Badge */}
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--muted)",
                  marginBottom: "6px",
                }}
              >
                <ShieldCheck size={15} /> Assigned Role
              </label>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  background: "#f4f2ff",
                  color: "#4e42be",
                  fontSize: "13px",
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
              >
                <ShieldCheck size={16} />
                <span>{user?.role || "admin"}</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "12px",
              marginTop: "28px",
              paddingTop: "20px",
              borderTop: "1px solid var(--line)",
            }}
          >
            <Button
              type="submit"
              variant="primary"
              disabled={isSavingDetails || isUploadingPhoto}
              loading={isSavingDetails}
              style={{
                height: "40px",
                padding: "0 22px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              <Save size={15} />
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </section>

      {/* Confirmation Dialog for Removing Profile Photo */}
      {showRemoveConfirm && (
        <ConfirmDialog
          title="Remove profile photo?"
          message="Are you sure you want to remove your profile picture? Your account will revert to the default initials avatar."
          confirmLabel="Remove photo"
          danger={true}
          onConfirm={handleRemovePhoto}
          onClose={() => setShowRemoveConfirm(false)}
          isLoading={isRemovingPhoto}
        />
      )}
    </>
  );
}
