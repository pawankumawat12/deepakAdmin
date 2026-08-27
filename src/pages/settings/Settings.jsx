import { useEffect, useState } from "react";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/ui/Button";
import {
  useGetThemeQuery,
  useUpdateThemeMutation,
} from "../../services/settingsApi";
import {
  Palette,
  Sun,
  Moon,
  Check,
  Sparkles,
  RefreshCw,
  Sliders,
} from "lucide-react";

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
  { id: "se-3", setting: "Ordering mode", value: "Dine-in / Delivery", status: "Active" },
];

export default function Settings() {
  const { data: themeResponse, isLoading, refetch } = useGetThemeQuery();
  const [updateTheme, { isLoading: isSaving }] = useUpdateThemeMutation();

  const [selectedTheme, setSelectedTheme] = useState("light");
  const [selectedColor, setSelectedColor] = useState("matcha");
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" });

  const availableColorThemes =
    themeResponse?.data?.availableColorThemes &&
    themeResponse.data.availableColorThemes.length > 0
      ? themeResponse.data.availableColorThemes
      : DEFAULT_FALLBACK_COLOR_THEMES;

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

  return (
    <>
      <div className="section-head">
        <div>
          <h1>Settings</h1>
          <p>Configure storefront appearance, theme palette, and preferences.</p>
        </div>
      </div>

      {/* THEME MANAGEMENT CARD */}
      <section
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #ececf3",
          padding: "24px",
          marginBottom: "28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        }}
      >
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
                Centrally control the visual appearance of the customer storefront.
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

        {statusMessage.text && (
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
              backgroundColor:
                statusMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
              color:
                statusMessage.type === "success" ? "#065f46" : "#991b1b",
              border:
                statusMessage.type === "success"
                  ? "1px solid #a7f3d0"
                  : "1px solid #fecaca",
            }}
          >
            {statusMessage.type === "success" ? (
              <Check size={16} />
            ) : (
              <Sliders size={16} />
            )}
            {statusMessage.text}
          </div>
        )}

        {/* MODE SELECTOR */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#52526c",
              marginBottom: "10px",
            }}
          >
            Theme Mode
          </label>
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
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#52526c",
              marginBottom: "10px",
            }}
          >
            Cafe Color Palette
          </label>
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
                Active Preview: {currentColorObj.name} ({selectedTheme.toUpperCase()})
              </p>
              <span
                style={{
                  fontSize: "11px",
                  color: selectedTheme === "dark" ? "#a1a1aa" : "#8b8ba0",
                }}
              >
                Storefront primary button & accents will render in {currentColorObj.color}
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

      {/* GENERAL STORE SETTINGS */}
      <h2
        style={{
          fontSize: "16px",
          fontWeight: 700,
          color: "#24243b",
          marginBottom: "12px",
        }}
      >
        General Store Configurations
      </h2>
      <DataTable
        data={generalSettings}
        columns={[
          { key: "setting", label: "SETTING" },
          { key: "value", label: "VALUE" },
          { key: "status", label: "STATUS" },
        ]}
      />
    </>
  );
}
