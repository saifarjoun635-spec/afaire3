#!/usr/bin/env python3
"""
Backend regression test for vehicle_type storage
Tests that vehicle_type is correctly stored as vehicle.type in inspections
"""
import requests
import json
import uuid
from datetime import datetime

# Base URL from frontend/.env
BASE_URL = "https://job-dispatch-61.preview.emergentagent.com/api"

# Admin credentials from test_result.md
ADMIN_EMAIL = "admin@torqueelite.com"
ADMIN_PASSWORD = "admin123"

def test_booking_with_vehicle_type():
    """Test POST /api/bookings with vehicle_type and verify it's stored as vehicle.type"""
    print("\n" + "="*80)
    print("TEST 1: POST /api/bookings with vehicle_type='Véhicule Lourd'")
    print("="*80)
    
    # Generate unique email for this test
    unique_email = f"client_{uuid.uuid4().hex[:8]}@test.com"
    
    booking_data = {
        "client_name": "Jean Tremblay",
        "client_email": unique_email,
        "client_phone": "514-555-1234",
        "client_password": "testpass123",
        "service_type": "Inspection Pré-achat",
        "vehicle_type": "Véhicule Lourd",
        "vehicle_make": "Ford",
        "vehicle_model": "F-150",
        "vehicle_year": "2018",
        "location_address": "123 rue Test, Montréal",
        "components": [
            {
                "name": "Other",
                "description": "Freins"
            }
        ]
    }
    
    print(f"Creating booking with unique email: {unique_email}")
    print(f"Vehicle type: {booking_data['vehicle_type']}")
    
    response = requests.post(f"{BASE_URL}/bookings", json=booking_data)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ FAILED: Expected 200, got {response.status_code}")
        print(f"Response: {response.text}")
        return None, None
    
    data = response.json()
    
    # Verify response structure
    if "token" not in data:
        print("❌ FAILED: No token in response")
        return None, None
    
    if "user" not in data:
        print("❌ FAILED: No user in response")
        return None, None
    
    if "inspection" not in data:
        print("❌ FAILED: No inspection in response")
        return None, None
    
    print("✓ Response contains token, user, and inspection")
    
    # Verify user role
    user = data["user"]
    if user.get("role") != "client":
        print(f"❌ FAILED: Expected user role 'client', got '{user.get('role')}'")
        return None, None
    
    print(f"✓ User role is 'client'")
    
    # Verify inspection status
    inspection = data["inspection"]
    if inspection.get("status") != "paid":
        print(f"❌ FAILED: Expected inspection status 'paid', got '{inspection.get('status')}'")
        return None, None
    
    print(f"✓ Inspection status is 'paid'")
    
    # CRITICAL: Verify vehicle.type is stored correctly
    vehicle = inspection.get("vehicle", {})
    vehicle_type = vehicle.get("type")
    
    print(f"\nVehicle data in inspection:")
    print(f"  vehicle.type: {vehicle_type}")
    print(f"  vehicle.make: {vehicle.get('make')}")
    print(f"  vehicle.model: {vehicle.get('model')}")
    print(f"  vehicle.year: {vehicle.get('year')}")
    
    if vehicle_type != "Véhicule Lourd":
        print(f"❌ FAILED: Expected vehicle.type='Véhicule Lourd', got '{vehicle_type}'")
        return None, None
    
    print(f"✓ vehicle.type is correctly stored as 'Véhicule Lourd'")
    
    inspection_id = inspection.get("id")
    print(f"\n✅ TEST 1 PASSED: Booking created successfully")
    print(f"   Inspection ID: {inspection_id}")
    print(f"   Client token: {data['token'][:20]}...")
    
    return data["token"], inspection_id


def test_admin_login():
    """Test admin login"""
    print("\n" + "="*80)
    print("TEST 2: Admin Login")
    print("="*80)
    
    login_data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ FAILED: Expected 200, got {response.status_code}")
        print(f"Response: {response.text}")
        return None
    
    data = response.json()
    
    if "token" not in data:
        print("❌ FAILED: No token in response")
        return None
    
    if "user" not in data:
        print("❌ FAILED: No user in response")
        return None
    
    user = data["user"]
    if user.get("role") != "admin":
        print(f"❌ FAILED: Expected role 'admin', got '{user.get('role')}'")
        return None
    
    print(f"✓ Admin logged in successfully")
    print(f"✅ TEST 2 PASSED")
    
    return data["token"]


def test_admin_list_inspections(admin_token, expected_inspection_id):
    """Test GET /api/inspections as admin and verify the new booking appears"""
    print("\n" + "="*80)
    print("TEST 3: GET /api/inspections (admin) - verify new booking appears")
    print("="*80)
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    response = requests.get(f"{BASE_URL}/inspections", headers=headers)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ FAILED: Expected 200, got {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    inspections = response.json()
    
    print(f"Total inspections: {len(inspections)}")
    
    # Find the inspection we just created
    found = False
    for inspection in inspections:
        if inspection.get("id") == expected_inspection_id:
            found = True
            print(f"\n✓ Found inspection with ID: {expected_inspection_id}")
            
            # Verify vehicle.type is present
            vehicle = inspection.get("vehicle", {})
            vehicle_type = vehicle.get("type")
            
            print(f"  vehicle.type: {vehicle_type}")
            print(f"  vehicle.make: {vehicle.get('make')}")
            print(f"  vehicle.model: {vehicle.get('model')}")
            print(f"  vehicle.year: {vehicle.get('year')}")
            
            if vehicle_type != "Véhicule Lourd":
                print(f"❌ FAILED: Expected vehicle.type='Véhicule Lourd', got '{vehicle_type}'")
                return False
            
            print(f"✓ vehicle.type is correctly stored as 'Véhicule Lourd'")
            break
    
    if not found:
        print(f"❌ FAILED: Inspection {expected_inspection_id} not found in admin's inspection list")
        return False
    
    print(f"\n✅ TEST 3 PASSED: New booking appears in admin's inspection list with correct vehicle.type")
    return True


def test_admin_available_inspections(admin_token):
    """Test GET /api/inspections/available as admin"""
    print("\n" + "="*80)
    print("TEST 4: GET /api/inspections/available (admin)")
    print("="*80)
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    response = requests.get(f"{BASE_URL}/inspections/available", headers=headers)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code != 200:
        print(f"❌ FAILED: Expected 200, got {response.status_code}")
        print(f"Response: {response.text}")
        return False
    
    available_inspections = response.json()
    
    print(f"Available (unassigned) inspections: {len(available_inspections)}")
    
    # Verify all returned inspections have status="paid" and no assigned_employee_id
    for inspection in available_inspections:
        status = inspection.get("status")
        assigned = inspection.get("assigned_employee_id")
        
        if status != "paid":
            print(f"❌ FAILED: Found inspection with status '{status}' (expected 'paid')")
            return False
        
        if assigned is not None:
            print(f"❌ FAILED: Found inspection with assigned_employee_id '{assigned}' (expected None)")
            return False
    
    print(f"✓ All available inspections have status='paid' and no assigned employee")
    print(f"\n✅ TEST 4 PASSED: GET /api/inspections/available works correctly")
    return True


def main():
    print("\n" + "="*80)
    print("BACKEND REGRESSION TEST: Vehicle Type Storage")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Time: {datetime.now().isoformat()}")
    
    # Test 1: Create booking with vehicle_type
    client_token, inspection_id = test_booking_with_vehicle_type()
    if not client_token or not inspection_id:
        print("\n❌ REGRESSION TEST FAILED: Booking creation failed")
        return 1
    
    # Test 2: Admin login
    admin_token = test_admin_login()
    if not admin_token:
        print("\n❌ REGRESSION TEST FAILED: Admin login failed")
        return 1
    
    # Test 3: Admin lists inspections and verifies the new booking
    if not test_admin_list_inspections(admin_token, inspection_id):
        print("\n❌ REGRESSION TEST FAILED: Admin inspection listing failed")
        return 1
    
    # Test 4: Admin gets available inspections
    if not test_admin_available_inspections(admin_token):
        print("\n❌ REGRESSION TEST FAILED: Available inspections endpoint failed")
        return 1
    
    print("\n" + "="*80)
    print("✅ ALL REGRESSION TESTS PASSED")
    print("="*80)
    print("\nSummary:")
    print("  ✓ POST /api/bookings correctly stores vehicle_type as vehicle.type")
    print("  ✓ Admin login works")
    print("  ✓ GET /api/inspections shows new booking with vehicle.type present")
    print("  ✓ GET /api/inspections/available works correctly")
    print("\n")
    return 0


if __name__ == "__main__":
    exit(main())
