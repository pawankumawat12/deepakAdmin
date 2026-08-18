import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPasswordSchema } from "../../schema/auth.schema";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });
  return <main className="login-page"><section className="login-card"><p className="eyebrow">SFC CAFE</p><h1>Forgot password?</h1><p className="muted">Enter your email and we’ll send you a reset code.</p><form className="login-form" onSubmit={handleSubmit(({ email }) => navigate("/reset-password", { state: { email } }))}><label htmlFor="forgot-email">Email<input id="forgot-email" type="email" autoFocus placeholder="admin@deepakfoods.com" {...register("email")} /></label>{errors.email && <small className="error">{errors.email.message}</small>}<button className="primary-btn" type="submit"><Mail size={18} /> Send reset code</button></form><Link className="text-btn" to="/login"><ArrowLeft size={16} /> Back to login</Link></section></main>;
}
