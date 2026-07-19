import gzip
import json
import requests

INSTRUMENTS_URL="https://assets.upstox.com/market-quote/instruments/exchange/NSE.json.gz"

_instruments_cache={}

def load_instruments():
    global _instruments_cache
    response = requests.get(INSTRUMENTS_URL)
    data = json.loads(gzip.decompress(response.content))

    for item in data:
        symbol = item.get("trading_symbol")
        segment = item.get("segment")
        if symbol and segment == "NSE_EQ":
            _instruments_cache[symbol.upper()] = item["instrument_key"]

    print(f"Loaded {len(_instruments_cache)} instruments")


def get_instrument_key(symbol: str)-> str |None:
    return _instruments_cache.get(symbol.upper())


def search_symbols(query: str, limit: int=10) -> list[str]:
    query=query.upper()
    matches = [symbol for symbol in _instruments_cache if query in symbol]
    return matches[:limit]