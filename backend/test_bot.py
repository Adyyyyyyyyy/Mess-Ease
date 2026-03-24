import requests

url = "http://127.0.0.1:8000/bot"

data = {
    "Body": "status",
    "From": "+911234567890"
}

response = requests.post(url, data=data)

print(response.status_code)
print(response.text)   # IMPORTANT (not .json())