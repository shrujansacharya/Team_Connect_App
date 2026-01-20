import requests

API_URL = "http://localhost:8000/api/auth/admin-login"
payload = {"password": "shrujan@2004"}

try:
    response = requests.post(API_URL, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
