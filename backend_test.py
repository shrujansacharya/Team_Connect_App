#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timezone
import uuid

class BalagaAPITester:
    def __init__(self, base_url="https://balaga-app-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.user_token = None
        self.admin_token = None
        self.test_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        self.test_user_password = "Test@123"

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")

    def make_request(self, method, endpoint, data=None, token=None, expected_status=None):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            
            if expected_status and response.status_code != expected_status:
                return False, f"Expected {expected_status}, got {response.status_code}: {response.text}"
            
            try:
                return True, response.json()
            except:
                return True, response.text
                
        except Exception as e:
            return False, f"Request failed: {str(e)}"

    def test_user_registration(self):
        """Test user registration"""
        print("\n🔍 Testing User Registration...")
        
        user_data = {
            "full_name": "Test User",
            "email": self.test_user_email,
            "phone": "9876543210",
            "password": self.test_user_password
        }
        
        success, response = self.make_request('POST', 'auth/register', user_data, expected_status=200)
        
        if success and isinstance(response, dict) and 'id' in response:
            self.test_user_id = response['id']
            self.log_test("User Registration", True, f"User ID: {self.test_user_id}")
            return True
        else:
            self.log_test("User Registration", False, str(response))
            return False

    def test_user_login(self):
        """Test user login"""
        print("\n🔍 Testing User Login...")
        
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        success, response = self.make_request('POST', 'auth/login', login_data, expected_status=200)
        
        if success and isinstance(response, dict) and 'access_token' in response:
            self.user_token = response['access_token']
            self.log_test("User Login", True, "Token received")
            return True
        else:
            self.log_test("User Login", False, str(response))
            return False

    def test_admin_login(self):
        """Test admin login"""
        print("\n🔍 Testing Admin Login...")
        
        admin_data = {
            "password": "shrujan@2004"
        }
        
        success, response = self.make_request('POST', 'auth/admin-login', admin_data, expected_status=200)
        
        if success and isinstance(response, dict) and 'access_token' in response:
            self.admin_token = response['access_token']
            self.log_test("Admin Login", True, "Admin token received")
            return True
        else:
            self.log_test("Admin Login", False, str(response))
            return False

    def test_get_me_user(self):
        """Test get current user info"""
        print("\n🔍 Testing Get User Info...")
        
        success, response = self.make_request('GET', 'auth/me', token=self.user_token, expected_status=200)
        
        if success and isinstance(response, dict) and 'email' in response:
            self.log_test("Get User Info", True, f"Email: {response['email']}")
            return True
        else:
            self.log_test("Get User Info", False, str(response))
            return False

    def test_get_users_admin(self):
        """Test admin get all users"""
        print("\n🔍 Testing Admin Get Users...")
        
        success, response = self.make_request('GET', 'users', token=self.admin_token, expected_status=200)
        
        if success and isinstance(response, list):
            self.log_test("Admin Get Users", True, f"Found {len(response)} users")
            return True
        else:
            self.log_test("Admin Get Users", False, str(response))
            return False

    def test_approve_user(self):
        """Test admin approve user"""
        print("\n🔍 Testing User Approval...")
        
        if not self.test_user_id:
            self.log_test("User Approval", False, "No test user ID available")
            return False
        
        success, response = self.make_request('PUT', f'users/{self.test_user_id}/approve', token=self.admin_token, expected_status=200)
        
        if success and isinstance(response, dict) and 'message' in response:
            self.log_test("User Approval", True, response['message'])
            return True
        else:
            self.log_test("User Approval", False, str(response))
            return False

    def test_get_members(self):
        """Test get approved members"""
        print("\n🔍 Testing Get Members...")
        
        success, response = self.make_request('GET', 'members', token=self.user_token, expected_status=200)
        
        if success and isinstance(response, list):
            self.log_test("Get Members", True, f"Found {len(response)} members")
            return True
        else:
            self.log_test("Get Members", False, str(response))
            return False

    def test_current_savings(self):
        """Test get current month savings"""
        print("\n🔍 Testing Current Savings...")
        
        success, response = self.make_request('GET', 'savings/current', token=self.user_token, expected_status=200)
        
        if success and isinstance(response, dict) and 'month' in response:
            self.log_test("Current Savings", True, f"Month: {response.get('month_name', 'Unknown')}")
            return True
        else:
            self.log_test("Current Savings", False, str(response))
            return False

    def test_pay_savings(self):
        """Test monthly savings payment"""
        print("\n🔍 Testing Savings Payment...")
        
        success, response = self.make_request('POST', 'savings/pay', token=self.user_token, expected_status=200)
        
        if success and isinstance(response, dict) and 'transaction_id' in response:
            self.log_test("Savings Payment", True, f"Transaction ID: {response['transaction_id']}")
            return True
        else:
            self.log_test("Savings Payment", False, str(response))
            return False

    def test_savings_analytics(self):
        """Test admin savings analytics"""
        print("\n🔍 Testing Savings Analytics...")
        
        success, response = self.make_request('GET', 'savings/analytics', token=self.admin_token, expected_status=200)
        
        if success and isinstance(response, dict) and 'total_members' in response:
            self.log_test("Savings Analytics", True, f"Total members: {response['total_members']}, Collected: ₹{response.get('total_collected_this_month', 0)}")
            return True
        else:
            self.log_test("Savings Analytics", False, str(response))
            return False

    def test_create_slogan(self):
        """Test create slogan"""
        print("\n🔍 Testing Create Slogan...")
        
        slogan_data = {
            "text": "Unity is our strength - Test Slogan",
            "order": 1
        }
        
        success, response = self.make_request('POST', 'slogans', slogan_data, token=self.admin_token, expected_status=200)
        
        if success and isinstance(response, dict) and 'id' in response:
            self.log_test("Create Slogan", True, f"Slogan ID: {response['id']}")
            return True
        else:
            self.log_test("Create Slogan", False, str(response))
            return False

    def test_get_slogans(self):
        """Test get slogans"""
        print("\n🔍 Testing Get Slogans...")
        
        success, response = self.make_request('GET', 'slogans', expected_status=200)
        
        if success and isinstance(response, list):
            self.log_test("Get Slogans", True, f"Found {len(response)} slogans")
            return True
        else:
            self.log_test("Get Slogans", False, str(response))
            return False

    def test_create_achievement(self):
        """Test create achievement"""
        print("\n🔍 Testing Create Achievement...")
        
        achievement_data = {
            "title": "Community Event - Test",
            "description": "Successful celebration test",
            "date": datetime.now(timezone.utc).isoformat()
        }
        
        success, response = self.make_request('POST', 'achievements', achievement_data, token=self.admin_token, expected_status=200)
        
        if success and isinstance(response, dict) and 'id' in response:
            self.log_test("Create Achievement", True, f"Achievement ID: {response['id']}")
            return True
        else:
            self.log_test("Create Achievement", False, str(response))
            return False

    def test_get_achievements(self):
        """Test get achievements"""
        print("\n🔍 Testing Get Achievements...")
        
        success, response = self.make_request('GET', 'achievements', expected_status=200)
        
        if success and isinstance(response, list):
            self.log_test("Get Achievements", True, f"Found {len(response)} achievements")
            return True
        else:
            self.log_test("Get Achievements", False, str(response))
            return False

    def test_create_festival(self):
        """Test create festival"""
        print("\n🔍 Testing Create Festival...")
        
        now = datetime.now(timezone.utc)
        festival_data = {
            "name": "Test Festival",
            "description": "Test festival for API testing",
            "start_date": now.isoformat(),
            "end_date": (now.replace(day=now.day+1)).isoformat(),
            "total_budget": 5000.0
        }
        
        success, response = self.make_request('POST', 'festivals', festival_data, token=self.admin_token, expected_status=200)
        
        if success and isinstance(response, dict) and 'id' in response:
            self.log_test("Create Festival", True, f"Festival ID: {response['id']}")
            return True
        else:
            self.log_test("Create Festival", False, str(response))
            return False

    def test_get_festivals(self):
        """Test get festivals"""
        print("\n🔍 Testing Get Festivals...")
        
        success, response = self.make_request('GET', 'festivals', token=self.user_token, expected_status=200)
        
        if success and isinstance(response, list):
            self.log_test("Get Festivals", True, f"Found {len(response)} festivals")
            return True
        else:
            self.log_test("Get Festivals", False, str(response))
            return False

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting Jai Shree Ram Geleyara Balaga API Tests")
        print(f"📡 Testing against: {self.base_url}")
        print(f"👤 Test user email: {self.test_user_email}")
        
        # Test sequence
        tests = [
            self.test_user_registration,
            self.test_user_login,
            self.test_admin_login,
            self.test_get_me_user,
            self.test_get_users_admin,
            self.test_approve_user,
            self.test_get_members,
            self.test_current_savings,
            self.test_pay_savings,
            self.test_savings_analytics,
            self.test_create_slogan,
            self.test_get_slogans,
            self.test_create_achievement,
            self.test_get_achievements,
            self.test_create_festival,
            self.test_get_festivals
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                self.log_test(test.__name__, False, f"Exception: {str(e)}")
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"✅ Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Failed: {self.tests_run - self.tests_passed}/{self.tests_run}")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend API is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Check the logs above for details.")
            return False

def main():
    tester = BalagaAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())