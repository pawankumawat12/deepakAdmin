import { forwardRef } from "react";

const variantClass = {
  primary: "primary-btn",
  outline: "outline-btn",
  text: "text-btn",
  icon: "icon-btn",
  plain: "dots",
};

const Button = forwardRef(function Button(
  { variant = "primary", className = "", type = "button", children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${variantClass[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
