import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailSchema, otpSchema } from "../../schema/auth.schema";
import { useDispatch, useSelector } from "react-redux";
import { requestOtp, signIn } from "../../context/authSlice";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";


export default function Login() {
  const dispatch = useDispatch();
  const { otpSent, pendingEmail } = useSelector((state) => state.auth);

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });
  return (
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">SFC CAFE</p>
        <h1>{otpSent ? "Verify your login" : "Welcome back"}</h1>
        <p className="muted">
          {otpSent
            ? `We sent a one-time code to ${pendingEmail}`
            : "Sign in to manage your storefront."}
        </p>
        {!otpSent ? (
          <form
            onSubmit={emailForm.handleSubmit(({ email }) =>
              dispatch(requestOtp(email))
            )}
            className="login-form"
          >
            <label>
              Admin email
              <input
                placeholder="admin@deepakfoods.com"
                {...emailForm.register("email")}
              />
            </label>
            {emailForm.formState.errors.email && (
              <small className="error">
                {emailForm.formState.errors.email.message}
              </small>
            )}
            <button className="primary-btn" type="submit">
              <LockKeyhole size={18} /> Send OTP
            </button>
          </form>
        ) : (
          <form
            onSubmit={otpForm.handleSubmit(() =>
              dispatch(signIn(pendingEmail))
            )}
            className="login-form"
          >
            <div className="demo-code">
              <ShieldCheck size={18} /> Demo OTP: <strong>123456</strong>
            </div>
            <label>
              One-time password
              <input
                autoFocus
                inputMode="numeric"
                maxLength="6"
                placeholder="Enter 6-digit code"
                {...otpForm.register("otp")}
              />
            </label>
            {otpForm.formState.errors.otp && (
              <small className="error">
                {otpForm.formState.errors.otp.message}
              </small>
            )}
            <button className="primary-btn" type="submit">
              Verify & sign in
            </button>
            <button
              type="button"
              className="text-btn"
              onClick={() => dispatch(requestOtp(""))}
            >
              <ArrowLeft size={16} /> Use another email
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
