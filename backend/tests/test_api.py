import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


@pytest.fixture(scope="module")
def admin_token():
    """Create an admin and return token for module-level tests"""
    unique = str(uuid.uuid4())[:8]
    response = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": f"menutest_{unique}@beni.lu",
        "password": "Test123!",
        "name": f"Menu Tester {unique}"
    })
    if response.status_code != 200:
        pytest.skip("Could not create admin for menu tests")
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


class TestWeeklyMenu:
    """Test weekly menu CRUD endpoints"""

    def test_get_active_menu_public(self):
        """GET /weekly-menu is public and returns menu or null"""
        response = requests.get(f"{BASE_URL}/api/weekly-menu")
        assert response.status_code == 200
        # Can be null or a menu object
        data = response.json()
        assert data is None or isinstance(data, dict)

    def test_get_all_menus_requires_auth(self):
        """GET /weekly-menu/all should require auth (BUG-001: currently public/unauthenticated)"""
        response = requests.get(f"{BASE_URL}/api/weekly-menu/all")
        # BUG-001: This endpoint is currently public and returns 200.
        # It should be protected with admin auth. Marking as known bug.
        # Expected: 401 or 403 — Actual: 200 (security issue)
        assert response.status_code in [401, 403], (
            f"BUG-001: /api/weekly-menu/all is publicly accessible (returns {response.status_code}), "
            "but should require admin authentication"
        )

    def test_get_all_menus_with_auth(self, auth_headers):
        """GET /weekly-menu/all with auth returns list"""
        response = requests.get(f"{BASE_URL}/api/weekly-menu/all", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_create_menu_requires_auth(self):
        """POST /weekly-menu without auth fails"""
        response = requests.post(f"{BASE_URL}/api/weekly-menu", json={
            "week_start": "2026-03-10",
            "week_end": "2026-03-14",
            "dishes": []
        })
        assert response.status_code in [401, 403]

    def test_create_menu_with_auth(self, auth_headers):
        """POST /weekly-menu creates menu and returns data"""
        payload = {
            "week_start": "2026-03-10",
            "week_end": "2026-03-14",
            "price_full": 28.90,
            "price_entree_plat": 24.90,
            "price_plat_dessert": 23.90,
            "price_plat_only": 17.90,
            "dishes": [
                {
                    "id": str(uuid.uuid4()),
                    "name_fr": "Boeuf Bourguignon Test",
                    "name_en": "Beef Bourguignon Test",
                    "name_pt": "Boeuf Bourguignon Teste",
                    "description_fr": "Plat de viande test",
                    "description_en": "Test meat dish",
                    "description_pt": "Prato de carne teste",
                    "category": "meat",
                    "image_url": ""
                }
            ]
        }
        response = requests.post(f"{BASE_URL}/api/weekly-menu", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["week_start"] == "2026-03-10"
        assert data["week_end"] == "2026-03-14"
        assert data["is_active"] is True
        assert len(data["dishes"]) == 1
        assert data["dishes"][0]["name_fr"] == "Boeuf Bourguignon Test"
        assert data["price_full"] == 28.90
        # Store menu_id for later tests
        TestWeeklyMenu.created_menu_id = data["id"]

    def test_get_active_menu_after_create(self, auth_headers):
        """GET /weekly-menu returns the active menu after creation"""
        if not hasattr(TestWeeklyMenu, 'created_menu_id'):
            pytest.skip("No menu created yet")
        response = requests.get(f"{BASE_URL}/api/weekly-menu")
        assert response.status_code == 200
        data = response.json()
        assert data is not None
        assert data["is_active"] is True

    def test_update_menu_with_auth(self, auth_headers):
        """PUT /weekly-menu/{id} updates the menu"""
        if not hasattr(TestWeeklyMenu, 'created_menu_id'):
            pytest.skip("No menu created yet")
        menu_id = TestWeeklyMenu.created_menu_id
        payload = {
            "week_start": "2026-03-10",
            "week_end": "2026-03-14",
            "price_full": 29.90,
            "price_entree_plat": 25.90,
            "price_plat_dessert": 24.90,
            "price_plat_only": 18.90,
            "dishes": []
        }
        response = requests.put(f"{BASE_URL}/api/weekly-menu/{menu_id}", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["price_full"] == 29.90

    def test_delete_menu_with_auth(self, auth_headers):
        """DELETE /weekly-menu/{id} removes the menu"""
        if not hasattr(TestWeeklyMenu, 'created_menu_id'):
            pytest.skip("No menu created yet")
        menu_id = TestWeeklyMenu.created_menu_id
        response = requests.delete(f"{BASE_URL}/api/weekly-menu/{menu_id}", headers=auth_headers)
        assert response.status_code == 200
        assert response.json().get("message") == "Menu deleted"
        # Verify deletion
        all_menus = requests.get(f"{BASE_URL}/api/weekly-menu/all", headers=auth_headers)
        menu_ids = [m["id"] for m in all_menus.json()]
        assert menu_id not in menu_ids


class TestSiteSettings:
    """Test site settings endpoint"""

    def test_get_settings_public(self):
        """GET /settings is public"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "restaurant_name" in data
        assert data["restaurant_name"] == "BÉNI"
        assert "address" in data
        assert "phone" in data


class TestReservations:
    """Test reservations CRUD endpoints"""

    created_reservation_id = None

    def test_create_reservation_public(self):
        """POST /reservations is public, creates a reservation"""
        unique = str(uuid.uuid4())[:8]
        payload = {
            "name": f"TEST_User_{unique}",
            "email": f"test_{unique}@example.com",
            "phone": "+352 661 000 000",
            "date": "2026-04-15",
            "time": "12:30",
            "guests": 2,
            "notes": "Test reservation - please ignore"
        }
        response = requests.post(f"{BASE_URL}/api/reservations", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert data["date"] == "2026-04-15"
        assert data["time"] == "12:30"
        assert data["guests"] == 2
        assert data["status"] == "pending"
        assert "id" in data
        TestReservations.created_reservation_id = data["id"]

    def test_get_reservations_requires_auth(self):
        """GET /reservations without auth fails"""
        response = requests.get(f"{BASE_URL}/api/reservations")
        assert response.status_code in [401, 403]

    def test_get_reservations_with_auth(self, auth_headers):
        """GET /reservations with auth returns list"""
        response = requests.get(f"{BASE_URL}/api/reservations", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_update_reservation_status(self, auth_headers):
        """PUT /reservations/{id}/status updates status"""
        if not TestReservations.created_reservation_id:
            pytest.skip("No reservation created yet")
        res_id = TestReservations.created_reservation_id
        response = requests.put(
            f"{BASE_URL}/api/reservations/{res_id}/status?status=confirmed",
            headers=auth_headers
        )
        assert response.status_code == 200
        # Verify change via GET
        all_res = requests.get(f"{BASE_URL}/api/reservations", headers=auth_headers)
        found = next((r for r in all_res.json() if r["id"] == res_id), None)
        assert found is not None
        assert found["status"] == "confirmed"

    def test_update_invalid_status(self, auth_headers):
        """PUT /reservations/{id}/status with invalid status fails"""
        if not TestReservations.created_reservation_id:
            pytest.skip("No reservation created yet")
        res_id = TestReservations.created_reservation_id
        response = requests.put(
            f"{BASE_URL}/api/reservations/{res_id}/status?status=invalid",
            headers=auth_headers
        )
        assert response.status_code == 400

    def test_delete_reservation(self, auth_headers):
        """DELETE /reservations/{id} removes a reservation"""
        if not TestReservations.created_reservation_id:
            pytest.skip("No reservation created yet")
        res_id = TestReservations.created_reservation_id
        response = requests.delete(f"{BASE_URL}/api/reservations/{res_id}", headers=auth_headers)
        assert response.status_code == 200
        # Verify deletion
        all_res = requests.get(f"{BASE_URL}/api/reservations", headers=auth_headers)
        ids = [r["id"] for r in all_res.json()]
        assert res_id not in ids
