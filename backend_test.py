#!/usr/bin/env python3
"""
Comprehensive backend API test for Torque Élite
Tests all endpoints with proper authentication and role-based access control
"""
import requests
import json
import sys

# Base URL from frontend .env
BASE_URL = "https://job-dispatch-61.preview.emergentagent.com/api"

# Test credentials
ADMIN_EMAIL = "admin@torqueelite.com"
ADMIN_PASSWORD = "admin123"

# Color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

# Test results tracking
test_results = []
failed_tests = []

def log_test(name, passed, details=""):
    """Log test result"""
    status = f"{GREEN}✓ PASS{RESET}" if passed else f"{RED}✗ FAIL{RESET}"
    print(f"{status} - {name}")
    if details:
        print(f"  {details}")
    test_results.append({"name": name, "passed": passed, "details": details})
    if not passed:
        failed_tests.append({"name": name, "details": details})

def test_admin_login():
    """Test 1: Admin login with correct credentials"""
    print(f"\n{BLUE}=== Test 1: Admin Login ==={RESET}")
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                user = data["user"]
                if user.get("role") == "admin" and user.get("email") == ADMIN_EMAIL:
                    log_test("Admin login", True, f"Token received, role: {user.get('role')}")
                    return data["token"]
                else:
                    log_test("Admin login", False, f"User data incorrect: {user}")
                    return None
            else:
                log_test("Admin login", False, f"Missing token or user in response: {data}")
                return None
        else:
            log_test("Admin login", False, f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("Admin login", False, f"Exception: {str(e)}")
        return None

def test_auth_me(token):
    """Test 2: GET /auth/me with admin token"""
    print(f"\n{BLUE}=== Test 2: GET /auth/me ==={RESET}")
    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        
        if response.status_code == 200:
            user = response.json()
            if user.get("role") == "admin" and user.get("email") == ADMIN_EMAIL:
                log_test("GET /auth/me", True, f"Admin user returned: {user.get('name')}")
                return True
            else:
                log_test("GET /auth/me", False, f"Incorrect user data: {user}")
                return False
        else:
            log_test("GET /auth/me", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("GET /auth/me", False, f"Exception: {str(e)}")
        return False

def test_wrong_password():
    """Test 3: Login with wrong password should return 401"""
    print(f"\n{BLUE}=== Test 3: Wrong Password Login ==={RESET}")
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": "wrongpassword123"
        })
        
        if response.status_code == 401:
            log_test("Wrong password returns 401", True, "Correctly rejected")
            return True
        else:
            log_test("Wrong password returns 401", False, f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        log_test("Wrong password returns 401", False, f"Exception: {str(e)}")
        return False

def test_create_employee(admin_token):
    """Test 4: Create employee user"""
    print(f"\n{BLUE}=== Test 4: Create Employee ==={RESET}")
    try:
        # Use a unique email with timestamp to avoid conflicts
        import time
        timestamp = str(int(time.time()))
        employee_data = {
            "name": "Jean Mécanicien",
            "email": f"jean.mecanicien.{timestamp}@torqueelite.com",
            "password": "employee123",
            "phone": "514-555-0101",
            "role": "employee"
        }
        
        response = requests.post(f"{BASE_URL}/users", 
            json=employee_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 200:
            user = response.json()
            if user.get("role") == "employee" and user.get("email") == employee_data["email"]:
                log_test("Create employee", True, f"Employee created: {user.get('id')}")
                return user
            else:
                log_test("Create employee", False, f"Incorrect user data: {user}")
                return None
        else:
            log_test("Create employee", False, f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("Create employee", False, f"Exception: {str(e)}")
        return None

def test_duplicate_email(admin_token, email):
    """Test 5: Creating duplicate email should return 400"""
    print(f"\n{BLUE}=== Test 5: Duplicate Email Check ==={RESET}")
    try:
        response = requests.post(f"{BASE_URL}/users", 
            json={
                "name": "Duplicate User",
                "email": email,
                "password": "test123",
                "role": "employee"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 400:
            log_test("Duplicate email returns 400", True, "Correctly rejected duplicate")
            return True
        else:
            log_test("Duplicate email returns 400", False, f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        log_test("Duplicate email returns 400", False, f"Exception: {str(e)}")
        return False

def test_list_users_with_passwords(admin_token):
    """Test 6: GET /users returns password field"""
    print(f"\n{BLUE}=== Test 6: List Users with Passwords ==={RESET}")
    try:
        response = requests.get(f"{BASE_URL}/users", 
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 200:
            users = response.json()
            if len(users) > 0:
                # Check if password field is present
                has_password = all("password" in user for user in users)
                if has_password:
                    log_test("List users includes passwords", True, f"Found {len(users)} users with password field")
                    return True
                else:
                    log_test("List users includes passwords", False, "Password field missing in some users")
                    return False
            else:
                log_test("List users includes passwords", False, "No users returned")
                return False
        else:
            log_test("List users includes passwords", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("List users includes passwords", False, f"Exception: {str(e)}")
        return False

def test_filter_users_by_role(admin_token):
    """Test 7: GET /users?role=employee filters correctly"""
    print(f"\n{BLUE}=== Test 7: Filter Users by Role ==={RESET}")
    try:
        response = requests.get(f"{BASE_URL}/users?role=employee", 
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 200:
            users = response.json()
            all_employees = all(user.get("role") == "employee" for user in users)
            if all_employees:
                log_test("Filter users by role", True, f"Found {len(users)} employees")
                return True
            else:
                log_test("Filter users by role", False, "Non-employee users in filtered results")
                return False
        else:
            log_test("Filter users by role", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Filter users by role", False, f"Exception: {str(e)}")
        return False

def test_create_booking(email_suffix=""):
    """Test 8: Public booking creation"""
    print(f"\n{BLUE}=== Test 8: Create Booking (Public) ==={RESET}")
    try:
        # Use email_suffix to create different clients
        email = f"marie.dubois{email_suffix}@example.com" if email_suffix else "marie.dubois@example.com"
        booking_data = {
            "client_name": "Marie Dubois",
            "client_email": email,
            "client_phone": "514-555-0202",
            "client_password": "client123",
            "service_type": "Inspection PEP / SAAQ / Pré-achat",
            "vehicle_make": "Toyota",
            "vehicle_model": "Camry",
            "vehicle_year": "2020",
            "vehicle_vin": "1HGBH41JXMN109186",
            "location_type": "RepairShop",
            "location_address": "123 Rue Saint-Laurent, Montréal, QC H2X 2T3",
            "contact_name": "Marie Dubois",
            "contact_phone": "514-555-0202",
            "components": [
                {"name": "Freins", "description": "Vérification complète"},
                {"name": "Moteur", "description": "Inspection générale"}
            ],
            "notes": "Inspection avant achat",
            "price": 149.0
        }
        
        response = requests.post(f"{BASE_URL}/bookings", json=booking_data)
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data and "inspection" in data:
                user = data["user"]
                inspection = data["inspection"]
                if (user.get("role") == "client" and 
                    inspection.get("status") == "paid"):
                    log_test("Create booking", True, 
                        f"Client created, inspection ID: {inspection.get('id')}, status: {inspection.get('status')}")
                    return data
                else:
                    log_test("Create booking", False, 
                        f"Incorrect data - user role: {user.get('role')}, inspection status: {inspection.get('status')}")
                    return None
            else:
                log_test("Create booking", False, f"Missing fields in response: {data.keys()}")
                return None
        else:
            log_test("Create booking", False, f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("Create booking", False, f"Exception: {str(e)}")
        return None

def test_admin_list_inspections(admin_token):
    """Test 9: Admin can see all inspections"""
    print(f"\n{BLUE}=== Test 9: Admin List Inspections ==={RESET}")
    try:
        response = requests.get(f"{BASE_URL}/inspections", 
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 200:
            inspections = response.json()
            log_test("Admin list inspections", True, f"Found {len(inspections)} inspections")
            return inspections
        else:
            log_test("Admin list inspections", False, f"Status {response.status_code}: {response.text}")
            return []
    except Exception as e:
        log_test("Admin list inspections", False, f"Exception: {str(e)}")
        return []

def test_available_inspections(admin_token):
    """Test 10: GET /inspections/available shows unassigned paid inspections"""
    print(f"\n{BLUE}=== Test 10: Available Inspections ==={RESET}")
    try:
        response = requests.get(f"{BASE_URL}/inspections/available", 
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 200:
            inspections = response.json()
            # Check all are unassigned and paid
            all_valid = all(
                i.get("assigned_employee_id") is None and i.get("status") == "paid"
                for i in inspections
            )
            if all_valid:
                log_test("Available inspections", True, f"Found {len(inspections)} available inspections")
                return True
            else:
                log_test("Available inspections", False, "Some inspections don't meet criteria")
                return False
        else:
            log_test("Available inspections", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Available inspections", False, f"Exception: {str(e)}")
        return False

def test_assign_inspection(admin_token, inspection_id, employee_id):
    """Test 11: Assign inspection to employee"""
    print(f"\n{BLUE}=== Test 11: Assign Inspection ==={RESET}")
    try:
        response = requests.patch(f"{BASE_URL}/inspections/{inspection_id}/assign",
            json={"employee_id": employee_id},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 200:
            inspection = response.json()
            if (inspection.get("status") == "assigned" and 
                inspection.get("assigned_employee_id") == employee_id and
                inspection.get("assigned_employee_name")):
                log_test("Assign inspection", True, 
                    f"Assigned to {inspection.get('assigned_employee_name')}, status: {inspection.get('status')}")
                return True
            else:
                log_test("Assign inspection", False, f"Assignment incomplete: {inspection}")
                return False
        else:
            log_test("Assign inspection", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Assign inspection", False, f"Exception: {str(e)}")
        return False

def test_assign_nonexistent_employee(admin_token, inspection_id):
    """Test 12: Assigning to non-existent employee should return 404"""
    print(f"\n{BLUE}=== Test 12: Assign to Non-existent Employee ==={RESET}")
    try:
        response = requests.patch(f"{BASE_URL}/inspections/{inspection_id}/assign",
            json={"employee_id": "nonexistent-id-12345"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 404:
            log_test("Assign to non-existent employee returns 404", True, "Correctly rejected")
            return True
        else:
            log_test("Assign to non-existent employee returns 404", False, 
                f"Expected 404, got {response.status_code}")
            return False
    except Exception as e:
        log_test("Assign to non-existent employee returns 404", False, f"Exception: {str(e)}")
        return False

def test_employee_login(email, password):
    """Test 13: Employee login"""
    print(f"\n{BLUE}=== Test 13: Employee Login ==={RESET}")
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": email,
            "password": password
        })
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and data.get("user", {}).get("role") == "employee":
                log_test("Employee login", True, f"Token received for employee")
                return data["token"]
            else:
                log_test("Employee login", False, f"Incorrect response: {data}")
                return None
        else:
            log_test("Employee login", False, f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("Employee login", False, f"Exception: {str(e)}")
        return None

def test_employee_list_inspections(employee_token):
    """Test 14: Employee sees only assigned inspections"""
    print(f"\n{BLUE}=== Test 14: Employee List Inspections ==={RESET}")
    try:
        response = requests.get(f"{BASE_URL}/inspections", 
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        
        if response.status_code == 200:
            inspections = response.json()
            log_test("Employee list inspections", True, 
                f"Employee sees {len(inspections)} assigned inspections")
            return inspections
        else:
            log_test("Employee list inspections", False, f"Status {response.status_code}: {response.text}")
            return []
    except Exception as e:
        log_test("Employee list inspections", False, f"Exception: {str(e)}")
        return []

def test_employee_available_inspections(employee_token):
    """Test 15: Employee can see available inspections"""
    print(f"\n{BLUE}=== Test 15: Employee Available Inspections ==={RESET}")
    try:
        response = requests.get(f"{BASE_URL}/inspections/available", 
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        
        if response.status_code == 200:
            log_test("Employee available inspections", True, "Employee can access available inspections")
            return True
        else:
            log_test("Employee available inspections", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Employee available inspections", False, f"Exception: {str(e)}")
        return False

def test_add_photos(employee_token, inspection_id):
    """Test 16: Add photos to inspection"""
    print(f"\n{BLUE}=== Test 16: Add Photos ==={RESET}")
    try:
        # Small base64 PNG image
        test_photo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        response = requests.post(f"{BASE_URL}/inspections/{inspection_id}/photos",
            json={"photos": [test_photo]},
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        
        if response.status_code == 200:
            inspection = response.json()
            photos = inspection.get("photos", [])
            if len(photos) > 0 and "id" in photos[0]:
                log_test("Add photos", True, f"Photo added with ID: {photos[0].get('id')}")
                return photos[0].get("id")
            else:
                log_test("Add photos", False, f"Photo not properly added: {photos}")
                return None
        else:
            log_test("Add photos", False, f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("Add photos", False, f"Exception: {str(e)}")
        return None

def test_delete_photo(employee_token, inspection_id, photo_id):
    """Test 17: Delete photo from inspection"""
    print(f"\n{BLUE}=== Test 17: Delete Photo ==={RESET}")
    try:
        response = requests.delete(f"{BASE_URL}/inspections/{inspection_id}/photos/{photo_id}",
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        
        if response.status_code == 200:
            inspection = response.json()
            photos = inspection.get("photos", [])
            photo_removed = not any(p.get("id") == photo_id for p in photos)
            if photo_removed:
                log_test("Delete photo", True, "Photo successfully removed")
                return True
            else:
                log_test("Delete photo", False, "Photo still present after deletion")
                return False
        else:
            log_test("Delete photo", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Delete photo", False, f"Exception: {str(e)}")
        return False

def test_update_status(employee_token, inspection_id):
    """Test 18: Update inspection status"""
    print(f"\n{BLUE}=== Test 18: Update Status ==={RESET}")
    try:
        response = requests.patch(f"{BASE_URL}/inspections/{inspection_id}/status",
            json={"status": "in_progress"},
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        
        if response.status_code == 200:
            inspection = response.json()
            if inspection.get("status") == "in_progress":
                log_test("Update status", True, "Status updated to in_progress")
                return True
            else:
                log_test("Update status", False, f"Status not updated: {inspection.get('status')}")
                return False
        else:
            log_test("Update status", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Update status", False, f"Exception: {str(e)}")
        return False

def test_submit_report(employee_token, inspection_id):
    """Test 19: Submit report (completes inspection)"""
    print(f"\n{BLUE}=== Test 19: Submit Report ==={RESET}")
    try:
        response = requests.post(f"{BASE_URL}/inspections/{inspection_id}/report",
            json={"notes": "Inspection completed. All components checked and verified."},
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        
        if response.status_code == 200:
            inspection = response.json()
            if inspection.get("status") == "completed":
                log_test("Submit report", True, "Report submitted, status: completed")
                return True
            else:
                log_test("Submit report", False, f"Status not completed: {inspection.get('status')}")
                return False
        else:
            log_test("Submit report", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Submit report", False, f"Exception: {str(e)}")
        return False

def test_client_list_inspections(client_token):
    """Test 20: Client sees only their own inspections"""
    print(f"\n{BLUE}=== Test 20: Client List Inspections ==={RESET}")
    try:
        response = requests.get(f"{BASE_URL}/inspections", 
            headers={"Authorization": f"Bearer {client_token}"}
        )
        
        if response.status_code == 200:
            inspections = response.json()
            log_test("Client list inspections", True, 
                f"Client sees {len(inspections)} own inspections")
            return inspections
        else:
            log_test("Client list inspections", False, f"Status {response.status_code}: {response.text}")
            return []
    except Exception as e:
        log_test("Client list inspections", False, f"Exception: {str(e)}")
        return []

def test_client_access_other_inspection(client_token, other_inspection_id):
    """Test 21: Client cannot access another client's inspection"""
    print(f"\n{BLUE}=== Test 21: Client Access Control ==={RESET}")
    try:
        response = requests.get(f"{BASE_URL}/inspections/{other_inspection_id}", 
            headers={"Authorization": f"Bearer {client_token}"}
        )
        
        if response.status_code == 403:
            log_test("Client access control (403)", True, "Correctly denied access to other client's inspection")
            return True
        else:
            log_test("Client access control (403)", False, 
                f"Expected 403, got {response.status_code}")
            return False
    except Exception as e:
        log_test("Client access control (403)", False, f"Exception: {str(e)}")
        return False

def test_no_token_access():
    """Test 22: Access without token returns 401"""
    print(f"\n{BLUE}=== Test 22: No Token Access ==={RESET}")
    try:
        response = requests.get(f"{BASE_URL}/users")
        
        if response.status_code == 401:
            log_test("No token returns 401", True, "Correctly requires authentication")
            return True
        else:
            log_test("No token returns 401", False, f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        log_test("No token returns 401", False, f"Exception: {str(e)}")
        return False

def test_client_access_admin_endpoint(client_token):
    """Test 23: Client cannot access admin endpoints"""
    print(f"\n{BLUE}=== Test 23: Client Access Admin Endpoint ==={RESET}")
    try:
        response = requests.get(f"{BASE_URL}/users", 
            headers={"Authorization": f"Bearer {client_token}"}
        )
        
        if response.status_code == 403:
            log_test("Client access admin endpoint returns 403", True, "Correctly denied")
            return True
        else:
            log_test("Client access admin endpoint returns 403", False, 
                f"Expected 403, got {response.status_code}")
            return False
    except Exception as e:
        log_test("Client access admin endpoint returns 403", False, f"Exception: {str(e)}")
        return False

def test_employee_access_admin_endpoint(employee_token):
    """Test 24: Employee cannot access admin endpoints"""
    print(f"\n{BLUE}=== Test 24: Employee Access Admin Endpoint ==={RESET}")
    try:
        response = requests.get(f"{BASE_URL}/users", 
            headers={"Authorization": f"Bearer {employee_token}"}
        )
        
        if response.status_code == 403:
            log_test("Employee access admin endpoint returns 403", True, "Correctly denied")
            return True
        else:
            log_test("Employee access admin endpoint returns 403", False, 
                f"Expected 403, got {response.status_code}")
            return False
    except Exception as e:
        log_test("Employee access admin endpoint returns 403", False, f"Exception: {str(e)}")
        return False

def test_create_quote():
    """Test 25: Create quote (public)"""
    print(f"\n{BLUE}=== Test 25: Create Quote (Public) ==={RESET}")
    try:
        quote_data = {
            "name": "Pierre Tremblay",
            "phone": "514-555-0303",
            "email": "pierre.tremblay@example.com",
            "service": "Inspection complète",
            "details": "Besoin d'une inspection pour ma voiture avant un long voyage"
        }
        
        response = requests.post(f"{BASE_URL}/quotes", json=quote_data)
        
        if response.status_code == 200:
            quote = response.json()
            if "id" in quote and quote.get("name") == quote_data["name"]:
                log_test("Create quote", True, f"Quote created with ID: {quote.get('id')}")
                return True
            else:
                log_test("Create quote", False, f"Incorrect quote data: {quote}")
                return False
        else:
            log_test("Create quote", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Create quote", False, f"Exception: {str(e)}")
        return False

def test_list_quotes(admin_token):
    """Test 26: Admin can list quotes"""
    print(f"\n{BLUE}=== Test 26: List Quotes (Admin) ==={RESET}")
    try:
        response = requests.get(f"{BASE_URL}/quotes", 
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 200:
            quotes = response.json()
            log_test("List quotes (admin)", True, f"Found {len(quotes)} quotes")
            return True
        else:
            log_test("List quotes (admin)", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("List quotes (admin)", False, f"Exception: {str(e)}")
        return False

def test_list_quotes_no_auth():
    """Test 27: Quotes without auth returns 401"""
    print(f"\n{BLUE}=== Test 27: List Quotes Without Auth ==={RESET}")
    try:
        response = requests.get(f"{BASE_URL}/quotes")
        
        if response.status_code == 401:
            log_test("List quotes without auth returns 401", True, "Correctly requires authentication")
            return True
        else:
            log_test("List quotes without auth returns 401", False, 
                f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        log_test("List quotes without auth returns 401", False, f"Exception: {str(e)}")
        return False

def test_stats(admin_token):
    """Test 28: Admin can get stats"""
    print(f"\n{BLUE}=== Test 28: Get Stats (Admin) ==={RESET}")
    try:
        response = requests.get(f"{BASE_URL}/stats", 
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        if response.status_code == 200:
            stats = response.json()
            required_fields = ["total_inspections", "unassigned", "completed", "employees", "clients", "quotes"]
            has_all_fields = all(field in stats for field in required_fields)
            if has_all_fields:
                log_test("Get stats", True, f"Stats: {stats}")
                return True
            else:
                log_test("Get stats", False, f"Missing fields in stats: {stats}")
                return False
        else:
            log_test("Get stats", False, f"Status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        log_test("Get stats", False, f"Exception: {str(e)}")
        return False

def test_stats_no_auth():
    """Test 29: Stats without auth returns 401"""
    print(f"\n{BLUE}=== Test 29: Stats Without Auth ==={RESET}")
    try:
        response = requests.get(f"{BASE_URL}/stats")
        
        if response.status_code == 401:
            log_test("Stats without auth returns 401", True, "Correctly requires authentication")
            return True
        else:
            log_test("Stats without auth returns 401", False, 
                f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        log_test("Stats without auth returns 401", False, f"Exception: {str(e)}")
        return False

def print_summary():
    """Print test summary"""
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}TEST SUMMARY{RESET}")
    print(f"{BLUE}{'='*60}{RESET}")
    
    passed = sum(1 for t in test_results if t["passed"])
    total = len(test_results)
    
    print(f"\nTotal Tests: {total}")
    print(f"{GREEN}Passed: {passed}{RESET}")
    print(f"{RED}Failed: {total - passed}{RESET}")
    
    if failed_tests:
        print(f"\n{RED}FAILED TESTS:{RESET}")
        for test in failed_tests:
            print(f"  {RED}✗{RESET} {test['name']}")
            if test['details']:
                print(f"    {test['details']}")
    
    return passed == total

def main():
    """Run all tests"""
    print(f"{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}Torque Élite Backend API Test Suite{RESET}")
    print(f"{BLUE}Base URL: {BASE_URL}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}")
    
    # Test 1-3: Admin auth
    admin_token = test_admin_login()
    if not admin_token:
        print(f"\n{RED}CRITICAL: Admin login failed. Cannot continue tests.{RESET}")
        sys.exit(1)
    
    test_auth_me(admin_token)
    test_wrong_password()
    
    # Test 4-7: User management
    employee = test_create_employee(admin_token)
    if employee:
        test_duplicate_email(admin_token, employee["email"])
    test_list_users_with_passwords(admin_token)
    test_filter_users_by_role(admin_token)
    
    # Test 8-10: Booking and inspections
    booking_result = test_create_booking()
    client_token = None
    inspection_id = None
    if booking_result:
        client_token = booking_result["token"]
        inspection_id = booking_result["inspection"]["id"]
    
    test_admin_list_inspections(admin_token)
    test_available_inspections(admin_token)
    
    # Test 11-12: Assignment
    if inspection_id and employee:
        test_assign_inspection(admin_token, inspection_id, employee["id"])
        # Create another booking for testing non-existent employee
        booking2 = test_create_booking()
        if booking2:
            test_assign_nonexistent_employee(admin_token, booking2["inspection"]["id"])
    
    # Test 13-19: Employee workflow
    employee_token = None
    if employee:
        employee_token = test_employee_login(employee["email"], employee["password"])
        if employee_token:
            employee_inspections = test_employee_list_inspections(employee_token)
            test_employee_available_inspections(employee_token)
            
            if employee_inspections and len(employee_inspections) > 0:
                emp_inspection_id = employee_inspections[0]["id"]
                photo_id = test_add_photos(employee_token, emp_inspection_id)
                if photo_id:
                    test_delete_photo(employee_token, emp_inspection_id, photo_id)
                test_update_status(employee_token, emp_inspection_id)
                test_submit_report(employee_token, emp_inspection_id)
    
    # Test 20-21: Client access
    if client_token:
        client_inspections = test_client_list_inspections(client_token)
        # Try to access an inspection that doesn't belong to this client
        # We need to create another booking with a DIFFERENT email to get a different client
        booking3 = test_create_booking(email_suffix="2")  # Different client
        if booking3 and client_inspections:
            other_inspection_id = booking3["inspection"]["id"]
            test_client_access_other_inspection(client_token, other_inspection_id)
    
    # Test 22-24: Access control
    test_no_token_access()
    if client_token:
        test_client_access_admin_endpoint(client_token)
    if employee_token:
        test_employee_access_admin_endpoint(employee_token)
    
    # Test 25-29: Quotes and stats
    test_create_quote()
    test_list_quotes(admin_token)
    test_list_quotes_no_auth()
    test_stats(admin_token)
    test_stats_no_auth()
    
    # Print summary
    all_passed = print_summary()
    
    if all_passed:
        print(f"\n{GREEN}✓ All tests passed!{RESET}")
        sys.exit(0)
    else:
        print(f"\n{RED}✗ Some tests failed. See details above.{RESET}")
        sys.exit(1)

if __name__ == "__main__":
    main()
