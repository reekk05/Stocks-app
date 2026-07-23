import {useState, useEffect} from "react";
import apiClient from "../api/client";
import Toast from "../components/Toast";

export default function Trade() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [ohlc, setOhlc]= useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmSell, setConfirmSell] = useState(false);


  const [recentSearches, setRecentSearches] = useState(() => {
  const saved = localStorage.getItem("recentSearches");
  return saved ? JSON.parse(saved) : [];
  });

  useEffect(()=> {
    if(!query.trim()) return; 
    const timeout=setTimeout(async () => {
      try {
        const response = await apiClient.get("/stocks/search",{
          params:{query},
        });
        setResults(response.data.results);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);


  const handleSelectStock = async(symbol) =>{
    setSelectedSymbol(symbol);
    setError("");
    setLoadingPrice(true);
    setQuery("");
    setResults([]);

    const updated = [symbol, ...recentSearches.filter((s)=>s !== symbol)].slice(0,5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));

    try{
      const response = await apiClient.get(`/stocks/ohlc/${symbol}`);
      console.log("OHLC response:", response.data);
      setOhlc(response.data);
    }catch (err){
      console.error(err);
      setError("Failed to fetch price");
      setOhlc(null);
    } finally{
      setLoadingPrice(false);
    }
  };

  useEffect(() => {
  if (!selectedSymbol) return;

  const interval = setInterval(async () => {
    try {
      const response = await apiClient.get(`/stocks/ohlc/${selectedSymbol}`);
      setOhlc(response.data);
    } catch (err) {
      console.error(err);
    }
  }, 5000);

  return () => clearInterval(interval);
  }, [selectedSymbol]);

  const handleTrade = async (type) => {
    setError("");

    try {
      const response = await apiClient.post(`/${type}`, {
        stock_symbol: selectedSymbol,
        quantity: Number(quantity),
      });
      console.log("Trade response:", response.data);
      setToast({
        message: `${type === "buy" ? "Bought" : "Sold"} ${quantity} share(s) of ${selectedSymbol}${response.data.average_price ? ` at ₹${response.data.average_price.toFixed(2)}` : "" } · ${response.data.order_status || "confirmed"}`,
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

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stock symbol, e.g. RELIANCE"
          className="flex-1 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
        />
    {!query && recentSearches.length > 0 && (
      <div className="mb-6">
        <p className="text-muted text-xs uppercase tracking-wide mb-2">Recent</p>
        <div className="flex flex-wrap gap-2">
          {recentSearches.map((symbol) => (
            <button
              key={symbol}
              onClick={() => handleSelectStock(symbol)}
              className="text-xs bg-surface border border-border rounded-full px-3 py-1.5 text-muted hover:text-text hover:border-accent transition-colors"
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
    )}
    {query && results.length > 0 && (
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
              {loadingPrice ? "..." : ohlc ? `₹${ohlc.last_price.toFixed(2)}` : "—"}
            </p>
            {ohlc && (
              <p className={`text-xs tabular-nums ${ohlc.change >= 0 ? "text-gain" : "text-loss"}`}>
                {ohlc.change >= 0 ? "+" : ""}{ohlc.change.toFixed(2)} ({ohlc.change_percent.toFixed(2)}%)
              </p>
            )}
          </div>
        </div>

    {ohlc && (
          <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
            <div>
              <p className="text-muted text-xs uppercase tracking-wide mb-1">Open</p>
              <p className="tabular-nums">₹{ohlc.open.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wide mb-1">High</p>
              <p className="tabular-nums">₹{ohlc.high.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase tracking-wide mb-1">Low</p>
              <p className="tabular-nums">₹{ohlc.low.toFixed(2)}</p>
            </div>
          </div>
        )}

    <label className="text-xs text-muted uppercase tracking-wide">Quantity</label>
    <input
      type="number"
      min="1"
      value={quantity}
      onChange={(e) => setQuantity(e.target.value)}
      className="w-full bg-bg border border-border rounded-lg px-3 py-2 mt-1 mb-6 text-sm focus:outline-none focus:border-accent"
    />

    {ohlc && quantity > 0 && (
      <p className="text-sm text-muted mb-6">
        Estimated total: <span className="tabular-nums text-text">₹{(ohlc.last_price * quantity).toFixed(2)}</span>
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
        onClick={() => setConfirmSell(true)}
        className="flex-1 bg-loss text-white font-medium rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity"
      >
        Sell
      </button>
    </div>
  </div>
)}

{confirmSell && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-surface border border-border rounded-xl p-6 w-80">
      <h2 className="text-base font-medium mb-2">Confirm Sell</h2>
      <p className="text-sm text-muted mb-6">
        Sell {quantity} share(s) of {selectedSymbol} for approximately{" "}
        <span className="text-text tabular-nums">
          ₹{ohlc ? (ohlc.last_price * quantity).toFixed(2) : "—"}
        </span>
        ?
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => setConfirmSell(false)}
          className="flex-1 bg-bg border border-border rounded-lg py-2 text-sm text-muted hover:text-text transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            setConfirmSell(false);
            handleTrade("sell");
          }}
          className="flex-1 bg-loss text-white rounded-lg py-2 text-sm hover:opacity-90 transition-opacity"
        >
          Confirm Sell
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}