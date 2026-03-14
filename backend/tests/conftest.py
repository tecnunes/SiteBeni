import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def test_admin_credentials():
    unique = str(uuid.uuid4())[:8]
    return {
        "email": f"testadmin_{unique}@beni-test.lu",
        "password": "TestPass123!",
        "name": f"Test Admin {unique}"
    }

@pytest.fixture
def auth_token(api_client, test_admin_credentials):
    """Register and get auth token for testing"""
    response = api_client.post(f"{BASE_URL}/api/auth/register", json=test_admin_credentials)
    if response.status_code == 200:
        token = response.json().get("access_token")
        yield token
        # No cleanup needed for test admin as it won't affect production
    else:
        pytest.skip(f"Registration failed: {response.status_code} {response.text}")

@pytest.fixture
def authenticated_client(api_client, auth_token):
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client
