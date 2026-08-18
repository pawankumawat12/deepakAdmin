import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordSchema } from "../../schema/auth.schema";
import { useResetPasswordMutation } from "../../services/baseApi";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");
  const email = params.get("email");
  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: "", password: "", confirmPassword: "" },
  });
  const submit = async ({ password }) => {
    if (!token) return;
    try {
      await resetPassword({ accessToken: token, password }).unwrap();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">SFC CAFE</p>
        <h1>Reset password</h1>
        <p className="muted">Reset password for {email || "your account"}.</p>
        <form className="login-form" onSubmit={handleSubmit(submit)}>
          <label>
            Reset code
            <input inputMode="numeric" maxLength={6} {...register("otp")} />
          </label>
          {errors.otp && <small className="error">{errors.otp.message}</small>}
          <label>
            New password
            <input type="password" {...register("password")} />
          </label>
          {errors.password && (
            <small className="error">{errors.password.message}</small>
          )}
          <label>
            Confirm password
            <input type="password" {...register("confirmPassword")} />
          </label>
          {errors.confirmPassword && (
            <small className="error">{errors.confirmPassword.message}</small>
          )}
          {error && (
            <small className="error">
              {error.data?.message || "Unable to reset password"}
            </small>
          )}
          <button
            className="primary-btn"
            type="submit"
            disabled={!token || isLoading}
          >
            <LockKeyhole size={18} />{" "}
            {isLoading ? "Resetting..." : "Reset password"}
          </button>
        </form>
        <Link className="text-btn" to="/login">
          <ArrowLeft size={16} /> Back to login
        </Link>
      </section>
    </main>
  );
}
