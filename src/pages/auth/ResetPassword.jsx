import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPasswordSchema } from "../../schema/auth.schema";
import {
  useResetPasswordMutation,
  useVerifyResetPasswordTokenMutation,
} from "../../services/authApi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");
  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();
  const [verifyResetToken] = useVerifyResetPasswordTokenMutation();
  const [tokenState, setTokenState] = useState(token ? "checking" : "invalid");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!token) return;
    let active = true;
    verifyResetToken(token)
      .unwrap()
      .then(() => active && setTokenState("valid"))
      .catch(() => active && setTokenState("invalid"));
    return () => {
      active = false;
    };
  }, [token, verifyResetToken]);

  const submit = async ({ password }) => {
    try {
      await resetPassword({ accessToken: token, password }).unwrap();
      toast.success("Password reset successfully! Please sign in with your new password.");
      navigate("/login", { replace: true });
    } catch (requestError) {
      console.error(requestError);
      toast.error(requestError?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">SFC CAFE</p>
        <h1>Reset password</h1>
        <p className="muted">Choose a new password for your account.</p>
        {tokenState === "checking" && (
          <p className="muted">Verifying reset link…</p>
        )}
        {tokenState === "invalid" && (
          <small className="error">
            This password reset link is invalid or has expired.
          </small>
        )}
        {tokenState === "valid" && (
          <form className="login-form" onSubmit={handleSubmit(submit)}>
            <label>
              New password
              <Input
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
            </label>
            {errors.password && (
              <small className="error">{errors.password.message}</small>
            )}
            <label>
              Confirm password
              <Input
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
            </label>
            {errors.confirmPassword && (
              <small className="error">{errors.confirmPassword.message}</small>
            )}
            {error && (
              <small className="error">
                {error.data?.message || "Unable to reset password"}
              </small>
            )}
            <Button type="submit" disabled={isLoading}>
              <LockKeyhole size={18} />{" "}
              {isLoading ? "Resetting..." : "Reset password"}
            </Button>
          </form>
        )}
        <Link className="text-btn" to="/login">
          <ArrowLeft size={16} /> Back to login
        </Link>
      </section>
    </main>
  );
}
