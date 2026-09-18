import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailSchema, otpSchema } from "../../schema/auth.schema";
import { useDispatch } from "react-redux";
import { setUser } from "../../context/authSlice";
import { ArrowLeft, LockKeyhole, Store, Send, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useSendOtpMutation,
  useAdminLoginMutation,
  useVerifyOtpMutation,
  useLazyGetMeQuery,
} from "../../services/authApi";
import { useRequestStoreAccessMutation } from "../../services/storeApi";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function Login() {
  const RESEND_COOLDOWN_SECONDS = 30;
  const RESEND_LIMIT = 4;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [adminLogin, { isLoading: sendingOtp }] = useAdminLoginMutation();
  const [sendOtp, { isLoading: resendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyOtpMutation();
  const [getMe] = useLazyGetMeQuery();
  const [requestStoreAccess, { isLoading: requestingAccess }] = useRequestStoreAccessMutation();

  const [mode, setMode] = useState("login"); // "login" | "store_request"
  const [storeRequestEmail, setStoreRequestEmail] = useState("");
  const [storeRequestSuccess, setStoreRequestSuccess] = useState(false);
  const [storeRequestMessage, setStoreRequestMessage] = useState("");

  const [apiError, setApiError] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [resendCount, setResendCount] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
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
      const res = await adminLogin({ email: data.email, password: data.password }).unwrap();

      // Direct login completed without OTP (when IS_EMAIL_VERIFY=false)
      if (res?.accessToken || res?.token || (res?.user && !res?.requiresOtp)) {
        const token = res?.accessToken || res?.token || res?.user?.token;
        if (res?.user) {
          dispatch(setUser({ ...res.user, accessToken: token }));
        }
        toast.success(res?.message || "Welcome back! Logged in successfully.");
        navigate("/", { replace: true });
        return;
      }

      // Otherwise OTP is required (when IS_EMAIL_VERIFY=true)
      setPendingEmail(data.email);
      setOtpSent(true);
      setResendTimer(RESEND_COOLDOWN_SECONDS);
      toast.success(res?.message || "Credentials verified! Verification OTP sent to your email.");
    } catch (error) {
      if (error?.data?.isApprovedPendingPassword && error?.data?.setupUrl) {
        toast.success(error.data.message || "Your access has been approved! Redirecting to set your password...");
        navigate(error.data.setupUrl);
        return;
      } else if (error?.data?.isPendingStoreOwner) {
        setStoreRequestEmail(data.email);
        setMode("store_request");
        setApiError(error.data.message);
      } else {
        const errorMsg =
          error?.data?.message || "Unable to sign in. Please try again.";
        setApiError(errorMsg);
      }
    }
  };

  const handleSendStoreAccessRequest = async (e) => {
    e.preventDefault();
    if (!storeRequestEmail || !storeRequestEmail.trim()) {
      setApiError("Please enter your registered store owner email.");
      return;
    }
    try {
      setApiError("");
      const res = await requestStoreAccess({ email: storeRequestEmail.trim() }).unwrap();
      if (res?.status === "ready_to_login") {
        toast.success(res.message);
        emailForm.setValue("email", storeRequestEmail.trim());
        setMode("login");
      } else if (res?.status === "approved_set_password" && res?.setupUrl) {
        toast.success(res.message || "Your access has been approved! Redirecting to set your password...");
        navigate(res.setupUrl);
      } else {
        setStoreRequestSuccess(true);
        setStoreRequestMessage(
          res?.message || "Login request submitted! Admin has been notified. You will receive an email once approved."
        );
        toast.success("Request sent to Admin!");
      }
    } catch (err) {
      const msg = err?.data?.message || "Failed to submit access request.";
      setApiError(msg);
    }
  };

  const handleSignIn = async (data) => {
    try {
      setApiError("");
      const res = await verifyOtp({ email: pendingEmail, otp: data.otp }).unwrap();
      const token = res?.accessToken || res?.token || res?.user?.token;
      
      // Token held in Redux memory (no localStorage)
      if (res?.user) {
        dispatch(setUser({ ...res.user, accessToken: token }));
      }

      toast.success("Welcome back! Logged in successfully.");
      navigate("/", { replace: true });
    } catch (error) {
      const errorMsg = error?.data?.message || "Invalid or expired OTP.";
      setApiError(errorMsg);
    }
  };

  const updateOtp = (index, value) => {
    const next = [...otpDigits];
    next[index] = value.replace(/\D/g, "").slice(-1);
    setOtpDigits(next);
    otpForm.setValue("otp", next.join(""), { shouldValidate: true });
    if (next[index] && index < 5) otpRefs.current[index + 1]?.focus();
  };
  const pasteOtp = (event) => {
    event.preventDefault();
    const value = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const next = ["", "", "", "", "", ""];
    value.split("").forEach((digit, index) => {
      next[index] = digit;
    });
    setOtpDigits(next);
    otpForm.setValue("otp", next.join(""), { shouldValidate: true });
  };
  const useAnotherEmail = () => {
    otpForm.reset({ otp: "" });
    setResendTimer(0);
    setResendCount(0);
    setPendingEmail("");
    setOtpSent(false);
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <p className="eyebrow">SFC BAKERS</p>
        <h1>
          {mode === "store_request"
            ? "Store Owner Access"
            : otpSent
            ? "Verify your login"
            : "Welcome back"}
        </h1>

        <p className="muted">
          {mode === "store_request"
            ? "Request login approval to access your branch store."
            : otpSent
            ? `We sent a one-time code to ${pendingEmail}`
            : "Sign in to manage your storefront."}
        </p>
        {apiError && <small className="error">{apiError}</small>}

        {mode === "store_request" ? (
          <div className="login-form">
            {storeRequestSuccess ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ display: "inline-flex", padding: "12px", borderRadius: "50%", background: "#ecfdf5", color: "#059669", marginBottom: "12px" }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>
                  Request Submitted!
                </h3>
                <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 16px" }}>
                  {storeRequestMessage}
                </p>
                <Button
                  type="button"
                  variant="plain"
                  onClick={() => {
                    setStoreRequestSuccess(false);
                    setMode("login");
                  }}
                  style={{ width: "100%" }}
                >
                  <ArrowLeft size={16} />
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSendStoreAccessRequest}>
                <div style={{ marginBottom: "16px" }}>
                  <label htmlFor="store-email">Registered Owner Email</label>
                  <Input
                    id="store-email"
                    type="email"
                    required
                    placeholder="owner@store.com"
                    value={storeRequestEmail}
                    onChange={(e) => {
                      setStoreRequestEmail(e.target.value);
                      if (apiError) setApiError("");
                    }}
                    className="input-wrapper"
                  />
                  <small style={{ color: "#6b7280", fontSize: "11px", marginTop: "4px", display: "block" }}>
                    The email registered by the administrator when creating your store.
                  </small>
                </div>

                <Button type="submit" disabled={requestingAccess} style={{ width: "100%", background: "#059669" }}>
                  <Send size={16} />
                  {requestingAccess ? "Submitting Request..." : "Send Request to Admin"}
                </Button>

                <Button
                  type="button"
                  variant="text"
                  onClick={() => {
                    setApiError("");
                    setMode("login");
                  }}
                  style={{ width: "100%", marginTop: "10px" }}
                >
                  <ArrowLeft size={16} />
                  Back to Regular Sign In
                </Button>
              </form>
            )}
          </div>
        ) : !otpSent ? (
          <form
            onSubmit={emailForm.handleSubmit(handleRequestOtp)}
            className="login-form"
          >
            {/* EMAIL */}
            <div>
              <label htmlFor="email">Email</label>

              <Input
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

              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="System@123"
                {...emailForm.register("password")}
                style={{width: "100%"}}
              />

              {emailForm.formState.errors.password && (
                <small className="error">
                  {emailForm.formState.errors.password.message}
                </small>
              )}
            </div>

            {/* REMEMBER ME */}
            <div className="remember-row">
              <label className="remember-label">
                <Input type="checkbox" />

                <span>Remember me</span>
              </label>
            </div>

            <Button type="submit" disabled={sendingOtp}>
              <LockKeyhole size={18} />
              {sendingOtp ? "Signing in..." : "Sign In"}
            </Button>
            <Link
              to="/forgot-password"
              className="text-btn text-center mt-2 d-inline-block text-decoration-none"
            >
              Forgot password?
            </Link>

            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
              <button
                type="button"
                onClick={() => {
                  setApiError("");
                  setMode("store_request");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#059669",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Store size={14} />
                Store Owner? Request Login Approval
              </button>
            </div>
          </form> 
        ) : (
          <form
            onSubmit={otpForm.handleSubmit(handleSignIn)}
            className="login-form"
          >
            {/* OTP */}
            <div>
              <label htmlFor="otp">One-time password</label>

              <Input type="hidden" {...otpForm.register("otp")} />
              <div className="otp-inputs">
                {otpDigits.map((digit, index) => (
                  <Input
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

            <Button type="submit">
              {verifyingOtp ? "Verifying..." : "Verify & sign in"}
            </Button>
            <small className="muted mt-2">
              {resendCount >= RESEND_LIMIT
                ? "All 4 resend attempts used. Please try again in 10 minutes."
                : `${RESEND_LIMIT - resendCount} resend attempt${RESEND_LIMIT - resendCount === 1 ? "" : "s"} remaining`}
            </small>
            <Button
              type="button"
              variant="text"
              disabled={resendingOtp || resendTimer > 0 || resendCount >= RESEND_LIMIT}
              onClick={async () => {
                try {
                  setApiError("");
                  const response = await sendOtp(pendingEmail).unwrap();
                  setResendCount(response.data?.resendCount ?? resendCount + 1);
                  setResendTimer(response.data?.retryAfter ?? RESEND_COOLDOWN_SECONDS);
                  toast.success("A fresh OTP has been sent to your email.");
                } catch (error) {
                  if (error?.data?.retryAfter) setResendTimer(error.data.retryAfter);
                  const errorMsg = error?.data?.message || "Unable to resend OTP.";
                  setApiError(errorMsg);
                }
              }}
            >
              {resendingOtp ? "Resending..." : resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </Button>

            <Button
              type="button"
              variant="text"
              onClick={useAnotherEmail}
            >
              <ArrowLeft size={16} />
              Use another email
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
