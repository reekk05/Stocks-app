import os
import requests
from dotenv import load_dotenv

load_dotenv()
ACCESS_TOKEN = os.getenv("UPSTOX_SANDBOX_ACCESS_TOKEN")

print(repr(ACCESS_TOKEN))


url = "https://api-sandbox.upstox.com/v2/order/place"

headers= {
    "Content-Type": "application/json",
    "Accept" : "application/json",
    "Authorization": f"Bearer {ACCESS_TOKEN}"
}

payload = {
    "quantity": 1,
    "product": "D",
    "validity": "DAY",
    "price": 0,
    "instrument_token": "NSE_EQ|INE669E01016",
    "order_type": "MARKET",
    "transaction_type": "BUY",
    "disclosed_quantity": 0,
    "trigger_price":0
}

response = requests.post(url, headers=headers, json=payload)

print(response.status_code)
print(response.json())