import {useState} from "react";
import apiClient from "../api/client";
import Toast from "../components/Toast";

export default function Trade() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [price, setPrice]= useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if(!query.trim()) return;

    try{
      const response=await apiClient.get("/stocks/search", {
        params:{query},
      });
      setResults(response.data.results);
    } catch(err) {
      console.error(err);
      setError("Search failed");
    }
  };
  const handleSelectStock = async(symbol) =>{
    setSelectedSymbol(symbol);
    setError("");
    setLoadingPrice(true);

    try{
      const response = await apiClient.get(`/stocks/price/${symbol}`);
      setPrice(response.data.price);
    }catch (err){
      console.error(err);
      setError("Failed to fetch price");
      setPrice(null);
    } finally{
      setLoadingPrice(false);
    }
  };

  const handleTrade = async (type) => {
    setError("");

    try {
      const response = await apiClient.post(`/${type}`, {
        stock_symbol: selectedSymbol,
        quantity: Number(quantity),
      });
      setToast({
        message: `${type === "buy" ? "Bought" : "Sold"} ${quantity} share(s) of ${selectedSymbol}`,
        type: "success",
      });
      handleSelectStock(selectedSymbol);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || "Trade failed";
      setError(detail);
      setToast({ message: detail, type: "error" });
    }
  };
  return (
    <div className="p-8 max-w-3xl mx-auto">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <h1 className="text-xl font-semibold mb-8">Trade</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stock symbol, e.g. RELIANCE"
          className="flex-1 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="bg-accent text-bg font-medium rounded-lg px-5 text-sm hover:bg-accent-dim transition-colors"
        >
          Search
        </button>
      </form>

      {results.length > 0 && (
        <div className="bg-surface border border-border rounded-xl mb-8 overflow-hidden">
          {results.map((symbol) => (
            <button
              key={symbol}
              onClick={() => handleSelectStock(symbol)}
              className={`w-full text-left px-4 py-3 text-sm border-b border-border last:border-b-0 hover:bg-bg transition-colors ${
                selectedSymbol === symbol ? "bg-bg text-accent" : ""
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>
      )}

      {selectedSymbol && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-muted text-xs uppercase tracking-wide mb-1">Selected</p>
              <p className="text-lg font-semibold">{selectedSymbol}</p>
            </div>
            <div className="text-right">
              <p className="text-muted text-xs uppercase tracking-wide mb-1">Live Price</p>
              <p className="text-lg font-semibold tabular-nums">
                {loadingPrice ? "..." : price !== null ? `₹${price.toFixed(2)}` : "—"}
              </p>
            </div>
          </div>

          <label className="text-xs text-muted uppercase tracking-wide">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 mt-1 mb-6 text-sm focus:outline-none focus:border-accent"
          />

          {price !== null && quantity > 0 && (
            <p className="text-sm text-muted mb-6">
              Estimated total: <span className="tabular-nums text-text">₹{(price * quantity).toFixed(2)}</span>
            </p>
          )}

          {error && <p className="text-loss text-sm mb-4">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => handleTrade("buy")}
              className="flex-1 bg-gain text-bg font-medium rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity"
            >
              Buy
            </button>
            <button
              onClick={() => handleTrade("sell")}
              className="flex-1 bg-loss text-white font-medium rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity"
            >
              Sell
            </button>
          </div>
        </div>
      )}
    </div>
  );
}