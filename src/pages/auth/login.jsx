import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/auth/login.css";
import axios from "axios";

const slides = [
  { image: "/images/slide1.jpg", title: "Welcome", desc: "Learn more about our company" },
  { image: "/images/slide2.jpg", title: "Services", desc: "We offer top-notch solutions" },
  { image: "/images/slide3.jpg", title: "Clients", desc: "Join our growing client base" },
];

// Create Axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

const Login = () => {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Slide auto change every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(""); // clear previous error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { email, password } = formData;
    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/login/", { email, password });
      const { user, token } = response.data;

      // Save token & user info
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userId", user.id);


      // Role-based navigation
      if (user.role === "Admin") {
        navigate("/Admin"); // admin/staff dashboard
      } else if (user.role === "Staff") {
        navigate("/Staff"); // workers dashboard
      } else if (user.role === "client") {
        navigate("/client/hotel"); // client dashboard
      } else {
        navigate("/"); // fallback
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
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
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
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
};

export default Login;
