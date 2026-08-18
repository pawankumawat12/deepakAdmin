import DataTable from "../../components/common/DataTable";
const customers = [
  {
    id: "cu-1",
    name: "Priya Sharma",
    email: "priya@example.com",
    orders: 12,
    total: "₹4,820",
  },
  {
    id: "cu-2",
    name: "Rohan Mehta",
    email: "rohan@example.com",
    orders: 8,
    total: "₹2,940",
  },
];
export default function CustomerList() {
  return (
    <>
      <div className="section-head">
        <div>
          <h1>Customers</h1>
          <p>View and understand your customer community.</p>
        </div>
      </div>
      <DataTable
        data={customers}
        columns={[
          { key: "name", label: "NAME" },
          { key: "email", label: "EMAIL" },
          { key: "orders", label: "ORDERS" },
          { key: "total", label: "TOTAL SPENT" },
        ]}
      />
    </>
  );
}
