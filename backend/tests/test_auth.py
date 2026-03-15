import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Default admin credentials (seeded at startup)
DEFAULT_ADMIN_EMAIL = "admin"
DEFAULT_ADMIN_PASSWORD = "#Sti93qn06301616"


def get_admin_token():
    """Login as default admin and return token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": DEFAULT_ADMIN_EMAIL,
        "password": DEFAULT_ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    return None


class TestAuth:
    """Test admin authentication endpoints"""

    def test_api_health(self):
        """Backend API is reachable"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "online"

    def test_register_requires_auth(self):
        """Register without auth fails (only admins can create admins)"""
        unique = str(uuid.uuid4())[:8]
        payload = {
            "email": f"test_{unique}@beni.lu",
            "password": "TestPass123!",
            "name": f"Test Admin {unique}"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        # Registration requires authentication
        assert response.status_code in [401, 403]

    def test_register_new_admin_with_auth(self):
        """Register a new admin (authenticated) returns token and user data"""
        token = get_admin_token()
        if not token:
            pytest.skip("Could not login as default admin")
        
        unique = str(uuid.uuid4())[:8]
        payload = {
            "email": f"TEST_admin_{unique}@beni.lu",
            "password": "TestPass123!",
            "name": f"TEST Admin {unique}"
        }
        response = requests.post(
            f"{BASE_URL}/api/auth/register", 
            json=payload,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["admin"]["email"] == payload["email"]
        assert data["admin"]["name"] == payload["name"]
        assert "id" in data["admin"]
        
        # Cleanup: delete the created admin
        new_admin_id = data["admin"]["id"]
        requests.delete(
            f"{BASE_URL}/api/auth/admins/{new_admin_id}",
            headers={"Authorization": f"Bearer {token}"}
        )

    def test_register_duplicate_email_fails(self):
        """Registering with existing email returns 400"""
        token = get_admin_token()
        if not token:
            pytest.skip("Could not login as default admin")
        
        unique = str(uuid.uuid4())[:8]
        payload = {
            "email": f"TEST_dup_{unique}@beni.lu",
            "password": "TestPass123!",
            "name": "TEST User"
        }
        headers = {"Authorization": f"Bearer {token}"}
        # First register
        first_response = requests.post(f"{BASE_URL}/api/auth/register", json=payload, headers=headers)
        assert first_response.status_code == 200
        created_id = first_response.json()["admin"]["id"]
        
        # Second register with same email
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload, headers=headers)
        assert response.status_code == 400
        assert "already registered" in response.json().get("detail", "").lower()
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/auth/admins/{created_id}", headers=headers)

    def test_login_default_admin(self):
        """Login with default admin credentials returns token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": DEFAULT_ADMIN_EMAIL,
            "password": DEFAULT_ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["admin"]["email"] == DEFAULT_ADMIN_EMAIL

    def test_login_invalid_credentials(self):
        """Login with wrong password returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@beni.lu",
            "password": "wrongpass"
        })
        assert response.status_code == 401

    def test_get_me_with_valid_token(self):
        """GET /auth/me with valid token returns admin info"""
        token = get_admin_token()
        if not token:
            pytest.skip("Could not login as default admin")
        
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["email"] == DEFAULT_ADMIN_EMAIL

    def test_get_me_without_token_fails(self):
        """GET /auth/me without token returns 403"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403]
