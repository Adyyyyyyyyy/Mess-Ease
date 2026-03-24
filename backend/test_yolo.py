import requests

# simulate detected people
people_count = 70

# send to backend
url = f"http://127.0.0.1:8000/update-count?people={people_count}"

response = requests.get(url)

print(response.json())