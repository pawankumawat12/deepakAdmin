import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailSchema, otpSchema } from "../../schema/auth.schema";
import { useDispatch, useSelector } from "react-redux";
import { requestOtp, signIn } from "../../context/authSlice";
import {
  ArrowLeft,
  LockKeyhole,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { otpSent, pendingEmail } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleRequestOtp = (data) => {
    dispatch(
      requestOtp({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      })
    );
  };

  const handleSignIn = async (data) => {
    try {
      const result = await dispatch(
        signIn({
          email: pendingEmail,
          otp: data.otp,
        })
      );

      // RTK createAsyncThunk successful response
      if (signIn.fulfilled.match(result)) {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

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
            onSubmit={emailForm.handleSubmit(handleRequestOtp)}
            className="login-form"
          >
            {/* EMAIL */}
            <div>
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@deepakfoods.com"
                className="w-100"
                {...emailForm.register("email")}
              />

              {emailForm.formState.errors.email && (
                <small className="error">
                  {emailForm.formState.errors.email.message}
                </small>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label htmlFor="password">Password</label>

              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="System@123"
                  {...emailForm.register("password")}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {emailForm.formState.errors.password && (
                <small className="error">
                  {emailForm.formState.errors.password.message}
                </small>
              )}
            </div>

            {/* REMEMBER ME */}
            <div className="remember-row">
              <label className="remember-label">
                <input
                  type="checkbox"
                  {...emailForm.register("rememberMe")}
                />

                <span>Remember me</span>
              </label>
            </div>

            <button className="primary-btn" type="submit">
              <LockKeyhole size={18} />
              Send OTP
            </button>
          </form>
        ) : (
          <form
            onSubmit={otpForm.handleSubmit(handleSignIn)}
            className="login-form"
          >
            {/* DEMO OTP */}
            <div className="demo-code">
              <ShieldCheck size={18} />
              Demo OTP: <strong>123456</strong>
            </div>

            {/* OTP */}
            <div>
              <label htmlFor="otp">One-time password</label>

              <input
                id="otp"
                autoFocus
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                {...otpForm.register("otp")}
              />

              {otpForm.formState.errors.otp && (
                <small className="error">
                  {otpForm.formState.errors.otp.message}
                </small>
              )}
            </div>

            <button className="primary-btn" type="submit">
              Verify & sign in
            </button>

            <button
              type="button"
              className="text-btn"
              onClick={() => {
                otpForm.reset();
                emailForm.reset();
                dispatch(requestOtp(""));
              }}
            >
              <ArrowLeft size={16} />
              Use another email
            </button>
          </form>
        )}
      </section>
    </main>
  );
}