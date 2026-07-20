import requests

url = "https://api.upstox.com/v2/login/authorization/token"

headers={
    "Content-type": "application/x-www-form-urlencoded",
    "Accept": "application/json"
}
data={
    "code":"JcgGEL",
    "client_id":"8fb1476d-0652-4f8d-b679-1705a15b8616",
    "client_secret": "6w5c7q38vj",
    "redirect_uri": "https://webhook.site/7ba2ddf0-5c4a-46a9-b00c-22d679c04b52",
    "grant_type": "authorization_code"
}

response  = requests.post(url, headers=headers, data=data)
print(response.json())