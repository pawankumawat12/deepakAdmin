import DataTable from "../../components/common/DataTable";
import { useGetCustomersQuery } from "../../services/authApi";
import { LoaderCircle, Users } from "lucide-react";

export default function CustomerList() {
  const { data, isLoading, isError } = useGetCustomersQuery(undefined, {
    refetchOnFocus: true,
  });

  const rawCustomers = data?.data || [];

  const formattedCustomers = rawCustomers.map((c) => ({
    id: `cu-${c.id}`,
    name: c.name || "Customer",
    email: c.email || "-",
    phone: c.phone || "-",
    orders: Number(c.orders_count || 0),
    total: `₹${Number(c.total_spent || 0).toLocaleString("en-IN")}`,
    joined: new Date(c.created_at).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  }));

  return (
    <>
      <div className="section-head">
        <div>
          <h1>Customers</h1>
          <p>View and understand your customer community ({formattedCustomers.length} registered).</p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px", color: "#6b7280", gap: "8px" }}>
          <LoaderCircle size={20} className="animate-spin" />
          <span>Loading customers...</span>
        </div>
      ) : isError ? (
        <div style={{ padding: "24px", textAlign: "center", color: "#dc2626" }}>
          Failed to load customers list.
        </div>
      ) : formattedCustomers.length === 0 ? (
        <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
          <Users size={32} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
          <p style={{ fontWeight: 600 }}>No registered customers yet.</p>
        </div>
      ) : (
        <DataTable
          data={formattedCustomers}
          columns={[
            { key: "name", label: "NAME" },
            { key: "email", label: "EMAIL" },
            { key: "phone", label: "PHONE" },
            { key: "orders", label: "ORDERS" },
            { key: "total", label: "TOTAL SPENT" },
            { key: "joined", label: "JOINED" },
          ]}
        />
      )}
    </>
  );
}
