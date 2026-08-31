import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
  Heart,
  Settings,
  UserRound,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  ["Dashboard", "/", LayoutDashboard],
  ["Customers", "/customers", Users],
  ["Products", "/products", Package],
  ["Categories", "/categories", Tags],
  ["Orders", "/orders", ShoppingBag],
  ["Offers", "/offers", BadgePercent],
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
       <img src="/images/logo.png"style={{width: "40px"}} />
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
              {label === "Orders" && <b>8</b>}
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
            <Button variant="icon">
              <Bell size={20} />
              <i />
            </Button>
            <div className="profile-wrap">
              <Button
                variant="plain"
                className="profile"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <span>{user?.name?.slice(0, 2).toUpperCase() || "AD"}</span>
                <div>
                  <strong>{user?.name}</strong>
                  <small>{user?.role}</small>
                </div>
                <ChevronDown size={16} />
              </Button>
              {profileOpen && (
                <div className="profile-menu">
                  <Button variant="plain" onClick={() => { setProfileOpen(false); navigate("/profile"); }}>
                    <UserRound size={16} /> My profile
                  </Button>
                  <Button variant="plain" onClick={() => { setSignOutError(""); setProfileOpen(false); setShowSignOut(true); }}>
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
