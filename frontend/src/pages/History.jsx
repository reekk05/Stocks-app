import{useState, useEffect} from "react";
import apiClient from "../api/client";

export default function History() {
  const [transactions, setTransactions] = useState(null);
  const [error, setError] = useState("");

  useEffect(()=>{
    const fetchTransactions = async () => {
      try {
        const response = await apiClient.get("/transactions");
        setTransactions(response.data);
      } catch (err) {
        console.error(err);
        setError("failed to load transaction history");
      }
    };
    fetchTransactions();
  }, []);
  if (error) return <p className="text-loss p-8">{error}</p>;
  if (!transactions) return <p className="Test-muted p-8">Loading...</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold mb-8">Transaction History</h1>

      {transactions.length === 0 ? (
        <p className="text-muted text-sm">No transactions yet.</p>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted text-xs uppercase tracking-wide">
              <tr>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Qty</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="p-4">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        tx.transaction_type === "BUY"
                          ? "bg-gain/10 text-gain"
                          : "bg-loss/10 text-loss"
                      }`}
                    >
                      {tx.transaction_type}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{tx.stock_symbol}</td>
                  <td className="p-4 tabular-nums text-muted">{tx.quantity}</td>
                  <td className="p-4 tabular-nums text-muted">₹{tx.price.toFixed(2)}</td>
                  <td className="p-4 tabular-nums">₹{(tx.quantity * tx.price).toFixed(2)}</td>
                  <td className="p-4 text-muted text-xs">
                    {new Date(tx.timestamp + "Z").toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      day:"2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute:"2-digit",
                      second:"2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}