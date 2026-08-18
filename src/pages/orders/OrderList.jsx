import DataTable from "../../components/common/DataTable";

const orders = [
  {
    id: "#DF-2084",
    customer: "Priya Sharma",
    items: "3 items",
    total: "₹740",
    status: "Preparing",
    time: "2 min ago",
  },
  {
    id: "#DF-2083",
    customer: "Rohan Mehta",
    items: "1 item",
    total: "₹280",
    status: "Delivered",
    time: "16 min ago",
  },
  {
    id: "#DF-2082",
    customer: "Ananya Iyer",
    items: "5 items",
    total: "₹1,120",
    status: "Out for delivery",
    time: "32 min ago",
  },
];

export default function OrderList() {
  return (
    <>
      <div className="section-head">
        <div>
          <h1>Orders</h1>
          <p>Track and manage every order from your storefront.</p>
        </div>
      </div>
      <DataTable
        data={orders}
        columns={[
          { key: "id", label: "ORDER" },
          { key: "customer", label: "CUSTOMER" },
          { key: "items", label: "ITEMS" },
          { key: "total", label: "TOTAL" },
          { key: "status", label: "STATUS" },
          { key: "time", label: "TIME" },
        ]}
      />
    </>
  );
}
