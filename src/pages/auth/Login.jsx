import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailSchema, otpSchema } from "../../schema/auth.schema";
import { useDispatch, useSelector } from "react-redux";
import { requestOtp, resetOtp, signIn } from "../../context/authSlice";
import { ArrowLeft, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useSendOtpMutation,
  useAdminLoginMutation,
  useVerifyOtpMutation,
} from "../../services/authApi";

export default function Login() {
  const RESEND_COOLDOWN_SECONDS = 30;
  const RESEND_LIMIT = 4;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { otpSent, pendingEmail } = useSelector((state) => state.auth);
  const [adminLogin, { isLoading: sendingOtp }] = useAdminLoginMutation();
  const [sendOtp, { isLoading: resendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyOtpMutation();
  const [apiError, setApiError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const otpRefs = useRef([]);

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = window.setInterval(() => {
      setResendTimer((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendTimer]);

  const handleRequestOtp = async (data) => {
    try {
      setApiError("");
      await adminLogin({ email: data.email, password: data.password }).unwrap();
      dispatch(requestOtp({ email: data.email }));
      setResendCount(0);
      setResendTimer(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setApiError(
        error?.data?.message || "Unable to send OTP. Please try again."
      );
    }
  };

  const handleSignIn = async (data) => {
    try {
      setApiError("");
      await verifyOtp({ email: pendingEmail, otp: data.otp }).unwrap();
      dispatch(signIn({ email: pendingEmail, otp: data.otp }));
      navigate("/", { replace: true });
    } catch (error) {
      setApiError(error?.data?.message || "Invalid or expired OTP.");
    }
  };

  const updateOtp = (index, value) => {
    const next = [...otpDigits];
    next[index] = value.replace(/\D/g, "").slice(-1);
    setOtpDigits(next);
    otpForm.setValue("otp", next.join(""), { shouldValidate: true });
    if (next[index] && index < 3) otpRefs.current[index + 1]?.focus();
  };
  const pasteOtp = (event) => {
    event.preventDefault();
    const value = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    const next = ["", "", "", ""];
    value.split("").forEach((digit, index) => {
      next[index] = digit;
    });
    setOtpDigits(next);
    otpForm.setValue("otp", next.join(""), { shouldValidate: true });
  };
  const useAnotherEmail = () => {
    otpForm.reset({ otp: "" });
    emailForm.reset({ email: "", password: "" });
    setOtpDigits(["", "", "", ""]);
    setResendTimer(0);
    setResendCount(0);
    dispatch(resetOtp());
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
        {apiError && <small className="error">{apiError}</small>}

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
                {...emailForm.register("email")}
                className="input-wrapper"
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                <input type="checkbox" />

                <span>Remember me</span>
              </label>
            </div>

            <button className="primary-btn" type="submit" disabled={sendingOtp}>
              <LockKeyhole size={18} />
              {sendingOtp ? "Sending..." : "Send OTP"}
            </button>
            <button
              type="button"
              className="text-btn"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </form>
        ) : (
          <form
            onSubmit={otpForm.handleSubmit(handleSignIn)}
            className="login-form"
          >
            {/* OTP */}
            <div>
              <label htmlFor="otp">One-time password</label>

              <input type="hidden" {...otpForm.register("otp")} />
              <div className="otp-inputs">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    autoFocus={index === 0}
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    aria-label={`OTP digit ${index + 1}`}
                    onChange={(event) => updateOtp(index, event.target.value)}
                    onPaste={pasteOtp}
                    onKeyDown={(event) => {
                      if (event.key === "Backspace" && !digit && index > 0)
                        otpRefs.current[index - 1]?.focus();
                    }}
                  />
                ))}
              </div>

              {otpForm.formState.errors.otp && (
                <small className="error">
                  {otpForm.formState.errors.otp.message}
                </small>
              )}
            </div>

            <button className="primary-btn" type="submit">
              {verifyingOtp ? "Verifying..." : "Verify & sign in"}
            </button>
            <small className="muted">
              {resendCount >= RESEND_LIMIT
                ? "All 4 resend attempts used. Please try again in 10 minutes."
                : `${RESEND_LIMIT - resendCount} resend attempt${RESEND_LIMIT - resendCount === 1 ? "" : "s"} remaining`}
            </small>
            <button
              type="button"
              className="text-btn"
              disabled={resendingOtp || resendTimer > 0 || resendCount >= RESEND_LIMIT}
              onClick={async () => {
                try {
                  setApiError("");
                  const response = await sendOtp(pendingEmail).unwrap();
                  setResendCount(response.data?.resendCount ?? resendCount + 1);
                  setResendTimer(response.data?.retryAfter ?? RESEND_COOLDOWN_SECONDS);
                } catch (error) {
                  if (error?.data?.retryAfter) setResendTimer(error.data.retryAfter);
                  setApiError(error?.data?.message || "Unable to resend OTP.");
                }
              }}
            >
              {resendingOtp ? "Resending..." : resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>

            <button
              type="button"
              className="text-btn"
              onClick={useAnotherEmail}
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
