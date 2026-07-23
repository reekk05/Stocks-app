# import requests

# url = "https://api.upstox.com/v2/login/authorization/token"

# headers={
#     "Content-type": "application/x-www-form-urlencoded",
#     "Accept": "application/json"
# }
# data={
#     "code":"MNkk2M",
#     "client_id":"8fb1476d-0652-4f8d-b679-1705a15b8616",
#     "client_secret": "d78xlijoqx",
#     "redirect_uri": "https://webhook.site/ab7e4e9c-badc-4bb4-ae46-6df4e6021ad6",
#     "grant_type": "authorization_code"
# }

# response  = requests.post(url, headers=headers, data=data)
# print(response.json())