#!/usr/bin/env python3
"""
Backend test for Torque Inspection Mobile - NEW endpoints
Tests: ALBUM, DETAILED INSPECTION REPORT, SAAQ REGRESSION
"""
import requests
import json
import uuid
from datetime import datetime

# Base URL from frontend/.env
BASE_URL = "https://job-dispatch-61.preview.emergentagent.com/api"

# Admin credentials
ADMIN_EMAIL = "admin@torqueelite.com"
ADMIN_PASSWORD = "admin123"

# Test image (1x1 transparent PNG base64)
TEST_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

def print_test_header(test_num, description):
    print("\n" + "="*80)
    print(f"TEST {test_num}: {description}")
    print("="*80)

def print_result(passed, message):
    if passed:
        print(f"✓ {message}")
    else:
        print(f"❌ {message}")

# ============================================================================
# ALBUM TESTS
# ============================================================================

def test_album_public_get_without_token():
    """Test GET /api/album without token (should return 200, public endpoint)"""
    print_test_header(1, "GET /api/album without token (public)")
    
    response = requests.get(f"{BASE_URL}/album")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print_result(False, f"Expected 200, got {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    data = response.json()
    if not isinstance(data, list):
        print_result(False, f"Expected list, got {type(data)}")
        return False
    
    print_result(True, f"Public GET /api/album returns 200 with list (length: {len(data)})")
    print(f"✅ TEST 1 PASSED")
    return True


def test_album_post_without_token():
    """Test POST /api/album without token (should return 401/403)"""
    print_test_header(2, "POST /api/album without token (should fail)")
    
    album_data = {
        "image": TEST_IMAGE,
        "caption": "Test without auth"
    }
    
    response = requests.post(f"{BASE_URL}/album", json=album_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code not in [401, 403]:
        print_result(False, f"Expected 401 or 403, got {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    print_result(True, f"POST /api/album without token correctly returns {response.status_code}")
    print(f"✅ TEST 2 PASSED")
    return True


def test_admin_login():
    """Test admin login and return token"""
    print_test_header(3, "Admin Login")
    
    login_data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print_result(False, f"Expected 200, got {response.status_code}")
        print(f"Response: {response.text}")
        return None
    
    data = response.json()
    
    if "token" not in data or "user" not in data:
        print_result(False, "Missing token or user in response")
        return None
    
    user = data["user"]
    if user.get("role") != "admin":
        print_result(False, f"Expected role 'admin', got '{user.get('role')}'")
        return None
    
    print_result(True, f"Admin logged in successfully (email: {user.get('email')})")
    print(f"✅ TEST 3 PASSED")
    return data["token"]


def test_album_post_with_admin_token(admin_token):
    """Test POST /api/album with admin token (should return 200 with id, data, caption)"""
    print_test_header(4, "POST /api/album with admin token")
    
    album_data = {
        "image": TEST_IMAGE,
        "caption": "Test Album Image"
    }
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.post(f"{BASE_URL}/album", json=album_data, headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print_result(False, f"Expected 200, got {response.status_code}")
        print(f"Response: {response.text}")
        return None
    
    data = response.json()
    
    # Verify response has id, data, caption
    if "id" not in data:
        print_result(False, "Missing 'id' in response")
        return None
    
    if "data" not in data:
        print_result(False, "Missing 'data' in response")
        return None
    
    if "caption" not in data:
        print_result(False, "Missing 'caption' in response")
        return None
    
    if data["caption"] != "Test Album Image":
        print_result(False, f"Expected caption 'Test Album Image', got '{data['caption']}'")
        return None
    
    print_result(True, f"Album image created with id: {data['id']}")
    print_result(True, f"Caption: {data['caption']}")
    print_result(True, f"Data field present: {len(data['data'])} chars")
    print(f"✅ TEST 4 PASSED")
    return data["id"]


def test_album_get_includes_new_image(image_id):
    """Test GET /api/album includes the newly created image"""
    print_test_header(5, "GET /api/album includes new image")
    
    response = requests.get(f"{BASE_URL}/album")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print_result(False, f"Expected 200, got {response.status_code}")
        return False
    
    data = response.json()
    
    # Find the image we just created
    found = False
    for item in data:
        if item.get("id") == image_id:
            found = True
            print_result(True, f"Found image with id: {image_id}")
            print_result(True, f"Caption: {item.get('caption')}")
            break
    
    if not found:
        print_result(False, f"Image {image_id} not found in album list")
        return False
    
    print(f"✅ TEST 5 PASSED")
    return True


def test_album_delete_with_admin_token(admin_token, image_id):
    """Test DELETE /api/album/{id} with admin token (should return 200 {ok:true})"""
    print_test_header(6, f"DELETE /api/album/{image_id} with admin token")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.delete(f"{BASE_URL}/album/{image_id}", headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print_result(False, f"Expected 200, got {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    data = response.json()
    
    if not data.get("ok"):
        print_result(False, f"Expected {{ok: true}}, got {data}")
        return False
    
    print_result(True, "Album image deleted successfully")
    print(f"✅ TEST 6 PASSED")
    return True


def test_album_delete_unknown_id(admin_token):
    """Test DELETE /api/album/{unknown_id} (should return 404)"""
    print_test_header(7, "DELETE /api/album/{unknown_id} (should return 404)")
    
    unknown_id = str(uuid.uuid4())
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.delete(f"{BASE_URL}/album/{unknown_id}", headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 404:
        print_result(False, f"Expected 404, got {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    print_result(True, "DELETE unknown album image correctly returns 404")
    print(f"✅ TEST 7 PASSED")
    return True


def test_album_delete_without_token():
    """Test DELETE /api/album/{id} without token (should return 401/403)"""
    print_test_header(8, "DELETE /api/album/{id} without token (should fail)")
    
    fake_id = str(uuid.uuid4())
    response = requests.delete(f"{BASE_URL}/album/{fake_id}")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code not in [401, 403]:
        print_result(False, f"Expected 401 or 403, got {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    print_result(True, f"DELETE /api/album without token correctly returns {response.status_code}")
    print(f"✅ TEST 8 PASSED")
    return True


# ============================================================================
# DETAILED INSPECTION REPORT TESTS
# ============================================================================

def test_create_booking_for_inspection():
    """Create a booking to get an inspection id with status paid"""
    print_test_header(9, "Create booking for inspection report testing")
    
    unique_email = f"client_{uuid.uuid4().hex[:8]}@test.com"
    
    booking_data = {
        "client_name": "Marie Dubois",
        "client_email": unique_email,
        "client_phone": "514-555-9876",
        "client_password": "testpass456",
        "service_type": "Inspection Pré-achat",
        "vehicle_make": "Ford",
        "vehicle_model": "Escape",
        "vehicle_year": "2020",
        "location_address": "456 rue Test, Québec"
    }
    
    print(f"Creating booking with email: {unique_email}")
    
    response = requests.post(f"{BASE_URL}/bookings", json=booking_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print_result(False, f"Expected 200, got {response.status_code}")
        print(f"Response: {response.text}")
        return None, None
    
    data = response.json()
    
    if "inspection" not in data:
        print_result(False, "Missing 'inspection' in response")
        return None, None
    
    inspection = data["inspection"]
    inspection_id = inspection.get("id")
    status = inspection.get("status")
    
    if status != "paid":
        print_result(False, f"Expected status 'paid', got '{status}'")
        return None, None
    
    print_result(True, f"Booking created with inspection id: {inspection_id}")
    print_result(True, f"Inspection status: {status}")
    print(f"✅ TEST 9 PASSED")
    return inspection_id, data.get("token")


def test_inspection_report_incomplete(admin_token, inspection_id):
    """Test POST /api/inspections/{id}/inspection-report with complete=false"""
    print_test_header(10, f"POST /api/inspections/{inspection_id}/inspection-report (complete=false)")
    
    report_data = {
        "report": {
            "grade": "B",
            "report_type": "Préachat",
            "vehicle": {
                "make": "Ford"
            },
            "checklist": {
                "structure": {
                    "Châssis": {
                        "state": "OK",
                        "comment": "bon"
                    }
                },
                "summary": {
                    "recommendation": "OK"
                }
            }
        },
        "complete": False
    }
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.post(f"{BASE_URL}/inspections/{inspection_id}/inspection-report", 
                            json=report_data, headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print_result(False, f"Expected 200, got {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    data = response.json()
    
    # Verify detailed_report is present
    if "detailed_report" not in data:
        print_result(False, "Missing 'detailed_report' in response")
        return False
    
    detailed_report = data["detailed_report"]
    
    # Verify grade is "B"
    if detailed_report.get("grade") != "B":
        print_result(False, f"Expected grade 'B', got '{detailed_report.get('grade')}'")
        return False
    
    print_result(True, f"detailed_report present with grade: {detailed_report.get('grade')}")
    
    # Verify status is still "paid" (not completed)
    status = data.get("status")
    if status != "paid":
        print_result(False, f"Expected status 'paid' (complete=false), got '{status}'")
        return False
    
    print_result(True, f"Status remains 'paid' (complete=false)")
    print(f"✅ TEST 10 PASSED")
    return True


def test_inspection_report_complete(admin_token, inspection_id):
    """Test POST /api/inspections/{id}/inspection-report with complete=true"""
    print_test_header(11, f"POST /api/inspections/{inspection_id}/inspection-report (complete=true)")
    
    report_data = {
        "report": {
            "grade": "A",
            "report_type": "Préachat",
            "vehicle": {
                "make": "Ford",
                "model": "Escape"
            },
            "checklist": {
                "structure": {
                    "Châssis": {
                        "state": "Excellent",
                        "comment": "très bon état"
                    }
                },
                "summary": {
                    "recommendation": "Recommandé"
                }
            }
        },
        "complete": True
    }
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.post(f"{BASE_URL}/inspections/{inspection_id}/inspection-report", 
                            json=report_data, headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print_result(False, f"Expected 200, got {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    data = response.json()
    
    # Verify detailed_report is present
    if "detailed_report" not in data:
        print_result(False, "Missing 'detailed_report' in response")
        return False
    
    detailed_report = data["detailed_report"]
    print_result(True, f"detailed_report present with grade: {detailed_report.get('grade')}")
    
    # Verify status is now "completed"
    status = data.get("status")
    if status != "completed":
        print_result(False, f"Expected status 'completed' (complete=true), got '{status}'")
        return False
    
    print_result(True, f"Status changed to 'completed' (complete=true)")
    print(f"✅ TEST 11 PASSED")
    return True


def test_inspection_report_persisted(admin_token, inspection_id):
    """Test GET /api/inspections/{id} to verify detailed_report is persisted"""
    print_test_header(12, f"GET /api/inspections/{inspection_id} (verify detailed_report persisted)")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.get(f"{BASE_URL}/inspections/{inspection_id}", headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print_result(False, f"Expected 200, got {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    data = response.json()
    
    # Verify detailed_report is present
    if "detailed_report" not in data:
        print_result(False, "Missing 'detailed_report' in persisted inspection")
        return False
    
    detailed_report = data["detailed_report"]
    print_result(True, f"detailed_report persisted with grade: {detailed_report.get('grade')}")
    
    # Verify status is "completed"
    status = data.get("status")
    if status != "completed":
        print_result(False, f"Expected status 'completed', got '{status}'")
        return False
    
    print_result(True, f"Status is 'completed'")
    print(f"✅ TEST 12 PASSED")
    return True


def test_inspection_report_client_access_control(client_token, inspection_id):
    """Test POST /api/inspections/{id}/inspection-report with client token (should return 403)"""
    print_test_header(13, "POST inspection-report with client token (should return 403)")
    
    report_data = {
        "report": {
            "grade": "C"
        },
        "complete": False
    }
    
    headers = {"Authorization": f"Bearer {client_token}"}
    response = requests.post(f"{BASE_URL}/inspections/{inspection_id}/inspection-report", 
                            json=report_data, headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 403:
        print_result(False, f"Expected 403, got {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    print_result(True, "Client token correctly denied access (403)")
    print(f"✅ TEST 13 PASSED")
    return True


# ============================================================================
# SAAQ REGRESSION TEST
# ============================================================================

def test_saaq_regression():
    """Test that default service_type no longer contains 'SAAQ'"""
    print_test_header(14, "SAAQ Regression - verify service_type doesn't contain 'SAAQ'")
    
    unique_email = f"client_{uuid.uuid4().hex[:8]}@test.com"
    
    # Create booking WITHOUT service_type (should use default)
    booking_data = {
        "client_name": "Pierre Lavoie",
        "client_email": unique_email,
        "client_phone": "514-555-1111",
        "client_password": "testpass789",
        # NO service_type field - should use default
        "vehicle_make": "Toyota",
        "vehicle_model": "Camry",
        "vehicle_year": "2019",
        "location_address": "789 rue Test, Laval"
    }
    
    print(f"Creating booking WITHOUT service_type (should use default)")
    print(f"Email: {unique_email}")
    
    response = requests.post(f"{BASE_URL}/bookings", json=booking_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print_result(False, f"Expected 200, got {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    data = response.json()
    
    if "inspection" not in data:
        print_result(False, "Missing 'inspection' in response")
        return False
    
    inspection = data["inspection"]
    service_type = inspection.get("service_type")
    
    print(f"service_type: '{service_type}'")
    
    # Verify service_type does NOT contain 'SAAQ'
    if service_type and "SAAQ" in service_type:
        print_result(False, f"service_type contains 'SAAQ': '{service_type}'")
        return False
    
    print_result(True, f"service_type does NOT contain 'SAAQ': '{service_type}'")
    
    # Verify it equals the expected default
    expected_default = "Inspection PEP / Pré-achat"
    if service_type != expected_default:
        print_result(False, f"Expected default '{expected_default}', got '{service_type}'")
        return False
    
    print_result(True, f"service_type equals expected default: '{expected_default}'")
    print(f"✅ TEST 14 PASSED")
    return True


# ============================================================================
# MAIN TEST RUNNER
# ============================================================================

def main():
    print("\n" + "="*80)
    print("BACKEND TEST: NEW ENDPOINTS - ALBUM, DETAILED REPORT, SAAQ REGRESSION")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Time: {datetime.now().isoformat()}")
    
    test_results = []
    
    # ALBUM TESTS
    test_results.append(("GET /api/album (public)", test_album_public_get_without_token()))
    test_results.append(("POST /api/album without token", test_album_post_without_token()))
    
    admin_token = test_admin_login()
    if not admin_token:
        print("\n❌ CRITICAL: Admin login failed, cannot continue")
        return 1
    test_results.append(("Admin login", True))
    
    image_id = test_album_post_with_admin_token(admin_token)
    if not image_id:
        print("\n❌ CRITICAL: Album image creation failed")
        return 1
    test_results.append(("POST /api/album (admin)", True))
    
    test_results.append(("GET /api/album includes new image", test_album_get_includes_new_image(image_id)))
    test_results.append(("DELETE /api/album/{id} (admin)", test_album_delete_with_admin_token(admin_token, image_id)))
    test_results.append(("DELETE /api/album/{unknown_id}", test_album_delete_unknown_id(admin_token)))
    test_results.append(("DELETE /api/album without token", test_album_delete_without_token()))
    
    # DETAILED INSPECTION REPORT TESTS
    inspection_id, client_token = test_create_booking_for_inspection()
    if not inspection_id:
        print("\n❌ CRITICAL: Booking creation failed")
        return 1
    test_results.append(("Create booking for inspection", True))
    
    test_results.append(("POST inspection-report (complete=false)", 
                        test_inspection_report_incomplete(admin_token, inspection_id)))
    test_results.append(("POST inspection-report (complete=true)", 
                        test_inspection_report_complete(admin_token, inspection_id)))
    test_results.append(("GET inspection (verify persisted)", 
                        test_inspection_report_persisted(admin_token, inspection_id)))
    test_results.append(("POST inspection-report (client access control)", 
                        test_inspection_report_client_access_control(client_token, inspection_id)))
    
    # SAAQ REGRESSION TEST
    test_results.append(("SAAQ regression (no 'SAAQ' in default service_type)", test_saaq_regression()))
    
    # SUMMARY
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print("\n" + "="*80)
    if passed == total:
        print(f"✅ ALL {total} TESTS PASSED")
        print("="*80)
        return 0
    else:
        print(f"❌ {total - passed} of {total} TESTS FAILED")
        print("="*80)
        return 1


if __name__ == "__main__":
    exit(main())
