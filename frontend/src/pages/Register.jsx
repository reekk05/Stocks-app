import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiclient from "../api/client";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await apiclient.post("/register", { username, password });
      navigate("/login");
    } catch {
      setError("Registration failed. Please try again.");
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
          <h1 className="text-base font-medium mb-6">Create account</h1>

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
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 mt-1 mb-4 text-sm focus:outline-none focus:border-accent"
            required
          />

          <label className="text-xs text-muted uppercase tracking-wide">Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 mt-1 mb-6 text-sm focus:outline-none focus:border-accent"
            required
          />

          <button
            type="submit"
            className="w-full bg-accent text-bg font-medium rounded-lg py-2.5 text-sm hover:bg-accent-dim transition-colors"
          >
            Create account
          </button>

          <p className="text-sm text-muted text-center mt-6">
            Already have an account? <Link to="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}