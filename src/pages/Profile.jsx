import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Header";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Try to load profile from localStorage
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");

    if (!token || !userRole || !userId || !userName) {
      // Not logged in, redirect to login
      navigate("/login");
      return;
    }

    setProfile({
      type: userRole,
      profile: {
        id: userId,
        name: userName,
        email: localStorage.getItem("userEmail") || "N/A",
        role: userRole,
      },
    });
  }, [navigate]);

  if (!profile) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
        <h2 className="text-2xl font-bold mb-4">
          Profile ({profile.type})
        </h2>
        <div className="space-y-2">
          <p><strong>ID:</strong> {profile.profile.id}</p>
          <p><strong>Name:</strong> {profile.profile.name}</p>
          <p><strong>Email:</strong> {profile.profile.email}</p>
          <p><strong>Role:</strong> {profile.profile.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
