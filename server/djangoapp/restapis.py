# Uncomment the imports below before you add the function code

import os
from dotenv import load_dotenv
import requests
import json

load_dotenv()

backend_url = os.getenv(
    'backend_url', default="http://localhost:3030")
sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url',
    default="http://localhost:5050/")


def get_request(endpoint, **kwargs):
    params = "&".join([f"{key}={value}" for key, value in kwargs.items()])
    request_url = backend_url + endpoint + ("?" + params if params else "")
    print("Constructed URL:", request_url)  # Debugging the full URL

    try:
        response = requests.get(request_url)
        response.raise_for_status()  # Raise HTTP errors
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except requests.exceptions.ConnectionError as conn_err:
        print(f"Connection error occurred: {conn_err}")
    except requests.exceptions.Timeout as timeout_err:
        print(f"Timeout error occurred: {timeout_err}")
    except requests.exceptions.RequestException as req_err:
        print(f"Request error occurred: {req_err}")
    return None


def analyze_review_sentiments(text):
    request_url = sentiment_analyzer_url+"analyze/"+text
    try:
        # Call get method of requests library with URL and parameters
        response = requests.get(request_url)
        return response.json()
    except Exception as err:
        print(f"Unexpected {err=}, {type(err)=}")
        print("Network exception occurred")

# Add code for posting review
def post_review(data_dict):
    request_url = backend_url + "/insert_review"
    try:
        response = requests.post(request_url, json=data_dict)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        response_data = response.json()

        # Ensure the backend response contains a status field
        if "status" in response_data and response_data["status"] == 200:
            print("Review posted successfully:", response_data)
            return response_data
        else:
            print("Error in backend response:", response_data)
            return {"status": 500, "message": "Failed to post review"}
    except requests.exceptions.RequestException as e:
        print("Network exception occurred:", e)
        return {"status": 500, "message": "Network error while submitting review"}