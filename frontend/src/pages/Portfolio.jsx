import { useState, useEffect } from "react";
import apiClient from "../api/client";


export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState("");

  useEffect(()=> {
    const fetchPortfolio = async () => {
      try {
        const response = await apiClient.get("/portfolio");
        setPortfolio(response.data);
      } catch (err){
        console.error(err);
        setError("Failed to load Portfolio");
      }
    };
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 10000);
    return () => clearInterval(interval);
    },[]);
    
    if (error) return <p className="text-loss p-8">{error}</p>;
    if (!portfolio) return <p className="text-muted p-8"> Loading </p>;

    return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold mb-8">Portfolio</h1>

      {portfolio.holdings.length === 0 ? (
        <p className="text-muted text-sm">No positions yet.</p>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted text-xs uppercase tracking-wide">
              <tr>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Qty</th>
                <th className="p-4 font-medium">Avg Buy Price</th>
                <th className="p-4 font-medium">Current Price</th>
                <th className="p-4 font-medium">Current Value</th>
                <th className="p-4 font-medium">P/L</th>
                <th className="p-4 font-medium">P/L %</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.holdings.map((holding) => {
                const costBasis = holding.quantity * holding.avg_buy_price;
                const plPercent = (holding.profit_loss / costBasis) * 100;

                return (
                  <tr key={holding.stock_symbol} className="border-t border-border">
                    <td className="p-4 font-medium">{holding.stock_symbol}</td>
                    <td className="p-4 tabular-nums text-muted">{holding.quantity}</td>
                    <td className="p-4 tabular-nums text-muted">₹{holding.avg_buy_price.toFixed(2)}</td>
                    <td className="p-4 tabular-nums">₹{holding.current_price.toFixed(2)}</td>
                    <td className="p-4 tabular-nums">₹{holding.current_value.toFixed(2)}</td>
                    <td
                      className={`p-4 tabular-nums font-medium ${
                        holding.profit_loss >= 0 ? "text-gain" : "text-loss"
                      }`}
                    >
                      {holding.profit_loss >= 0 ? "+" : ""}₹{holding.profit_loss.toFixed(2)}
                    </td>
                    <td
                      className={`p-4 tabular-nums font-medium ${
                        plPercent >= 0 ? "text-gain" : "text-loss"
                      }`}
                    >
                      {plPercent >= 0 ? "+" : ""}{plPercent.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}    