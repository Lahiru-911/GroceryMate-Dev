import { useState } from "react";
import { auth, database } from "../config/firebaseConfig"; // Import Firebase Database
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database"; // Import Database functions
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Store username in Realtime Database
      await set(ref(database, "users/" + user.uid), {
        username: username,
        email: email,
      });
  
      alert("Registration successful!");
      navigate("/inventory"); // Redirect to Inventory page after successful registration
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: 'url("/home/k1.webp")' }}
    >
      <div className="w-full max-w-md p-8 bg-opacity-80 bg-gray-900 text-white rounded-lg shadow-lg border border-green-500">
        <h1 className="text-4xl font-bold text-center text-green-500">Welcome to GroceryMate</h1>
        <p className="mt-2 text-xl text-center text-gray-300">Create Your Account</p>

        {error && <p className="text-red-500 text-center mt-3">{error}</p>}

        <form className="mt-6" onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full px-4 py-3 mt-2 bg-gray-800 text-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 mt-2 bg-gray-800 text-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-3 mt-2 bg-gray-800 text-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              className="w-full px-4 py-3 mt-2 bg-gray-800 text-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full px-4 py-3 text-lg font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          <p className="mt-4 text-sm text-center text-gray-300">
            Already have an account?{" "}
            <a href="/connect" className="text-green-500 hover:underline">
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
