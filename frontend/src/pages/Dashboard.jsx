import { useState, useEffect } from "react"
import apiClient from "../api/client";


export default function Dashboard() {
    const [portfolio, setPortfolio] = useState(null);
    const [error, setError] = useState("");

    useEffect(()=>{
        const fetchPortfolio = async () => {
            try{
                const response = await apiClient.get("/portfolio");
                setPortfolio(response.data);
            } catch (err) {
                console.error(err);
                setError("failed to load portfolio");
            }
        };

        fetchPortfolio();
    },[]);

    if(error) {
        return <p className="text-red-500 p-8">{error}</p>;
    }
    if (!portfolio) {
        return <p className="p-8">Loading...</p>;
    }

    const totalHoldingsValue = portfolio.holdings.reduce(
        (sum, holding) =>sum+holding.current_value,
        0
    );
    const totalPortfolioValue = portfolio.balance+totalHoldingsValue;
    const totalProfitLoss = portfolio.holdings.reduce(
        (sum, holding) => sum +holding.profit_loss,
        0
    );

    return (
        <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-xl font-semibold mb-8 text-text">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-muted text-xs uppercase tracking-wide mb-2">Cash Balance</p>
            <p className="text-xl font-semibold tabular-nums">₹{portfolio.balance.toFixed(2)}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-muted text-xs uppercase tracking-wide mb-2">Holdings Value</p>
            <p className="text-xl font-semibold tabular-nums">₹{totalHoldingsValue.toFixed(2)}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-muted text-xs uppercase tracking-wide mb-2">Portfolio Value</p>
            <p className="text-xl font-semibold tabular-nums">₹{totalPortfolioValue.toFixed(2)}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-muted text-xs uppercase tracking-wide mb-2">Total P/L</p>
            <p
                className={`text-xl font-semibold tabular-nums ${
                totalProfitLoss >= 0 ? "text-gain" : "text-loss"
                }`}
            >
                {totalProfitLoss >= 0 ? "+" : ""}₹{totalProfitLoss.toFixed(2)}
            </p>
            </div>
        </div>

        <h2 className="text-sm font-medium text-muted uppercase tracking-wide mb-4">Holdings</h2>
        {portfolio.holdings.length === 0 ? (
            <p className="text-muted text-sm">No positions yet. Head to Trade to buy your first stock.</p>
        ) : (
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-muted text-xs uppercase tracking-wide">
                <tr>
                    <th className="p-4 font-medium">Stock</th>
                    <th className="p-4 font-medium">Qty</th>
                    <th className="p-4 font-medium">Avg Buy</th>
                    <th className="p-4 font-medium">Current</th>
                    <th className="p-4 font-medium">Value</th>
                    <th className="p-4 font-medium">P/L</th>
                </tr>
                </thead>
                <tbody>
                {portfolio.holdings.map((holding) => (
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
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        </div>
    );
}