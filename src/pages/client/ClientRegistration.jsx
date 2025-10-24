import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/client/clientRegistration.css";
import { registerClient } from "../../services/client/clientService";

import img6 from "../../image/6.jpg";
import img7 from "../../image/7.jpg";
import img8 from "../../image/8.jpg";

const ClientRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);



const slides = [
  {
    image: img6,
    title: "Welcome to Our Company",
    desc: "We provide top-notch services for your business growth.",
  },
  {
    image: img7,
    title: "Reliable Support",
    desc: "Our team is here to support you 24/7.",
  },
  {
    image: img8,
    title: "Innovative Solutions",
    desc: "We offer innovative solutions tailored to your needs.",
  },
];


  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const { name, phone, email, address, password, confirmPassword } = formData;

    if (!name || !phone || !email || !address || !password || !confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const payload = { name, phone, email, address, password };
      await registerClient(payload);
      setSuccess("Client registered successfully!");
      setFormData({ name: "", phone: "", email: "", address: "", password: "", confirmPassword: "" });

      setTimeout(() => navigate("/clients"), 2000);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-registration-page">
      <div className="slideshow">
        <img src={slides[slideIndex].image} alt={slides[slideIndex].title} />
        <div className="slide-text">
          <h3>{slides[slideIndex].title}</h3>
          <p>{slides[slideIndex].desc}</p>
        </div>
      </div>

      <div className="registration-card">
        <div className="card-header-client">
          <h2>Customer Registration</h2>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Row 1: Name & Phone */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter full name" required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter phone number" required />
            </div>
          </div>

          {/* Row 2: Email & Address */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email" required />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter address" required />
            </div>
          </div>

          {/* Row 3: Password & Confirm Password */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Enter password" required />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm password" required />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientRegistration;
