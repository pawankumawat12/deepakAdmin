import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { useSelector } from "react-redux";

export default function Profile() {
  const user = useSelector((state) => state.auth.user);
  const initials = user?.name?.slice(0, 2).toUpperCase() || "AD";

  return (
    <>
      <div className="section-head">
        <div>
          <h1>My profile</h1>
          <p>View your administrator account details.</p>
        </div>
      </div>
      <section className="profile-page-card">
        <div className="profile-page-heading">
          <span className="profile-page-avatar">{initials}</span>
          <div>
            <h2>{user?.name || "Administrator"}</h2>
            <p>Administrator account</p>
          </div>
        </div>
        <dl className="profile-details">
          <div>
            <dt><UserRound size={18} /> Full name</dt>
            <dd>{user?.name || "Not available"}</dd>
          </div>
          <div>
            <dt><Mail size={18} /> Email address</dt>
            <dd>{user?.email || "Not available"}</dd>
          </div>
          <div>
            <dt><ShieldCheck size={18} /> Role</dt>
            <dd className="role-badge">{user?.role || "admin"}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
