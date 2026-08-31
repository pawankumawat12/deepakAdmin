import { useEffect, useRef, useState } from "react";
import DataTable from "../../components/common/DataTable";
import { useForm } from "react-hook-form";
import Button from "../../components/ui/Button";
import {
  useGetThemeQuery,
  useUpdateThemeMutation,
  useGetFooterQuery,
  useUpdateFooterMutation,
  useGetLogoQuery,
  useUpdateLogoMutation,
  useGetSettingPricingQuery,
  useUpdateSettingPricingMutation,
} from "../../services/settingsApi";
import {
  Palette,
  Sun,
  Moon,
  Check,
  Sparkles,
  RefreshCw,
  Sliders,
  Image,
  Upload,
  Phone,
  Mail,
  MapPin,
  Clock,
  Percent,
  Truck,
  ShoppingCart,
  Package,
  Banknote,
  CreditCard,
  ShoppingCartIcon,
  Receipt,
} from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"
).replace(/\/api\/v1$/, "");

const DEFAULT_FALLBACK_COLOR_THEMES = [
  {
    id: "matcha",
    name: "Matcha Green",
    color: "#7cb324",
    desc: "Organic matcha & fresh espresso green",
    accent: "#f0f7e6",
  },
  {
    id: "caramel",
    name: "Espresso Caramel",
    color: "#e86b1a",
    desc: "Warm roasted caramel and spiced amber",
    accent: "#fef3eb",
  },
  {
    id: "mocha",
    name: "Golden Mocha",
    color: "#f5a623",
    desc: "Golden honey, cocoa and rich crema",
    accent: "#fef8ed",
  },
  {
    id: "berry",
    name: "Velvet Berry",
    color: "#e11d48",
    desc: "Rich wild berry & velvet roast red",
    accent: "#fef1f2",
  },
];

const generalSettings = [
  {
    id: "se-1",
    setting: "Store status",
    value: "Open for orders",
    status: "Active",
  },
  { id: "se-2", setting: "Delivery radius", value: "8 km", status: "Active" },
  {
    id: "se-3",
    setting: "Ordering mode",
    value: "Dine-in / Delivery",
    status: "Active",
  },
];

/* ─── Reusable inline-style card ─── */
const cardStyle = {
  background: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #ececf3",
  padding: "24px",
  marginBottom: "28px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
};

const sectionLabel = {
  display: "block",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "#52526c",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #ececf3",
  fontSize: "14px",
  color: "#24243b",
  outline: "none",
  transition: "border 0.2s",
};

function StatusBanner({ text, type }) {
  if (!text) return null;
  return (
    <div
      style={{
        padding: "10px 16px",
        borderRadius: "10px",
        marginBottom: "18px",
        fontSize: "13px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: type === "success" ? "#ecfdf5" : "#fef2f2",
        color: type === "success" ? "#065f46" : "#991b1b",
        border: type === "success" ? "1px solid #a7f3d0" : "1px solid #fecaca",
      }}
    >
      {type === "success" ? <Check size={16} /> : <Sliders size={16} />}
      {text}
    </div>
  );
}

export default function Settings() {
  /* ─── THEME STATE ─── */
  const { data: themeResponse, isLoading, refetch } = useGetThemeQuery();
  const { data: priceSetting, isLoading: priceSettingLoading } =
    useGetSettingPricingQuery();
  const [updateOrderPricingSettings, { isLoading: pricingLoading }] =
    useUpdateSettingPricingMutation();
  const [updateTheme, { isLoading: isSaving }] = useUpdateThemeMutation();
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [selectedColor, setSelectedColor] = useState("matcha");
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });
  const [pricingStatus, setPricingStatus] = useState({ text: "", type: "" });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      gst_percent: "",
      tax_inclusive: false,
      delivery_charge_type: "fixed",
      delivery_charge_value: "",
      free_delivery_threshold: "",
      max_delivery_distance: "",
      packaging_fee: "",
      cod_fee: "",
      platform_fee: "",
      minimum_order_amount: "",
      store_latitude: "",
      store_longitude: "",
      discount_percent: "",
    },
  });

  const availableColorThemes =
    themeResponse?.data?.availableColorThemes &&
    themeResponse.data.availableColorThemes.length > 0
      ? themeResponse.data.availableColorThemes
      : DEFAULT_FALLBACK_COLOR_THEMES;

  useEffect(() => {
    if (priceSetting?.data) {
      reset({
        gst_percent: priceSetting.data.gst_percent ?? "",
        tax_inclusive: priceSetting.data.tax_inclusive ?? false,
        delivery_charge_type: priceSetting.data.delivery_charge_type ?? "fixed",
        delivery_charge_value: priceSetting.data.delivery_charge_value ?? "",
        free_delivery_threshold:
          priceSetting.data.free_delivery_threshold ?? "",
        max_delivery_distance: priceSetting.data.max_delivery_distance ?? "",
        packaging_fee: priceSetting.data.packaging_fee ?? "",
        cod_fee: priceSetting.data.cod_fee ?? "",
        platform_fee: priceSetting.data.platform_fee ?? "",
        minimum_order_amount: priceSetting.data.minimum_order_amount ?? "",
        store_latitude: priceSetting.data.store_latitude ?? "",
        store_longitude: priceSetting.data.store_longitude ?? "",
        discount_percent: priceSetting.data.discount_percent ?? "",
      });
    }
  }, [priceSetting, reset]);

  const onSubmitPricing = async (data) => {
    try {
      setPricingStatus({ text: "", type: "" });
      const payload = {
        gst_percent: Number(data.gst_percent),
        tax_inclusive: Boolean(data.tax_inclusive),

        delivery_charge_type: data.delivery_charge_type,
        delivery_charge_value: Number(data.delivery_charge_value),

        free_delivery_threshold: Number(data.free_delivery_threshold),
        max_delivery_distance: Number(data.max_delivery_distance),

        packaging_fee: Number(data.packaging_fee),
        cod_fee: Number(data.cod_fee),
        platform_fee: Number(data.platform_fee),

        minimum_order_amount: Number(data.minimum_order_amount),

        store_latitude: Number(data.store_latitude),
        store_longitude: Number(data.store_longitude),

        discount_percent: Number(data.discount_percent),
      };

      const response = await updateOrderPricingSettings(payload).unwrap();
      console.log("Order pricing updated:", response);
      setPricingStatus({
        text: "Order pricing settings saved successfully! Storefront cart and checkout calculations updated.",
        type: "success",
      });
      setTimeout(() => setPricingStatus({ text: "", type: "" }), 4000);
    } catch (error) {
      console.error("Failed to update order pricing:", error);
      setPricingStatus({
        text: error?.data?.message || "Failed to update order pricing settings",
        type: "error",
      });
    }
  };
  useEffect(() => {
    if (themeResponse?.data) {
      setSelectedTheme(themeResponse.data.theme || "light");
      setSelectedColor(themeResponse.data.colorTheme || "matcha");
    }
  }, [themeResponse]);

  const handleSaveTheme = async () => {
    try {
      setStatusMessage({ text: "", type: "" });
      await updateTheme({
        theme: selectedTheme,
        colorTheme: selectedColor,
      }).unwrap();
      setStatusMessage({
        text: "Store theme settings saved successfully! Storefront UI updated.",
        type: "success",
      });
      setTimeout(() => setStatusMessage({ text: "", type: "" }), 4000);
    } catch (err) {
      setStatusMessage({
        text: err?.data?.message || "Failed to update theme settings",
        type: "error",
      });
    }
  };

  const currentColorObj =
    availableColorThemes.find((c) => c.id === selectedColor) ||
    availableColorThemes[0] ||
    DEFAULT_FALLBACK_COLOR_THEMES[0];

  /* ─── LOGO STATE ─── */
  const { data: logoResponse, isLoading: logoLoading } = useGetLogoQuery();

  const [updateLogo, { isLoading: logoSaving }] = useUpdateLogoMutation();
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoStatus, setLogoStatus] = useState({ text: "", type: "" });
  const fileInputRef = useRef(null);

  const currentLogoUrl = logoResponse?.data?.logo_url
    ? `${API_ORIGIN}${logoResponse.data.logo_url}`
    : null;

  const handleLogoSelect = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      setLogoPreview(URL.createObjectURL(file));

      setLogoStatus({ text: "", type: "" });
      const formData = new FormData();
      formData.append("logo", file);
      await updateLogo(formData).unwrap();
      setLogoFile(null);
      setLogoPreview(null);
      setLogoStatus({ text: "Logo updated successfully!", type: "success" });
      setTimeout(() => setLogoStatus({ text: "", type: "" }), 4000);
    } catch (err) {
      setLogoStatus({
        text: err?.data?.message || "Failed to update logo",
        type: "error",
      });
    }
  };

  /* ─── FOOTER STATE ─── */
  const { data: footerResponse, isLoading: footerLoading } =
    useGetFooterQuery();
  const [updateFooter, { isLoading: footerSaving }] = useUpdateFooterMutation();
  const [footerForm, setFooterForm] = useState({
    phone_number: "",
    email: "",
    location: "",
    working_hours: "",
    instagram: "",
    facebook: "",
    twitter: "",
  });

  const [footerStatus, setFooterStatus] = useState({ text: "", type: "" });

  useEffect(() => {
    if (footerResponse?.data) {
      setFooterForm({
        phone_number: footerResponse.data.phone_number || "",
        email: footerResponse.data.email || "",
        location: footerResponse.data.location || "",
        working_hours: footerResponse.data.working_hours || "",
        instagram: footerResponse.data.instagram || "",
        facebook: footerResponse.data.facebook || "",
        twitter: footerResponse.data.twitter || "",
      });
    }
  }, [footerResponse]);

  const handleFooterChange = (field) => (e) =>
    setFooterForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSaveFooter = async () => {
    try {
      setFooterStatus({ text: "", type: "" });
      await updateFooter(footerForm).unwrap();
      setFooterStatus({
        text: "Footer settings saved successfully!",
        type: "success",
      });
      setTimeout(() => setFooterStatus({ text: "", type: "" }), 4000);
    } catch (err) {
      setFooterStatus({
        text: err?.data?.message || "Failed to update footer settings",
        type: "error",
      });
    }
  };

  /* ─── Footer form field config ─── */
  const footerFields = [
    {
      key: "phone_number",
      label: "Phone Number",
      icon: Phone,
      placeholder: "+91 98765 43210",
    },
    {
      key: "email",
      label: "Email",
      icon: Mail,
      placeholder: "hello@sfccafe.com",
    },
    {
      key: "location",
      label: "Location / Address",
      icon: MapPin,
      placeholder: "123 Main Street, Jaipur",
    },
    {
      key: "working_hours",
      label: "Working Hours",
      icon: Clock,
      placeholder: "Mon-Fri: 10AM-11PM",
    },
    {
      key: "instagram",
      label: "Instagram URL",
      icon: FaInstagram,
      placeholder: "https://instagram.com/sfccafe",
    },
    {
      key: "facebook",
      label: "Facebook URL",
      icon: FaFacebook,
      placeholder: "https://facebook.com/sfccafe",
    },
    {
      key: "twitter",
      label: "Twitter / X URL",
      icon: FaTwitter,
      placeholder: "https://x.com/sfccafe",
    },
  ];

  //order pricing
  const pricingFields = [
    {
      key: "gst_percent",
      label: "GST Percentage",
      icon: Percent,
      type: "number",
    },
    {
      key: "delivery_charge_value",
      label: "Delivery Charge / KM",
      icon: Truck,
      type: "number",
    },
    {
      key: "free_delivery_threshold",
      label: "Free Delivery Threshold",
      icon: ShoppingCart,
      type: "number",
    },
    {
      key: "max_delivery_distance",
      label: "Maximum Delivery Distance (KM)",
      icon: MapPin,
      type: "number",
    },
    {
      key: "packaging_fee",
      label: "Packaging Fee",
      icon: Package,
      type: "number",
    },
    {
      key: "cod_fee",
      label: "COD Fee",
      icon: Banknote,
      type: "number",
    },
    {
      key: "platform_fee",
      label: "Platform Fee",
      icon: CreditCard,
      type: "number",
    },
    {
      key: "minimum_order_amount",
      label: "Minimum Order Amount",
      icon: ShoppingCartIcon,
      type: "number",
    },
   
  ];

  return (
    <>
      <div className="section-head">
        <div>
          <h1>Settings</h1>
          <p>
            Configure storefront appearance, logo, footer details, and
            preferences.
          </p>
        </div>
      </div>

      <section style={cardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            borderBottom: "1px solid #f0f0f5",
            paddingBottom: "16px",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "#eef2ff",
              display: "grid",
              placeItems: "center",
              color: "#6366f1",
            }}
          >
            <Image size={22} />
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "17px",
                fontWeight: 700,
                color: "#24243b",
              }}
            >
              Site Logo
            </h2>
            <p style={{ margin: 0, fontSize: "12px", color: "#8b8ba0" }}>
              Upload and manage your storefront logo image.
            </p>
          </div>
        </div>

        <StatusBanner text={logoStatus.text} type={logoStatus.type} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          {/* Current / Preview */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "16px",
              border: "2px dashed #dcdbe8",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              background: "#fafafc",
            }}
          >
            {logoPreview || currentLogoUrl ? (
              <img
                src={logoPreview || currentLogoUrl}
                alt="Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: "8px",
                }}
              />
            ) : (
              <div style={{ textAlign: "center", color: "#8b8ba0" }}>
                <Image size={32} />
                <p style={{ fontSize: "11px", margin: "4px 0 0" }}>No logo</p>
              </div>
            )}
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleLogoSelect}
              style={{ display: "none" }}
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <Upload size={16} />
              Choose Logo
            </Button>
            <p style={{ fontSize: "11px", color: "#8b8ba0", margin: 0 }}>
              JPG, PNG or WEBP. Max 10 MB.
            </p>
          </div>
        </div>
      </section>

      <section style={cardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            borderBottom: "1px solid #f0f0f5",
            paddingBottom: "16px",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "#fef3c7",
              display: "grid",
              placeItems: "center",
              color: "#d97706",
            }}
          >
            <MapPin size={22} />
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "17px",
                fontWeight: 700,
                color: "#24243b",
              }}
            >
              Footer Details
            </h2>
            <p style={{ margin: 0, fontSize: "12px", color: "#8b8ba0" }}>
              Contact info, working hours, and social links displayed in the
              storefront footer.
            </p>
          </div>
        </div>

        <StatusBanner text={footerStatus.text} type={footerStatus.type} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "18px",
            marginBottom: "24px",
          }}
        >
          {footerFields.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key}>
              <label style={sectionLabel}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Icon size={14} />
                  {label}
                </span>
              </label>
              <input
                type="text"
                value={footerForm[key]}
                onChange={handleFooterChange(key)}
                placeholder={placeholder}
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="button"
            onClick={handleSaveFooter}
            disabled={footerSaving || footerLoading}
            style={{
              minWidth: "180px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {footerSaving ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={16} />
                Save Footer Settings
              </>
            )}
          </Button>
        </div>
      </section>

      <form onSubmit={handleSubmit(onSubmitPricing)}>
        <section className="card border-0 shadow-sm p-4">
          <div className="d-flex align-items-center gap-3 border-bottom pb-3 mb-4">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{
                width: "42px",
                height: "42px",
                background: "#dcfce7",
                color: "#16a34a",
              }}
            >
              <Receipt size={22} />
            </div>

            <div>
              <h2 className="mb-0 fs-6 fw-bold text-dark">
                Order Pricing Settings
              </h2>

              <p className="mb-0 small text-secondary">
                Configure GST, delivery charges, fees, order limits, and cafe
                location.
              </p>
            </div>
          </div>

          <StatusBanner text={pricingStatus.text} type={pricingStatus.type} />

          {/* Pricing Fields */}
          <div className="row g-4 mb-4">
            {pricingFields.map(
              ({ key, label, icon: Icon, placeholder, type }) => (
                <div className="col-12 col-md-6" key={key}>
                  <label className="form-label fw-semibold small text-dark d-flex align-items-center gap-2">
                    <Icon size={14} />
                    {label}
                  </label>

                  <input
                    type={type}
                    placeholder={placeholder}
                    className="form-control"
                    {...register(key)}
                  />
                </div>
              )
            )}
          </div>

          {/* Delivery & Tax */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold small text-dark d-flex align-items-center gap-2">
                <Truck size={14} />
                Delivery Charge Type
              </label>

              <select
                className="form-select"
                {...register("delivery_charge_type")}
              >
                <option value="fixed">Fixed</option>
                <option value="per_km">Per KM</option>
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold small text-dark d-flex align-items-center gap-2">
                <Receipt size={14} />
                Tax Inclusive
              </label>

              <select
                className="form-select"
                {...register("tax_inclusive", {
                  setValueAs: (value) => value === "true",
                })}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>

          {/* Cafe Location */}
          <div className="border-top pt-4 mb-4">
            <h3 className="fs-6 fw-bold text-dark mb-3">Cafe Location</h3>

            <div className="row g-4">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small text-dark d-flex align-items-center gap-2">
                  <MapPin size={14} />
                  Store Latitude
                </label>

                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="26.9124"
                  {...register("store_latitude", {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small text-dark d-flex align-items-center gap-2">
                  <MapPin size={14} />
                  Store Longitude
                </label>

                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="75.7873"
                  {...register("store_longitude", {
                    valueAsNumber: true,
                  })}
                />
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="d-flex justify-content-end">
            <Button
              type="submit"
              disabled={pricingLoading}
              className="d-flex align-items-center justify-content-center gap-2 px-4"
            >
              {pricingLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Saving Pricing...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Save Pricing Settings
                </>
              )}
            </Button>
          </div>
        </section>
      </form>

      <section style={cardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            borderBottom: "1px solid #f0f0f5",
            paddingBottom: "16px",
            marginBottom: "22px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: currentColorObj.accent,
                display: "grid",
                placeItems: "center",
                color: currentColorObj.color,
              }}
            >
              <Palette size={22} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#24243b",
                }}
              >
                Storefront Theme & Color Palette
              </h2>
              <p style={{ margin: 0, fontSize: "12px", color: "#8b8ba0" }}>
                Centrally control the visual appearance of the customer
                storefront.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            style={{
              background: "transparent",
              border: "1px solid #ececf3",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              color: "#6b6a80",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Sync
          </button>
        </div>

        <StatusBanner text={statusMessage.text} type={statusMessage.type} />

        {/* MODE SELECTOR */}
        <div style={{ marginBottom: "24px" }}>
          <label style={sectionLabel}>Theme Mode</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedTheme("light")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 18px",
                borderRadius: "12px",
                border:
                  selectedTheme === "light"
                    ? `2px solid ${currentColorObj.color}`
                    : "1px solid #ececf3",
                background: selectedTheme === "light" ? "#fafafc" : "#ffffff",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "#fef3c7",
                  display: "grid",
                  placeItems: "center",
                  color: "#d97706",
                }}
              >
                <Sun size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#24243b",
                  }}
                >
                  Light Mode
                </p>
                <span style={{ fontSize: "11px", color: "#8b8ba0" }}>
                  Clean, bright & airy
                </span>
              </div>
              {selectedTheme === "light" && (
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: currentColorObj.color,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Check size={13} strokeWidth={3} />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSelectedTheme("dark")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 18px",
                borderRadius: "12px",
                border:
                  selectedTheme === "dark"
                    ? `2px solid ${currentColorObj.color}`
                    : "1px solid #ececf3",
                background: selectedTheme === "dark" ? "#1e1e2d" : "#ffffff",
                color: selectedTheme === "dark" ? "#ffffff" : "#24243b",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "#312e81",
                  display: "grid",
                  placeItems: "center",
                  color: "#a5b4fc",
                }}
              >
                <Moon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    fontWeight: 700,
                    color: selectedTheme === "dark" ? "#ffffff" : "#24243b",
                  }}
                >
                  Dark Mode
                </p>
                <span
                  style={{
                    fontSize: "11px",
                    color: selectedTheme === "dark" ? "#a1a1aa" : "#8b8ba0",
                  }}
                >
                  Sleek & high-contrast
                </span>
              </div>
              {selectedTheme === "dark" && (
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: currentColorObj.color,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Check size={13} strokeWidth={3} />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* COLOR PALETTE SELECTOR */}
        <div style={{ marginBottom: "24px" }}>
          <label style={sectionLabel}>Cafe Color Palette</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
            }}
          >
            {availableColorThemes.map((themeOption) => {
              const isSelected = selectedColor === themeOption.id;
              return (
                <button
                  key={themeOption.id}
                  type="button"
                  onClick={() => setSelectedColor(themeOption.id)}
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    border: isSelected
                      ? `2px solid ${themeOption.color}`
                      : "1px solid #ececf3",
                    background: isSelected ? themeOption.accent : "#ffffff",
                    cursor: "pointer",
                    textAlign: "left",
                    position: "relative",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: themeOption.color,
                          boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                          display: "inline-block",
                        }}
                      />
                      <strong
                        style={{
                          fontSize: "14px",
                          color: "#24243b",
                        }}
                      >
                        {themeOption.name}
                      </strong>
                    </div>

                    {isSelected && (
                      <span
                        style={{
                          background: themeOption.color,
                          color: "#fff",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "11px",
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      color: "#6b6a80",
                      lineHeight: "1.4",
                    }}
                  >
                    {themeOption.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* LIVE PREVIEW BOX */}
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "14px",
            background: selectedTheme === "dark" ? "#1e1e2d" : "#fafafc",
            color: selectedTheme === "dark" ? "#ffffff" : "#24243b",
            border: "1px dashed #dcdbe8",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                backgroundColor: currentColorObj.color,
                display: "grid",
                placeItems: "center",
                color: "#fff",
              }}
            >
              <Sparkles size={16} />
            </span>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  fontWeight: 700,
                  color: selectedTheme === "dark" ? "#ffffff" : "#24243b",
                }}
              >
                Active Preview: {currentColorObj.name} (
                {selectedTheme.toUpperCase()})
              </p>
              <span
                style={{
                  fontSize: "11px",
                  color: selectedTheme === "dark" ? "#a1a1aa" : "#8b8ba0",
                }}
              >
                Storefront primary button & accents will render in{" "}
                {currentColorObj.color}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                background: currentColorObj.color,
                color: "#fff",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              Preview Button
            </span>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="button"
            onClick={handleSaveTheme}
            disabled={isSaving || isLoading}
            style={{
              minWidth: "160px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {isSaving ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={16} />
                Save Theme Settings
              </>
            )}
          </Button>
        </div>
      </section>
    </>
  );
}
