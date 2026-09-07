import { forwardRef } from "react";
import { LoaderCircle } from "lucide-react";

const variantClass = {
  primary: "primary-btn",
  outline: "outline-btn",
  danger: "danger-btn",
  text: "text-btn",
  icon: "icon-btn",
  plain: "dots",
  action: "action-btn",
  edit: "action-btn action-btn-edit",
  delete: "action-btn action-btn-delete",
  view: "action-btn action-btn-view",
};

const Button = forwardRef(function Button(
  {
    variant = "primary",
    className = "",
    type = "button",
    children,
    disabled = false,
    loading = false,
    ...props
  },
  ref
) {
  const vClass = variantClass[variant] || "";
  return (
    <button
      ref={ref}
      type={type}
      className={`${vClass} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircle size={15} className="spin animate-spin" />}
      {children}
    </button>
  );
});

export default Button;
