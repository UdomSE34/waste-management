import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/auth/login.css";
import { loginUser } from "../../api/api";

import img1 from "../../image/1.jpg";
import img2 from "../../image/2.jpg";
import img3 from "../../image/3.jpg";
import logo from "../../image/logo.jpg"; // LOGO IMPORT

const slides = [
  { image: img1, title: "Welcome", desc: "Learn more about our company" },
  { image: img2, title: "Services", desc: "We offer top-notch solutions" },
  { image: img3, title: "Clients", desc: "Join our growing client base" },
];

export default function Login() {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lockTime, setLockTime] = useState(0);

  // Auto slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Lock countdown
  useEffect(() => {
    let timer;
    if (lockTime > 0) {
      timer = setInterval(() => {
        setLockTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockTime]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockTime > 0) return;

    setLoading(true);
    setError("");

    const { email, password } = formData;

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      const { token, user } = await loginUser(email, password);
      localStorage.setItem("authToken", token);

      switch (user.role) {
        case "Admin":
          navigate("/admin/workers");
          break;
        case "Staff":
          navigate("/staff/dashboard");
          break;
        case "client":
          navigate("/client/hotel");
          break;
        case "Council":
          navigate("/public");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail || "Login failed. Check your credentials.";

      setError(msg);

      if (msg.toLowerCase().includes("locked")) {
        const minutesMatch = msg.match(/(\d+)\sminutes?/);
        setLockTime(minutesMatch ? parseInt(minutesMatch[1], 10) * 60 : 600);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Slideshow */}
        <div className="login-slideshow">
          <img src={slides[slideIndex].image} alt={slides[slideIndex].title} />
          <div className="slide-text">
            <h3>{slides[slideIndex].title}</h3>
            <p>{slides[slideIndex].desc}</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="login-card">

          {/* LOGO ON TOP */}
          <div className="logo-wrapper">
            <img src={logo} alt="Forster Investment" className="login-logo" />
          </div>

          <h2>Login</h2>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                disabled={lockTime > 0}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                disabled={lockTime > 0}
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || lockTime > 0}
              >
                {lockTime > 0
                  ? `Locked (${Math.floor(lockTime / 60)}:${
                      lockTime % 60 < 10 ? "0" : ""
                    }${lockTime % 60})`
                  : loading
                  ? "Logging in..."
                  : "Login"}
              </button>
            </div>

            <a href="/register" className="text-blue-600 font-semibold">
              Don’t have an account? Register
            </a>

          </form>
        </div>
      </div>
    </div>
  );
}
