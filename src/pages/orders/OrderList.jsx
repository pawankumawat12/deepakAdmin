import { useState, useEffect } from "react";
import DataTable from "../../components/common/DataTable";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import {
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useMarkItemProducedMutation,
  useUpdateOrderPaymentStatusMutation,
  useAcceptOrderMutation,
  useRejectOrderMutation,
} from "../../services/orderApi";
import { getAdminSocket } from "../../services/socket";
import AdminOrderChatModal from "../../components/orders/AdminOrderChatModal";
import {
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChefHat,
  Sparkles,
  Receipt,
  MapPin,
  X,
  Eye,
  Percent,
  Package,
  CreditCard,
  Banknote,
  Check,
  MessageCircle,
  Bell,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
} from "lucide-react";

export default function OrderList() {
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [activeChatOrder, setActiveChatOrder] = useState(null);
  const [acceptModalOrder, setAcceptModalOrder] = useState(null);
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("Out of ingredients / unavailable");
  const [liveAlert, setLiveAlert] = useState(null);

  const {
    data: orderResponse,
    isLoading,
    error,
    refetch,
  } = useGetAdminOrdersQuery(
    statusFilter ? { status: statusFilter } : {}
  );
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [updatePaymentStatus, { isLoading: isUpdatingPayment }] =
    useUpdateOrderPaymentStatusMutation();
  const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();
  const [rejectOrder, { isLoading: isRejecting }] = useRejectOrderMutation();
  const [markProduced, { isLoading: isMarking }] = useMarkItemProducedMutation();

  const orders = orderResponse?.data || [];

  // Socket.IO real-time event listeners for Admin
  useEffect(() => {
    const socket = getAdminSocket();

    const handleNewOrder = (data) => {
      setLiveAlert({
        type: "order",
        title: "🔔 New Order Received!",
        message: `Order #${data.order?.order_number || data.order?.id} from ${data.order?.customer_name} (₹${data.order?.total_amount})`,
        order: data.order,
      });
      refetch();
    };

    const handleNewMessage = (data) => {
      setLiveAlert({
        type: "message",
        title: `💬 New Message on #${data.orderNumber}`,
        message: `${data.customerName}: "${data.message?.message?.substring(0, 50)}..."`,
        orderId: data.orderId,
      });
    };

    const handleOrderUpdated = () => {
      refetch();
    };

    socket.on("admin_new_order", handleNewOrder);
    socket.on("admin_new_message", handleNewMessage);
    socket.on("admin_order_updated", handleOrderUpdated);
    socket.on("admin_order_cancelled", handleOrderUpdated);

    return () => {
      socket.off("admin_new_order", handleNewOrder);
      socket.off("admin_new_message", handleNewMessage);
      socket.off("admin_order_updated", handleOrderUpdated);
      socket.off("admin_order_cancelled", handleOrderUpdated);
    };
  }, [refetch]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateStatus({ id: orderId, status: newStatus }).unwrap();
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      await updatePaymentStatus({ id: orderId, paymentStatus: newPaymentStatus }).unwrap();
      if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
        setSelectedOrderDetails((prev) => ({
          ...prev,
          payment_status: newPaymentStatus,
        }));
      }
    } catch (err) {
      console.error("Failed to update payment status:", err);
    }
  };

  const handleAcceptOrderSubmit = async () => {
    if (!acceptModalOrder) return;
    try {
      await acceptOrder({
        id: acceptModalOrder.id,
      }).unwrap();

      setAcceptModalOrder(null);
      refetch();
    } catch (err) {
      console.error("Failed to accept order:", err);
    }
  };

  const handleRejectOrderSubmit = async () => {
    if (!rejectModalOrder) return;
    try {
      await rejectOrder({
        id: rejectModalOrder.id,
        cancelReason: rejectReason,
      }).unwrap();

      setRejectModalOrder(null);
      refetch();
    } catch (err) {
      console.error("Failed to reject order:", err);
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
      (it) =>
        it.availability_type === "MADE_TO_ORDER" &&
        it.production_status === "PENDING_PRODUCTION"
    );

    // Determine delivery address display
    let deliveryAddress = order.shipping_address || "";
    let parsedAddress = null;
    if (order.delivery_address_json) {
      try {
        parsedAddress =
          typeof order.delivery_address_json === "string"
            ? JSON.parse(order.delivery_address_json)
            : order.delivery_address_json;
        deliveryAddress = `${parsedAddress.house_number || ""}, ${
          parsedAddress.formatted_address ||
          `${parsedAddress.city || ""} - ${parsedAddress.pincode || ""}`
        }`;
      } catch {}
    }

    let parsedPricing = null;
    if (order.pricing_details_json) {
      try {
        parsedPricing =
          typeof order.pricing_details_json === "string"
            ? JSON.parse(order.pricing_details_json)
            : order.pricing_details_json;
      } catch {}
    }

    let parsedPaymentDetails = null;
    if (order.payment_details_json) {
      try {
        parsedPaymentDetails =
          typeof order.payment_details_json === "string"
            ? JSON.parse(order.payment_details_json)
            : order.payment_details_json;
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
      parsedAddress,
      parsedPricing,
      parsedPaymentDetails,
    };
  });

  return (
    <>
      <div className="section-head">
        <div>
          <h1>Orders</h1>
          <p>Track and manage customer orders, payments, pricing breakdowns, and kitchen fulfillment.</p>
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

      {/* Live Socket.IO Notification Banner */}
      {liveAlert && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            borderRadius: "12px",
            backgroundColor:
              liveAlert.type === "order"
                ? "#dcfce7"
                : liveAlert.type === "payment"
                ? "#ede9fe"
                : "#eff6ff",
            border: `1px solid ${
              liveAlert.type === "order"
                ? "#86efac"
                : liveAlert.type === "payment"
                ? "#c4b5fd"
                : "#bfdbfe"
            }`,
            color:
              liveAlert.type === "order"
                ? "#166534"
                : liveAlert.type === "payment"
                ? "#5b21b6"
                : "#1e40af",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Bell size={18} />
            <div>
              <div style={{ fontWeight: 800, fontSize: "13px" }}>{liveAlert.title}</div>
              <div style={{ fontSize: "12px" }}>{liveAlert.message}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLiveAlert(null)}
            style={{
              border: "none",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

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
                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(item)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "4px",
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "2px 6px",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  <Receipt size={11} /> View Breakdown
                </button>
              </div>
            ),
          },
          {
            key: "customer",
            label: "CUSTOMER",
            render: (value, item) => (
              <div>
                <div style={{ fontWeight: 600 }}>{value}</div>
                <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                  {item.customer_phone || item.customer_email}
                </div>
                {item.deliveryAddress && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#6b7280",
                      marginTop: "2px",
                      maxWidth: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={item.deliveryAddress}
                  >
                    📍 {item.deliveryAddress}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "itemsSummary",
            label: "ITEMS & PRODUCTION",
            render: (value, item) => (
              <div>
                <div style={{ fontWeight: 600 }}>{value}</div>
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
          {
            key: "totalFormatted",
            label: "PRICING & TOTAL",
            render: (value, item) => {
              const p = item.parsedPricing || {};
              const subtotal = p.subtotal ?? item.subtotal;
              const deliveryFee = p.delivery_fee ?? item.delivery_fee;
              const taxAmount = p.tax_amount ?? item.tax_amount;
              const discount = p.discount ?? item.discount;

              return (
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}>
                    {value}
                  </div>
                  <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>
                    Subtotal: ₹{Number(subtotal || 0).toLocaleString("en-IN")}
                  </div>
                  {Number(deliveryFee || 0) > 0 ? (
                    <div style={{ fontSize: "10px", color: "#4b5563" }}>
                      Delivery: ₹{Number(deliveryFee).toLocaleString("en-IN")}
                    </div>
                  ) : (
                    <div style={{ fontSize: "10px", color: "#16a34a", fontWeight: 600 }}>
                      Free Delivery
                    </div>
                  )}
                  {Number(discount || 0) > 0 && (
                    <div style={{ fontSize: "10px", color: "#16a34a" }}>
                      Discount: -₹{Number(discount).toLocaleString("en-IN")}
                    </div>
                  )}
                  {Number(taxAmount || 0) > 0 && (
                    <div style={{ fontSize: "10px", color: "#6b7280" }}>
                      Tax: ₹{Number(taxAmount).toLocaleString("en-IN")}
                    </div>
                  )}
                </div>
              );
            },
          },
          {
            key: "payment_status",
            label: "PAYMENT",
            render: (value, item) => {
              const isOnline =
                item.payment_method &&
                !item.payment_method.toLowerCase().includes("cash") &&
                !item.payment_method.toLowerCase().includes("cod");
              const currentStatus = item.payment_status || "Pending";

              let statusBg = "#fef3c7";
              let statusColor = "#b45309";
              if (currentStatus === "Paid") {
                statusBg = "#dcfce7";
                statusColor = "#166534";
              } else if (currentStatus === "Failed") {
                statusBg = "#fee2e2";
                statusColor = "#b91c1c";
              } else if (currentStatus === "Pending Verification") {
                statusBg = "#ede9fe";
                statusColor = "#6d28d9";
              }

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {isOnline ? (
                      <QrCode size={12} color="#7c3aed" />
                    ) : (
                      <Banknote size={12} color="#16a34a" />
                    )}
                    <span>{item.payment_method || "COD"}</span>
                  </div>
                  {item.transaction_id && (
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#4b5563",
                        fontFamily: "monospace",
                        backgroundColor: "#f3f4f6",
                        padding: "1px 4px",
                        borderRadius: "4px",
                        maxWidth: "130px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={`UTR/Transaction ID: ${item.transaction_id}`}
                    >
                      UTR: {item.transaction_id}
                    </div>
                  )}
                  <Select
                    value={currentStatus}
                    disabled={isUpdatingPayment}
                    onChange={(e) => handlePaymentStatusChange(item.id, e.target.value)}
                    style={{
                      fontSize: "11px",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      fontWeight: 700,
                      backgroundColor: statusBg,
                      color: statusColor,
                      borderColor: "transparent",
                      width: "135px",
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </Select>
                </div>
              );
            },
          },
          {
            key: "status",
            label: "ORDER STATUS",
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
          {
            key: "actions",
            label: "VERIFICATION & CHAT",
            render: (_val, item) => (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {item.status === "Preparing" && (
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      type="button"
                      disabled={isAccepting}
                      onClick={() => setAcceptModalOrder(item)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 7px",
                        borderRadius: "6px",
                        border: "1px solid #86efac",
                        backgroundColor: "#dcfce7",
                        color: "#166534",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                      title="Accept order and confirm verification"
                    >
                      <ThumbsUp size={11} /> Accept
                    </button>
                    <button
                      type="button"
                      disabled={isRejecting}
                      onClick={() => setRejectModalOrder(item)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 7px",
                        borderRadius: "6px",
                        border: "1px solid #fca5a5",
                        backgroundColor: "#fee2e2",
                        color: "#991b1b",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                      title="Reject order and restore stock"
                    >
                      <ThumbsDown size={11} /> Reject
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setActiveChatOrder(item)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 7px",
                    borderRadius: "6px",
                    border: "1px solid #ddd6fe",
                    backgroundColor: "#f5f3ff",
                    color: "#6d28d9",
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <MessageCircle size={11} /> Chat
                </button>
              </div>
            ),
          },
          { key: "createdAtFormatted", label: "TIME" },
        ]}
      />

      {/* PRICING & ORDER DETAILS MODAL */}
      {selectedOrderDetails && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={() => setSelectedOrderDetails(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              maxWidth: "560px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#111827" }}>
                  Order Breakdown: {selectedOrderDetails.orderNumber}
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6b7280" }}>
                  Status: <b>{selectedOrderDetails.status}</b> • Payment: {selectedOrderDetails.payment_method}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                style={{
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Items Summary */}
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                Ordered Items
              </h3>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "12px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {(selectedOrderDetails.items || []).map((it) => (
                  <div
                    key={it.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "12px",
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700 }}>{it.quantity}x</span> {it.product_name}
                      {it.availability_type === "MADE_TO_ORDER" && (
                        <span
                          style={{
                            marginLeft: "6px",
                            fontSize: "10px",
                            backgroundColor: "#ffedd5",
                            color: "#c2410c",
                            padding: "1px 4px",
                            borderRadius: "4px",
                            fontWeight: 600,
                          }}
                        >
                          Made to order
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      ₹{Number(it.total || it.price * it.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Pricing Breakdown */}
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                Pricing Settings & Calculations
              </h3>
              {(() => {
                const p = selectedOrderDetails.parsedPricing || {};
                const subtotal = p.subtotal ?? selectedOrderDetails.subtotal ?? 0;
                const discount = p.discount ?? selectedOrderDetails.discount ?? 0;
                const discountPercent = p.discount_percent ?? 0;
                const deliveryFee = p.delivery_fee ?? selectedOrderDetails.delivery_fee ?? 0;
                const taxAmount = p.tax_amount ?? selectedOrderDetails.tax_amount ?? 0;
                const gstPercent = p.gst_percent ?? 5;
                const taxInclusive = p.tax_inclusive ?? selectedOrderDetails.tax_inclusive ?? false;
                const packagingFee = p.packaging_fee ?? selectedOrderDetails.packaging_fee ?? 0;
                const platformFee = p.platform_fee ?? selectedOrderDetails.platform_fee ?? 0;
                const codFee = p.cod_fee ?? selectedOrderDetails.cod_fee ?? 0;
                const distanceKm = p.distance_km ?? selectedOrderDetails.distance_km;
                const grandTotal = p.grand_total ?? selectedOrderDetails.total_amount ?? 0;

                return (
                  <div
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      fontSize: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#6b7280" }}>Item Subtotal</span>
                      <span style={{ fontWeight: 600 }}>₹{Number(subtotal).toLocaleString("en-IN")}</span>
                    </div>

                    {Number(discount) > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
                        <span>Discount {discountPercent > 0 ? `(${discountPercent}%)` : ""}</span>
                        <span style={{ fontWeight: 600 }}>- ₹{Number(discount).toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#6b7280" }}>
                        Delivery Charge {distanceKm ? `(${distanceKm} km)` : ""}
                      </span>
                      <span style={{ fontWeight: 600, color: deliveryFee === 0 ? "#16a34a" : "#111827" }}>
                        {deliveryFee === 0 ? "FREE" : `₹${Number(deliveryFee).toLocaleString("en-IN")}`}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#6b7280" }}>
                        GST ({gstPercent}%) {taxInclusive ? "(Inclusive)" : "(Added)"}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {taxInclusive ? `₹${Number(taxAmount).toLocaleString("en-IN")} (Incl)` : `+ ₹${Number(taxAmount).toLocaleString("en-IN")}`}
                      </span>
                    </div>

                    {Number(packagingFee) > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6b7280" }}>Packaging Fee</span>
                        <span style={{ fontWeight: 600 }}>₹{Number(packagingFee).toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    {Number(platformFee) > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6b7280" }}>Platform Fee</span>
                        <span style={{ fontWeight: 600 }}>₹{Number(platformFee).toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    {Number(codFee) > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#6b7280" }}>COD Handling Fee</span>
                        <span style={{ fontWeight: 600 }}>₹{Number(codFee).toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    <div
                      style={{
                        borderTop: "1px dashed #d1d5db",
                        paddingTop: "8px",
                        marginTop: "4px",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "#111827",
                      }}
                    >
                      <span>Final Order Total</span>
                      <span>₹{Number(grandTotal).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Payment Information & Verification */}
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                Payment Information & Verification
              </h3>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#6b7280" }}>Payment Method</span>
                  <span style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                    <Banknote size={14} color="#16a34a" />
                    {selectedOrderDetails.payment_method || "Cash on Delivery"}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#6b7280" }}>Payment Status</span>
                  <Select
                    value={selectedOrderDetails.payment_status || "Pending"}
                    disabled={isUpdatingPayment}
                    onChange={(e) => handlePaymentStatusChange(selectedOrderDetails.id, e.target.value)}
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      width: "160px",
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Delivery Address Snapshot */}
            <div>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>
                Delivery Address Snapshot
              </h3>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "12px",
                  padding: "12px",
                  fontSize: "12px",
                  color: "#4b5563",
                  lineHeight: "1.6",
                }}
              >
                {selectedOrderDetails.parsedAddress ? (
                  <>
                    <div style={{ fontWeight: 700, color: "#111827" }}>
                      {selectedOrderDetails.parsedAddress.receiver_name} ({selectedOrderDetails.parsedAddress.phone_number})
                    </div>
                    <div>
                      {selectedOrderDetails.parsedAddress.house_number}
                      {selectedOrderDetails.parsedAddress.building_name ? `, ${selectedOrderDetails.parsedAddress.building_name}` : ""}
                      {selectedOrderDetails.parsedAddress.floor ? `, Floor ${selectedOrderDetails.parsedAddress.floor}` : ""}
                      {selectedOrderDetails.parsedAddress.landmark ? `, Near ${selectedOrderDetails.parsedAddress.landmark}` : ""}
                    </div>
                    <div>
                      {selectedOrderDetails.parsedAddress.formatted_address || `${selectedOrderDetails.parsedAddress.city}, ${selectedOrderDetails.parsedAddress.state} - ${selectedOrderDetails.parsedAddress.pincode}`}
                    </div>
                    {selectedOrderDetails.parsedAddress.latitude != null && (
                      <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>
                        GPS: {selectedOrderDetails.parsedAddress.latitude}, {selectedOrderDetails.parsedAddress.longitude}
                      </div>
                    )}
                  </>
                ) : (
                  <div>{selectedOrderDetails.shipping_address || "No address details available"}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACCEPT ORDER CONFIRMATION MODAL */}
      {acceptModalOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={() => setAcceptModalOrder(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              maxWidth: "460px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "8px", borderRadius: "12px", backgroundColor: "#dcfce7", color: "#166534" }}>
                  <ThumbsUp size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, margin: 0, color: "#111827" }}>
                    Accept & Confirm Order
                  </h3>
                  <p style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0 0" }}>
                    Order #{acceptModalOrder.order_number || acceptModalOrder.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAcceptModalOrder(null)}
                style={{ border: "none", background: "transparent", color: "#6b7280", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ backgroundColor: "#f9fafb", borderRadius: "12px", padding: "14px", marginBottom: "16px", fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Customer</span>
                <span style={{ fontWeight: 700 }}>{acceptModalOrder.customer_name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Total Amount</span>
                <span style={{ fontWeight: 800, color: "#111827" }}>₹{Number(acceptModalOrder.total_amount || 0).toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Payment Method</span>
                <span style={{ fontWeight: 600 }}>{acceptModalOrder.payment_method || "Cash on Delivery"}</span>
              </div>
            </div>

            <p style={{ fontSize: "11px", color: "#6b7280", margin: "0 0 20px 0", lineHeight: 1.5 }}>
              Accepting will notify the customer in real-time that their food preparation has started.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setAcceptModalOrder(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#4b5563",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isAccepting}
                onClick={handleAcceptOrderSubmit}
                style={{
                  padding: "8px 20px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#166534",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: isAccepting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 6px -1px rgba(22, 101, 52, 0.2)",
                }}
              >
                <ThumbsUp size={14} />
                <span>{isAccepting ? "Accepting..." : "Confirm & Accept"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT ORDER MODAL */}
      {rejectModalOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={() => setRejectModalOrder(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              maxWidth: "460px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "8px", borderRadius: "12px", backgroundColor: "#fee2e2", color: "#991b1b" }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 800, margin: 0, color: "#111827" }}>
                    Reject Order
                  </h3>
                  <p style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0 0" }}>
                    Order #{rejectModalOrder.order_number || rejectModalOrder.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                style={{ border: "none", background: "transparent", color: "#6b7280", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
                Reason for Cancellation:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  padding: "10px",
                  fontSize: "12px",
                  outline: "none",
                  fontFamily: "inherit",
                }}
                placeholder="Specify reason to be sent to customer..."
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                {[
                  "Out of ingredients / unavailable",
                  "Kitchen overloaded / high demand",
                  "Address outside delivery radius",
                  "Customer unreachable",
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectReason(reason)}
                    style={{
                      fontSize: "10px",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#f9fafb",
                      color: "#4b5563",
                      cursor: "pointer",
                    }}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <p style={{ fontSize: "11px", color: "#dc2626", margin: "0 0 20px 0" }}>
              ⚠️ Rejecting this order will restore reserved product stock and notify the customer instantly.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#4b5563",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRejecting || !rejectReason.trim()}
                onClick={handleRejectOrderSubmit}
                style={{
                  padding: "8px 20px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: isRejecting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 6px -1px rgba(220, 38, 38, 0.2)",
                }}
              >
                <ThumbsDown size={14} />
                <span>{isRejecting ? "Rejecting..." : "Decline & Restore Stock"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PER-ORDER CHAT MODAL */}
      {activeChatOrder && (
        <AdminOrderChatModal
          order={activeChatOrder}
          onClose={() => setActiveChatOrder(null)}
        />
      )}
    </>
  );
}

