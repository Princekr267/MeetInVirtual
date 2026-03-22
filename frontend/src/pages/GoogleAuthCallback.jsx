import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/home");
    } else {
      navigate("/auth?error=google_failed");
    }
  }, []);

  return <p style={{ color: "white", textAlign: "center", marginTop: "40vh" }}>Signing you in...</p>;
}