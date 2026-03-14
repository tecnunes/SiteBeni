import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestAuth:
    """Test admin authentication endpoints"""

    def test_api_health(self):
        """Backend API is reachable"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "online"

    def test_register_new_admin(self):
        """Register a new admin returns token and user data"""
        unique = str(uuid.uuid4())[:8]
        payload = {
            "email": f"test_{unique}@beni.lu",
            "password": "TestPass123!",
            "name": f"Test Admin {unique}"
        }
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["admin"]["email"] == payload["email"]
        assert data["admin"]["name"] == payload["name"]
        assert "id" in data["admin"]

    def test_register_duplicate_email_fails(self):
        """Registering with existing email returns 400"""
        unique = str(uuid.uuid4())[:8]
        payload = {
            "email": f"dup_{unique}@beni.lu",
            "password": "TestPass123!",
            "name": "Test User"
        }
        # First register
        requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        # Second register with same email
        response = requests.post(f"{BASE_URL}/api/auth/register", json=payload)
        assert response.status_code == 400
        assert "already registered" in response.json().get("detail", "").lower()

    def test_login_valid_credentials(self):
        """Login with valid credentials returns token"""
        unique = str(uuid.uuid4())[:8]
        email = f"login_{unique}@beni.lu"
        password = "TestLogin123!"
        # Register first
        requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email, "password": password, "name": "Login Test"
        })
        # Login
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": email, "password": password
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["admin"]["email"] == email

    def test_login_invalid_credentials(self):
        """Login with wrong password returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@beni.lu",
            "password": "wrongpass"
        })
        assert response.status_code == 401

    def test_get_me_with_valid_token(self):
        """GET /auth/me with valid token returns admin info"""
        unique = str(uuid.uuid4())[:8]
        email = f"me_{unique}@beni.lu"
        reg_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": email, "password": "Test123!", "name": "Me Test"
        })
        token = reg_response.json().get("access_token")
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["email"] == email

    def test_get_me_without_token_fails(self):
        """GET /auth/me without token returns 403"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403]
