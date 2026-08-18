import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPasswordSchema } from "../../schema/auth.schema";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(resetPasswordSchema), defaultValues: { otp: "", password: "", confirmPassword: "" } });
  return <main className="login-page"><section className="login-card"><p className="eyebrow">SFC CAFE</p><h1>Reset password</h1><p className="muted">Enter the code sent to {state?.email || "your email"} and choose a new password.</p><form className="login-form" onSubmit={handleSubmit(() => navigate("/login", { replace: true }))}><label>Reset code<input inputMode="numeric" maxLength={6} placeholder="123456" {...register("otp")} /></label>{errors.otp && <small className="error">{errors.otp.message}</small>}<label>New password<input type="password" autoComplete="new-password" {...register("password")} /></label>{errors.password && <small className="error">{errors.password.message}</small>}<label>Confirm password<input type="password" autoComplete="new-password" {...register("confirmPassword")} /></label>{errors.confirmPassword && <small className="error">{errors.confirmPassword.message}</small>}<button className="primary-btn" type="submit"><LockKeyhole size={18} /> Reset password</button></form><Link className="text-btn" to="/login"><ArrowLeft size={16} /> Back to login</Link></section></main>;
}
