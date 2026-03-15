import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


@pytest.fixture(scope="module")
def admin_token():
    """Login as default admin and return token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin",
        "password": "#Sti93qn06301616"
    })
    if response.status_code != 200:
        pytest.skip("Could not login as admin for gallery tests")
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


class TestGalleryAPI:
    """Test Gallery CRUD endpoints"""
    
    created_image_ids = []
    
    def test_get_gallery_public(self):
        """GET /gallery is public and returns list"""
        response = requests.get(f"{BASE_URL}/api/gallery")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_gallery_by_category_public(self):
        """GET /gallery/{category} is public"""
        for category in ['ambiance', 'dishes', 'team']:
            response = requests.get(f"{BASE_URL}/api/gallery/{category}")
            assert response.status_code == 200
            assert isinstance(response.json(), list)
    
    def test_create_gallery_image_requires_auth(self):
        """POST /gallery without auth fails"""
        response = requests.post(f"{BASE_URL}/api/gallery", json={
            "url": "https://example.com/test.jpg",
            "category": "ambiance"
        })
        assert response.status_code in [401, 403]
    
    def test_create_gallery_image_ambiance(self, auth_headers):
        """POST /gallery creates ambiance image"""
        unique = str(uuid.uuid4())[:8]
        payload = {
            "url": f"https://images.unsplash.com/TEST_{unique}_ambiance.jpg",
            "category": "ambiance",
            "alt_fr": f"Test Ambiance FR {unique}",
            "alt_en": f"Test Ambiance EN {unique}",
            "alt_pt": f"Test Ambiance PT {unique}",
            "sort_order": 0
        }
        response = requests.post(f"{BASE_URL}/api/gallery", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["url"] == payload["url"]
        assert data["category"] == "ambiance"
        assert data["alt_fr"] == payload["alt_fr"]
        assert "id" in data
        assert "created_at" in data
        TestGalleryAPI.created_image_ids.append(data["id"])
        
        # Verify via GET
        verify = requests.get(f"{BASE_URL}/api/gallery")
        assert any(img["id"] == data["id"] for img in verify.json())
    
    def test_create_gallery_image_dishes(self, auth_headers):
        """POST /gallery creates dishes image"""
        unique = str(uuid.uuid4())[:8]
        payload = {
            "url": f"https://images.unsplash.com/TEST_{unique}_dishes.jpg",
            "category": "dishes",
            "alt_fr": f"Test Plats FR {unique}",
            "alt_en": f"Test Dishes EN {unique}",
            "alt_pt": f"Test Pratos PT {unique}",
            "sort_order": 1
        }
        response = requests.post(f"{BASE_URL}/api/gallery", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "dishes"
        TestGalleryAPI.created_image_ids.append(data["id"])
        
        # Verify via category endpoint
        verify = requests.get(f"{BASE_URL}/api/gallery/dishes")
        assert any(img["id"] == data["id"] for img in verify.json())
    
    def test_create_gallery_image_team(self, auth_headers):
        """POST /gallery creates team image"""
        unique = str(uuid.uuid4())[:8]
        payload = {
            "url": f"https://images.unsplash.com/TEST_{unique}_team.jpg",
            "category": "team",
            "alt_fr": f"Test Équipe FR {unique}",
            "alt_en": f"Test Team EN {unique}",
            "alt_pt": f"Test Equipe PT {unique}",
            "sort_order": 2
        }
        response = requests.post(f"{BASE_URL}/api/gallery", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "team"
        TestGalleryAPI.created_image_ids.append(data["id"])
    
    def test_update_gallery_image_requires_auth(self, auth_headers):
        """PUT /gallery/{id} without auth fails"""
        if not TestGalleryAPI.created_image_ids:
            pytest.skip("No images created yet")
        image_id = TestGalleryAPI.created_image_ids[0]
        response = requests.put(f"{BASE_URL}/api/gallery/{image_id}", json={
            "url": "https://example.com/updated.jpg",
            "category": "dishes"
        })
        assert response.status_code in [401, 403]
    
    def test_update_gallery_image(self, auth_headers):
        """PUT /gallery/{id} updates image"""
        if not TestGalleryAPI.created_image_ids:
            pytest.skip("No images created yet")
        image_id = TestGalleryAPI.created_image_ids[0]
        unique = str(uuid.uuid4())[:8]
        payload = {
            "url": f"https://images.unsplash.com/UPDATED_{unique}.jpg",
            "category": "dishes",
            "alt_fr": f"Updated FR {unique}",
            "alt_en": f"Updated EN {unique}",
            "alt_pt": f"Updated PT {unique}",
            "sort_order": 99
        }
        response = requests.put(f"{BASE_URL}/api/gallery/{image_id}", json=payload, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "dishes"
        assert data["alt_fr"] == payload["alt_fr"]
        assert data["sort_order"] == 99
        
        # Verify via GET
        verify = requests.get(f"{BASE_URL}/api/gallery/dishes")
        found = next((img for img in verify.json() if img["id"] == image_id), None)
        assert found is not None
        assert found["alt_fr"] == payload["alt_fr"]
    
    def test_update_nonexistent_image(self, auth_headers):
        """PUT /gallery/{id} with invalid id returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.put(f"{BASE_URL}/api/gallery/{fake_id}", json={
            "url": "https://example.com/test.jpg",
            "category": "ambiance"
        }, headers=auth_headers)
        assert response.status_code == 404
    
    def test_delete_gallery_image_requires_auth(self):
        """DELETE /gallery/{id} without auth fails"""
        if not TestGalleryAPI.created_image_ids:
            pytest.skip("No images created yet")
        image_id = TestGalleryAPI.created_image_ids[-1]
        response = requests.delete(f"{BASE_URL}/api/gallery/{image_id}")
        assert response.status_code in [401, 403]
    
    def test_delete_gallery_images(self, auth_headers):
        """DELETE /gallery/{id} removes images"""
        for image_id in TestGalleryAPI.created_image_ids:
            response = requests.delete(f"{BASE_URL}/api/gallery/{image_id}", headers=auth_headers)
            assert response.status_code == 200
            assert response.json().get("message") == "Gallery image deleted"
            
            # Verify deletion
            all_images = requests.get(f"{BASE_URL}/api/gallery")
            assert not any(img["id"] == image_id for img in all_images.json())
        
        TestGalleryAPI.created_image_ids.clear()
    
    def test_delete_nonexistent_image(self, auth_headers):
        """DELETE /gallery/{id} with invalid id returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(f"{BASE_URL}/api/gallery/{fake_id}", headers=auth_headers)
        assert response.status_code == 404
