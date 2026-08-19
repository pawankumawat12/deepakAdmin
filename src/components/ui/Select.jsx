import { forwardRef } from "react";

const Select = forwardRef(function Select(
  { className = "", children, ...props },
  ref
) {
  return (
    <select ref={ref} className={`ui-select ${className}`.trim()} {...props}>
      {children}
    </select>
  );
});

export default Select;
