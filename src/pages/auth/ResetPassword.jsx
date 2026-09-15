import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();

  useEffect(() => {
    // Password reset links have been migrated to secure OTP flow
    navigate("/forgot-password", { replace: true });
  }, [navigate]);

  return null;
}
