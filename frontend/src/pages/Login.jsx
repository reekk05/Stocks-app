import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiclient from "../api/client";
import {useAuth} from "../context/AuthContext";



export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const {login} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await apiclient.post("/login", {username, password});
            login(response.data.access_token);
            navigate("/");
        } catch {
            setError("Invalid username or Password");
        }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-sm">
        <p className="text-center text-lg font-semibold tracking-tight mb-8">
          stocks<span className="text-accent">app</span>
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-xl p-8"
        >
          <h1 className="text-base font-medium mb-6">Sign in</h1>

          {error && (
            <p className="text-loss text-sm mb-4">{error}</p>
          )}

          <label className="text-xs text-muted uppercase tracking-wide">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 mt-1 mb-4 text-sm focus:outline-none focus:border-accent"
            required
          />

          <label className="text-xs text-muted uppercase tracking-wide">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 mt-1 mb-6 text-sm focus:outline-none focus:border-accent"
            required
          />

          <button
            type="submit"
            className="w-full bg-accent text-bg font-medium rounded-lg py-2.5 text-sm hover:bg-accent-dim transition-colors"
          >
            Sign in
          </button>

          <p className="text-sm text-muted text-center mt-6">
            No account? <Link to="/register" className="text-accent hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}