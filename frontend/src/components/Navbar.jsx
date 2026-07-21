import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
    const {logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout=()=> {
        logout();
        navigate("/login");
    };

    return (
        <nav className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight text-text">
            stocks<span className="text-accent">app</span>
        </span>

        <div className="flex items-center gap-8 text-sm">
            <Link to="/" className="text-muted hover:text-text transition-colors">
            Dashboard
            </Link>
            <Link to="/portfolio" className="text-muted hover:text-text transition-colors">
            Portfolio
            </Link>
            <Link to="/trade" className="text-muted hover:text-text transition-colors">
            Trade
            </Link>
            <Link to="/history" className="text-muted hover:text-text transition-colors">
            History
            </Link>
            <button
            onClick={handleLogout}
            className="text-muted hover:text-loss transition-colors"
            >
            Logout
            </button>
        </div>
        </nav>
    );
}