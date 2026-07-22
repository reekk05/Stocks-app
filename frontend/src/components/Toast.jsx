import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 px-5 py-3 rounded-lg border shadow-lg text-sm font-medium z-50 ${
        type === "success"
          ? "bg-surface border-gain text-gain"
          : "bg-surface border-loss text-loss"
      }`}
    >
      {message}
    </div>
  );
}