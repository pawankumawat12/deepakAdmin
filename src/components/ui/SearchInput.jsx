import { Search } from "lucide-react";
import Input from "./Input";

export default function SearchInput({ className = "", ...props }) {
  return (
    <label className={`search ${className}`.trim()}>
      <Search size={17} />
      <Input {...props} />
    </label>
  );
}
