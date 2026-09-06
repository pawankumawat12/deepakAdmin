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
  FileText,
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
  SlidersHorizontal,
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

const navigationItems = [
  { type: "link", label: "Dashboard", to: "/", icon: LayoutDashboard },
  {
    type: "group",
    id: "catalog",
    label: "Menu & Catalog",
    icon: Package,
    children: [
      { label: "Products", to: "/products", icon: Package },
      { label: "Categories", to: "/categories", icon: Tags },
    ],
  },
  {
    type: "group",
    id: "storefront",
    label: "Storefront Display",
    icon: SlidersHorizontal,
    children: [{ label: "Hero Sliders", to: "/hero-sliders", icon: SlidersHorizontal }],
  },
  {
    type: "group",
    id: "sales",
    label: "Orders & Deals",
    icon: ShoppingBag,
    children: [
      { label: "All Orders", to: "/orders", icon: ShoppingBag },
      { label: "Offers & Deals", to: "/offers", icon: BadgePercent },
    ],
  },
  {
    type: "group",
    id: "customers",
    label: "Customers & CRM",
    icon: Users,
    children: [
      { label: "Customer Accounts", to: "/customers", icon: Users },
      { label: "Customer Reviews", to: "/reviews", icon: Star },
      { label: "Contact Messages", to: "/messages", icon: MessageSquare },
    ],
  },
  {
    type: "group",
    id: "email",
    label: "Email Management",
    icon: Mail,
    children: [
      { label: "Email Templates", to: "/email-templates", icon: FileText },
      { label: "Email Activity Logs", to: "/email-logs", icon: Mail },
    ],
  },
  {
    type: "group",
    id: "system",
    label: "System & Settings",
    icon: Settings,
    children: [
      { label: "General Settings", to: "/settings", icon: Settings },
      { label: "Admin Profile", to: "/profile", icon: UserRound },
      { label: "Favourites", to: "/favourites", icon: Heart },
    ],
  },
];

const getPageTitle = (pathname) => {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/products/create")) return "Add Product";
  if (pathname.startsWith("/products") && pathname.includes("/edit")) return "Edit Product";
  if (pathname.startsWith("/products")) return "Products";
  if (pathname.startsWith("/categories/create")) return "Add Category";
  if (pathname.startsWith("/categories") && pathname.includes("/edit")) return "Edit Category";
  if (pathname.startsWith("/categories")) return "Categories";
  if (pathname.startsWith("/orders")) return "Orders";
  if (pathname.startsWith("/customers")) return "Customers";
  if (pathname.startsWith("/offers")) return "Offers";
  if (pathname.startsWith("/reviews")) return "Reviews";
  if (pathname.startsWith("/messages")) return "Messages";
  if (pathname.startsWith("/hero-sliders")) return "Hero Sliders";
  if (pathname.startsWith("/email-logs")) return "Email Logs";
  if (pathname.startsWith("/email-templates/create")) return "Create Email Template";
  if (pathname.startsWith("/email-templates") && pathname.includes("/edit")) return "Edit Email Template";
  if (pathname.startsWith("/email-templates")) return "Email Templates";
  if (pathname.startsWith("/favourites")) return "Favourites";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/profile")) return "Profile";
  return "Administration";
};

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

  const isChildActive = (to) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  const isGroupActive = (children) => {
    return children.some((child) => isChildActive(child.to));
  };

  const activeParentId = navigationItems.find(
    (item) => item.type === "group" && isGroupActive(item.children)
  )?.id;
  const [openMenuId, setOpenMenuId] = useState(activeParentId || null);

  useEffect(() => {
    setOpenMenuId(activeParentId || null);
  }, [activeParentId, location.pathname]);

  const toggleGroup = (groupId) => {
    setOpenMenuId((currentId) => (currentId === groupId ? null : groupId));
  };

  const title = getPageTitle(location.pathname);

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
      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-inner">
            <img
              src="/images/logo.png"
              style={{ width: "36px", height: "36px", objectFit: "contain" }}
              alt="SFC Cafe"
            />
            <div className="sidebar-brand-text">
              <span className="brand-title">SFC Cafe</span>
              <span className="brand-badge">ADMIN PANEL</span>
            </div>
          </div>
          <Button
            variant="plain"
            className="close-nav"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </Button>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            if (item.type === "link") {
                  const active = isChildActive(item.to);
                  const Icon = item.icon;
                  return (
                    <NavLink
                      end={item.to === "/"}
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={`sidebar-nav-link ${active ? "active" : ""}`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
              }

              if (item.type === "group") {
                  const isExpanded = openMenuId === item.id;
                  const hasActiveChild = isGroupActive(item.children);
                  const Icon = item.icon;

                  return (
                    <div key={item.id} className="sidebar-group">
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.id)}
                        className={`sidebar-group-btn ${
                          hasActiveChild ? "has-active-child" : ""
                        }`}
                        aria-expanded={isExpanded}
                      >
                        <div className="group-content">
                          <Icon size={18} className="group-icon" />
                          <span>{item.label}</span>
                        </div>
                        <span
                          className={`group-arrow ${
                            isExpanded ? "rotated" : ""
                          }`}
                        >
                          <ChevronDown size={15} />
                        </span>
                      </button>

                      <div
                        className={`sidebar-submenu ${
                          isExpanded ? "expanded" : ""
                        }`}
                      >
                        {item.children.map((child) => {
                          const childActive = isChildActive(child.to);

                          return (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              onClick={() => setOpen(false)}
                              className={`sidebar-sublink ${
                                childActive ? "active" : ""
                              }`}
                            >
                              <span className="sublink-dot" />
                              <span>{child.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  );
              }

              return null;
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-help">
            <p>Need help?</p>
            <span>Reach your support team</span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/messages");
              }}
            >
              Contact support
            </button>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <Button variant="plain" className="mobile-menu" onClick={() => setOpen(true)}>
            <Menu />
          </Button>
          <div className="topbar-title-wrap">
            <p className="eyebrow">ADMINISTRATION</p>
            <h2>{title}</h2>
          </div>
          <div className="top-actions">
            <SearchInput placeholder="Search anything..." className="topbar-search" />

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
                  className="notification-dropdown"
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
