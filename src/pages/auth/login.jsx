import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/auth/login.css";
import { loginUser } from "../../api/api"; // login helper

import img1 from "../../image/1.jpg";
import img2 from "../../image/2.jpg";
import img3 from "../../image/3.jpg";


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
  const [lockTime, setLockTime] = useState(0); // seconds remaining if account is locked

  // Slide auto change every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Lock countdown timer
  useEffect(() => {
    let timer;
    if (lockTime > 0) {
      timer = setInterval(() => {
        setLockTime(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockTime]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // clear previous error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockTime > 0) return; // prevent login while locked
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

      // Store token
      localStorage.setItem("authToken", token);

      // Redirect based on role
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
        default:
          navigate("/");
      }
    } catch (err) {
      console.error(err);

      const msg = err.response?.data?.detail || "Login failed. Check your credentials.";
      setError(msg);

      // Parse lockout duration from backend message
      if (msg.toLowerCase().includes("locked")) {
        const minutesMatch = msg.match(/(\d+)\sminutes?/);
        if (minutesMatch) {
          setLockTime(parseInt(minutesMatch[1], 10) * 60); // convert minutes → seconds
        } else {
          setLockTime(600); // fallback 10 minutes
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-slideshow">
          <img src={slides[slideIndex].image} alt={slides[slideIndex].title} />
          <div className="slide-text">
            <h3>{slides[slideIndex].title}</h3>
            <p>{slides[slideIndex].desc}</p>
          </div>
        </div>

        <div className="login-card">
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
              <button type="submit" className="btn btn-primary" disabled={loading || lockTime > 0}>
                {lockTime > 0
                  ? `Locked (${Math.floor(lockTime / 60)}:${lockTime % 60 < 10 ? "0" : ""}${lockTime % 60})`
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
