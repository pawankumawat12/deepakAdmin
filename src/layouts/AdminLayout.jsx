import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { signOut } from "../context/authSlice";
import { useLogoutMutation } from "../services/authApi";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Button from "../components/ui/Button";
import SearchInput from "../components/ui/SearchInput";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Users,
  BadgePercent,
  Star,
  MessageSquare,
  Mail,
  Heart,
  Settings,
  UserRound,
  LogOut,
  Menu,
  X,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
} from "lucide-react";
import { baseApi } from "../services/baseApi";
import {
  useGetAdminNotificationsQuery,
  useGetAdminUnreadCountQuery,
  useMarkAdminNotificationReadMutation,
  useMarkAllAdminNotificationsReadMutation,
} from "../services/notificationApi";
import { getAdminSocket } from "../services/socket";
import { toAssetUrl } from "../utils/assetUrl";

const navigation = [
  ["Dashboard", "/", LayoutDashboard],
  ["Customers", "/customers", Users],
  ["Products", "/products", Package],
  ["Categories", "/categories", Tags],
  ["Orders", "/orders", ShoppingBag],
  ["Offers", "/offers", BadgePercent],
  ["Reviews", "/reviews", Star],
  ["Messages", "/messages", MessageSquare],
  ["Email Logs", "/email-logs", Mail],
  ["Settings", "/settings", Settings],
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const notifRef = useRef(null);

  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutRequest, { isLoading: isSigningOut }] = useLogoutMutation();
  const location = useLocation();

  const title =
    navigation.find((item) => item[1] === location.pathname)?.[0] ||
    "Admin panel";

  // Notifications API & Mutations
  const { data: notifData, refetch: refetchNotifs } = useGetAdminNotificationsQuery({
    limit: 15,
  });
  const { data: unreadCountData, refetch: refetchUnreadCount } = useGetAdminUnreadCountQuery();

  const [markAsRead] = useMarkAdminNotificationReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAdminNotificationsReadMutation();

  const notifications = notifData?.data?.notifications || [];
  const unreadCount = unreadCountData?.data?.unreadCount ?? (notifData?.data?.unreadCount || 0);

  // Real-Time Socket.IO Notification Listener
  useEffect(() => {
    const socket = getAdminSocket();

    const handleNewNotification = (notif) => {
      console.log("[Socket.IO Admin] New notification received:", notif);
      refetchNotifs();
      refetchUnreadCount();
      toast.custom(
        (t) => (
          <div
            style={{
              background: "#1e293b",
              color: "#ffffff",
              padding: "12px 16px",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              maxWidth: "360px",
            }}
            onClick={() => {
              toast.dismiss(t.id);
              if (notif.type === "chat_message" && notif.order_id) {
                navigate("/orders", { state: { openChatOrderId: notif.order_id } });
              } else if (notif.order_id) {
                navigate("/orders");
              } else if (notif.type === "contact_inquiry") {
                navigate("/messages");
              } else if (notif.type === "new_review") {
                navigate("/reviews");
              } else if (notif.type === "customer_unblock_request") {
                navigate("/customers");
              }
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#4f7d16",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Bell size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "12px" }}>{notif.title}</div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {notif.message}
              </div>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
    };

    const handleUnreadCount = () => {
      refetchUnreadCount();
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:unread_count", handleUnreadCount);
    socket.on("new_order", () => {
      refetchNotifs();
      refetchUnreadCount();
    });

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:unread_count", handleUnreadCount);
    };
  }, [refetchNotifs, refetchUnreadCount, navigate]);

  // Click outside to close notification panel
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await markAsRead(notif.id).unwrap();
      } catch {}
    }

    setNotificationsOpen(false);

    if (notif.type === "chat_message" && notif.order_id) {
      // Navigate to orders page and auto-open the chat modal for this order
      navigate("/orders", { state: { openChatOrderId: notif.order_id } });
    } else if (notif.order_id || notif.type === "order" || notif.type === "new_order") {
      navigate("/orders");
    } else if (notif.type === "contact_inquiry") {
      navigate("/messages");
    } else if (notif.type === "new_review") {
      navigate("/reviews");
    } else if (notif.type === "customer_unblock_request") {
      navigate("/customers");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  const logout = async () => {
    try {
      setSignOutError("");
      await logoutRequest().unwrap();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      dispatch(signOut());
      dispatch(baseApi.util.resetApiState());
      setShowSignOut(false);
      setProfileOpen(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <img src="/images/logo.png" style={{ width: "40px" }} alt="SFC Cafe" />
          <Button variant="plain" className="close-nav" onClick={() => setOpen(false)}>
            <X />
          </Button>
        </div>
        <nav>
          {navigation.map(([label, to, Icon]) => (
            <NavLink
              end={to === "/"}
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="nav-link"
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-help">
          <p>Need help?</p>
          <span>Reach your support team</span>
          <Button>Contact support</Button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <Button variant="plain" className="mobile-menu" onClick={() => setOpen(true)}>
            <Menu />
          </Button>
          <div>
            <p className="eyebrow">ADMINISTRATION</p>
            <h2>{title}</h2>
          </div>
          <div className="top-actions">
            <SearchInput placeholder="Search anything..." />

            {/* Notification Bell with Badge & Dropdown */}
            <div style={{ position: "relative" }} ref={notifRef}>
              <Button
                variant="plain"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                title="Notifications"
                style={{
                  position: "relative",
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  background: notificationsOpen ? "#f4f8ec" : "#ffffff",
                  color: notificationsOpen ? "#4f7d16" : "#374151",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-4px",
                      background: "#ef4444",
                      color: "#ffffff",
                      fontSize: "10px",
                      fontWeight: 800,
                      minWidth: "18px",
                      height: "18px",
                      borderRadius: "9999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                      border: "2px solid #ffffff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>

              {/* Notification Dropdown Panel */}
              {notificationsOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "48px",
                    width: "360px",
                    maxWidth: "calc(100vw - 32px)",
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
                    zIndex: 1100,
                    overflow: "hidden",
                  }}
                >
                  {/* Dropdown Header */}
                  <div
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: 800, fontSize: "14px", color: "#111827" }}>
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span
                          style={{
                            background: "#fee2e2",
                            color: "#dc2626",
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: "9999px",
                          }}
                        >
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <Button
                        variant="text"
                        onClick={handleMarkAllRead}
                        disabled={isMarkingAll}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#4f7d16",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        <CheckCheck size={13} />
                        <span>Mark all read</span>
                      </Button>
                    )}
                  </div>

                  {/* Notification Items List */}
                  <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div
                        style={{
                          padding: "36px 16px",
                          textAlign: "center",
                          color: "#9ca3af",
                          fontSize: "12.5px",
                        }}
                      >
                        <Bell size={28} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
                        <p style={{ margin: 0, fontWeight: 600 }}>No notifications yet</p>
                        <p style={{ margin: "4px 0 0", fontSize: "11px" }}>
                          New orders, customer inquiries, and reviews will appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #f8fafc",
                            background: notif.is_read ? "#ffffff" : "#fbfdf8",
                            cursor: "pointer",
                            transition: "background 0.15s ease",
                            display: "flex",
                            gap: "10px",
                            alignItems: "flex-start",
                          }}
                        >
                          {!notif.is_read && (
                            <span
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: "#4f7d16",
                                marginTop: "6px",
                                flexShrink: 0,
                              }}
                            />
                          )}

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: notif.is_read ? 600 : 800,
                                fontSize: "12.5px",
                                color: "#1f2937",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {notif.title}
                            </div>
                            <div
                              style={{
                                fontSize: "11.5px",
                                color: "#6b7280",
                                marginTop: "2px",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {notif.message}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "10px",
                                color: "#9ca3af",
                                marginTop: "4px",
                              }}
                            >
                              <Clock size={10} />
                              <span>{new Date(notif.created_at).toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="profile-wrap">
              <Button
                variant="plain"
                className="profile"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
              >
                {user?.image ? (
                  <img
                    src={toAssetUrl(user.image)}
                    alt={user.name || "Admin"}
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #e5e7eb",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <span>{user?.name?.slice(0, 2).toUpperCase() || "AD"}</span>
                )}
                <div>
                  <strong>{user?.name}</strong>
                  <small>{user?.role}</small>
                </div>
                <ChevronDown size={16} />
              </Button>
              {profileOpen && (
                <div className="profile-menu">
                  <Button
                    variant="plain"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                  >
                    <UserRound size={16} /> My profile
                  </Button>
                  <Button
                    variant="plain"
                    onClick={() => {
                      setSignOutError("");
                      setProfileOpen(false);
                      setShowSignOut(true);
                    }}
                  >
                    <LogOut size={16} /> Sign out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>

      {showSignOut && (
        <ConfirmDialog
          title="Sign out?"
          message="Are you sure you want to sign out of the admin panel?"
          confirmLabel="Sign out"
          onConfirm={logout}
          onClose={() => setShowSignOut(false)}
          isLoading={isSigningOut}
          error={signOutError}
        />
      )}
    </div>
  );
}
