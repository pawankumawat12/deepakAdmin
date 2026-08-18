import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "../context/authSlice";
import { useLogoutMutation } from "../services/authApi";
import ConfirmDialog from "../components/ui/ConfirmDialog";
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
  Heart,
  Settings,
  UserRound,
  LogOut,
  Menu,
  Search,
  X,
} from "lucide-react";

const navigation = [
  ["Overview", "/", LayoutDashboard],
  ["Catalog", "/products", Package],
  ["Categories", "/categories", Tags],
  ["Orders", "/orders", ShoppingBag],
  ["Customers", "/customers", Users],
  ["Offers", "/offers", BadgePercent],
  ["Reviews", "/reviews", Star],
  ["Messages", "/messages", MessageSquare],
  ["Favourites", "/favourites", Heart],
  ["Settings", "/settings", Settings],
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutRequest, { isLoading: isSigningOut }] = useLogoutMutation();
  const location = useLocation();
  const title =
    navigation.find((item) => item[1] === location.pathname)?.[0] ||
    "Admin panel";
  const logout = async () => {
    try {
      setSignOutError("");
      await logoutRequest().unwrap();
      dispatch(signOut());
      setShowSignOut(false);
      setProfileOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      setSignOutError(error?.data?.message || "Unable to sign out. Please try again.");
    }
  };
  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark small">D</span>
          <span>
            ADMIN
          </span>
          <button className="close-nav" onClick={() => setOpen(false)}>
            <X />
          </button>
        </div>
        <nav>
          {navigation.map(([label, to, Icon]) => (
            <NavLink
              end={to === "/"}
              key={to}
              to={to}
              onClick={() => setOpen(false)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {label === "Orders" && <b>8</b>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-help">
          <p>Need help?</p>
          <span>Reach your support team</span>
          <button>Contact support</button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <div>
            <p className="eyebrow">ADMINISTRATION</p>
            <h2>{title}</h2>
          </div>
          <div className="top-actions">
            <label className="search">
              <Search size={18} />
              <input placeholder="Search anything..." />
            </label>
            <button className="icon-btn">
              <Bell size={20} />
              <i />
            </button>
            <div className="profile-wrap">
              <button
                className="profile"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <span>{user?.name?.slice(0, 2).toUpperCase() || "AD"}</span>
                <div>
                  <strong>{user?.name}</strong>
                  <small>{user?.role}</small>
                </div>
                <ChevronDown size={16} />
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  <button onClick={() => { setProfileOpen(false); navigate("/profile"); }}>
                    <UserRound size={16} /> My profile
                  </button>
                  <button onClick={() => { setSignOutError(""); setProfileOpen(false); setShowSignOut(true); }}>
                    <LogOut size={16} /> Sign out
                  </button>
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
