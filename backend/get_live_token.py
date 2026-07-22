import requests

url = "https://api.upstox.com/v2/login/authorization/token"

headers={
    "Content-type": "application/x-www-form-urlencoded",
    "Accept": "application/json"
}
data={
    "code":"71jinM",
    "client_id":"e0f18587-165f-4527-b122-a31a87cd6988",
    "client_secret": "zr8hfyyx1b",
    "redirect_uri": "https://webhook.site/ab7e4e9c-badc-4bb4-ae46-6df4e6021ad6",
    "grant_type": "authorization_code"
}

response  = requests.post(url, headers=headers, data=data)
print(response.json())