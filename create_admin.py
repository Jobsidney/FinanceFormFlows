#!/usr/bin/env python3
"""
Create an admin user for the onboarding system
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'onboarding_system.settings')
django.setup()

from django.contrib.auth.models import User
from django.db import transaction

def create_admin_user():
    """Create an admin user for the system"""
    
    print("🔧 Creating Admin User for Onboarding System")
    print("=" * 50)
    
    # Check if admin user already exists
    if User.objects.filter(username='admin').exists():
        print("✅ Admin user already exists!")
        admin_user = User.objects.get(username='admin')
        print(f"   Username: {admin_user.username}")
        print(f"   Email: {admin_user.email}")
        print(f"   Is Staff: {admin_user.is_staff}")
        print(f"   Is Superuser: {admin_user.is_superuser}")
        return admin_user
    
    try:
        with transaction.atomic():
            # Create admin user
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@example.com',
                password='admin123',
                first_name='Admin',
                last_name='User',
                is_staff=True,
                is_superuser=False
            )
            
            print("✅ Admin user created successfully!")
            print(f"   Username: {admin_user.username}")
            print(f"   Password: admin123")
            print(f"   Email: {admin_user.email}")
            print(f"   Is Staff: {admin_user.is_staff}")
            print(f"   Is Superuser: {admin_user.is_superuser}")
            
            return admin_user
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return None

def test_authentication():
    """Test the authentication system"""
    
    print("\n🧪 Testing Authentication System")
    print("=" * 50)
    
    try:
        from django.contrib.auth import authenticate
        
        # Test authentication
        user = authenticate(username='admin', password='admin123')
        
        if user:
            print("✅ Authentication test passed!")
            print(f"   User: {user.username}")
            print(f"   Is Active: {user.is_active}")
            print(f"   Is Staff: {user.is_staff}")
        else:
            print("❌ Authentication test failed!")
            
    except Exception as e:
        print(f"❌ Error testing authentication: {e}")

if __name__ == "__main__":
    admin_user = create_admin_user()
    
    if admin_user:
        test_authentication()
        
        print("\n🎯 Next Steps:")
        print("1. Start the Django server: cd backend && python manage.py runserver")
        print("2. Start the frontend: cd frontend && npm run dev")
        print("3. Navigate to http://localhost:3000/admin")
        print("4. Login with: admin / admin123")
        print("\n✅ Professional authentication system is ready!")
    else:
        print("\n❌ Failed to create admin user. Please check the error above.")
        sys.exit(1)
