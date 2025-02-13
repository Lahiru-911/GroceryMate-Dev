import { useState } from "react";
import { auth } from "../config/firebaseConfig"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Connect() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/inventory"); 
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-gray-100 bg-cover bg-center bg-[url('/home/k1.webp')]">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md bg-opacity-90">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        Welcome to GroceryMate
      </h1>
      <p className="mt-2 text-lg text-center text-gray-600">Sign In</p>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <form className="mt-6" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 mt-2 text-gray-700 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mt-2 text-gray-700 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="text-green-500 focus:ring-green-500" />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <a href="#" className="text-sm text-green-600 hover:underline">
            Forgot Password?
          </a>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 mt-6 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Sign In
        </button>
      </form>
      <p className="mt-6 text-sm text-center text-gray-600">
        Don’t have an account?
        <a href="/register" className="text-green-600 hover:underline ml-2">Sign up</a>
      </p>
    </div>
    </div>
    
    </>
    
  );
}
