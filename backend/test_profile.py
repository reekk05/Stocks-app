import requests

url = "https://api.upstox.com/v2/user/profile"
headers = {
    "Accept": "application/json",
    "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2MkNEMzciLCJqdGkiOiI2YTVlNGU2Njg1NTk5MDE5NDFmOGMzN2EiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzg0NTY1MzUwLCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3ODQ1ODQ4MDB9.FU_8T88OIUEtYXkYOi0IyzFj88tDv5BPimdRmxolOE0"
}

response = requests.get(url, headers=headers)
print(response.json())