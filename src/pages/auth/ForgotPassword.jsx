import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { forgotPasswordSchema } from "../../schema/auth.schema";
import { useForgotPasswordMutation } from "../../services/authApi";

export default function ForgotPassword() {
  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();
  const [emailSent, setEmailSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const submit = async ({ email }) => {
    try {
      await forgotPassword(email).unwrap();
      setEmailSent(true);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">SFC CAFE</p>
        <h1>Forgot password?</h1>
        <p className="muted">Enter your email and we’ll send a reset link.</p>
        <form className="login-form" onSubmit={handleSubmit(submit)}>
          <label>
            Email
            <input type="email" {...register("email")} />
          </label>
          {errors.email && (
            <small className="error">{errors.email.message}</small>
          )}
          {error && (
            <small className="error">
              {error.data?.message || "Unable to send reset link"}
            </small>
          )}
          {emailSent && (
            <small className="success">
              If that email is registered, a reset link has been sent. Check your inbox.
            </small>
          )}
          <button className="primary-btn" type="submit" disabled={isLoading}>
            <Mail size={18} /> {isLoading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <Link className="text-btn" to="/login">
          <ArrowLeft size={16} /> Back to login
        </Link>
      </section>
    </main>
  );
}
