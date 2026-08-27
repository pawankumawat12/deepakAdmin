import { useState } from "react";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import {
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useMarkItemProducedMutation,
} from "../../services/orderApi";
import { Clock, CheckCircle2, Truck, XCircle, ChefHat, Sparkles } from "lucide-react";

export default function OrderList() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data: orderResponse, isLoading, error } = useGetAdminOrdersQuery(
    statusFilter ? { status: statusFilter } : {}
  );
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [markProduced, { isLoading: isMarking }] = useMarkItemProducedMutation();

  const orders = orderResponse?.data || [];

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateStatus({ id: orderId, status: newStatus }).unwrap();
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  const handleItemProduced = async (itemId) => {
    try {
      await markProduced({ itemId, productionStatus: "PRODUCED" }).unwrap();
    } catch (err) {
      console.error("Failed to mark item produced:", err);
    }
  };

    const rows = orders.map((order) => {
    const totalItems = (order.items || []).reduce((sum, it) => sum + it.quantity, 0);
    const hasMadeToOrder = (order.items || []).some(
      (it) => it.availability_type === "MADE_TO_ORDER"
    );
    const pendingProductionItems = (order.items || []).filter(
      (it) => it.availability_type === "MADE_TO_ORDER" && it.production_status === "PENDING_PRODUCTION"
    );
    // Determine delivery address display
    let deliveryAddress = order.shipping_address || "";
    if (order.delivery_address_json) {
      try {
        const addr = typeof order.delivery_address_json === "string" ? JSON.parse(order.delivery_address_json) : order.delivery_address_json;
        deliveryAddress = `${addr.house_number}, ${addr.formatted_address || `${addr.city} - ${addr.pincode}`}`;
      } catch {}
    }
    return {
      ...order,
      orderNumber: order.order_number || `#SFC-${order.id}`,
      customer: order.customer_name || "Customer",
      itemsSummary: `${totalItems} item(s)`,
      totalFormatted: `₹${Number(order.total_amount || 0).toLocaleString("en-IN")}`,
      createdAtFormatted: new Date(order.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        day: "numeric",
      }),
      hasMadeToOrder,
      pendingProductionItems,
      deliveryAddress,
    };
  });

  return (
    <>
      <div className="section-head">
        <div>
          <h1>Orders</h1>
          <p>Track and manage customer orders and kitchen fulfillment.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "160px" }}
          >
            <option value="">All Statuses</option>
            <option value="Preparing">Preparing</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      {error && (
        <p className="error">
          {error.data?.message || "Failed to load orders"}
        </p>
      )}

      <DataTable
        loading={isLoading}
        data={rows}
        emptyMessage="No orders found."
        columns={[
          {
            key: "orderNumber",
            label: "ORDER",
            render: (value, item) => (
              <div>
                <b>{value}</b>
                <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                  {item.payment_method}
                </div>
              </div>
            ),
          },
          {
            key: "customer",
            label: "CUSTOMER",
            render: (value, item) => (
              <div>
                <div>{value}</div>
                <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                  {item.customer_phone || item.customer_email || item.shipping_address}
                </div>
              </div>
            ),
          },
          {
            key: "itemsSummary",
            label: "ITEMS & PRODUCTION",
            render: (value, item) => (
              <div>
                <div>{value}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                  {(item.items || []).map((it) => (
                    <div
                      key={it.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11px",
                      }}
                    >
                      <span>
                        {it.quantity}x {it.product_name}
                      </span>
                      {it.availability_type === "MADE_TO_ORDER" && (
                        it.production_status === "PRODUCED" ? (
                          <span
                            style={{
                              background: "#dcfce7",
                              color: "#166534",
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "1px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            ✓ Produced
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isMarking}
                            onClick={() => handleItemProduced(it.id)}
                            style={{
                              background: "#ffedd5",
                              color: "#c2410c",
                              border: "1px solid #fdba74",
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "1px 6px",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                            title="Click to mark this made-to-order item as produced"
                          >
                            ⚡ Mark Produced
                          </button>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          { key: "totalFormatted", label: "TOTAL" },
          {
            key: "status",
            label: "STATUS",
            render: (value, item) => (
              <Select
                value={value}
                disabled={isUpdating}
                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                style={{
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  width: "140px",
                }}
              >
                <option value="Preparing">Preparing</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </Select>
            ),
          },
          { key: "createdAtFormatted", label: "TIME" },
        ]}
      />
    </>
  );
}
