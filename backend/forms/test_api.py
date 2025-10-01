"""
API tests for FormFlow backend
"""
import tempfile
import os
from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import FormTemplate, FormField, FormSubmission, FormFile


class FormTemplateAPITest(APITestCase):
    """Test FormTemplate API endpoints"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.form = FormTemplate.objects.create(
            name='Test Form',
            description='Test Description',
            created_by=self.user
        )
    
    def test_list_forms(self):
        """Test listing form templates"""
        url = '/api/forms/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'Test Form')
    
    def test_create_form(self):
        """Test creating a form template"""
        url = '/api/forms/'
        data = {
            'name': 'New Form',
            'description': 'New Description',
            'is_active': True,
            'fields': [
                {
                    'field_name': 'field1',
                    'field_type': 'text',
                    'label': 'Field 1',
                    'is_required': True,
                    'order': 0
                }
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FormTemplate.objects.count(), 2)
        self.assertEqual(response.data['name'], 'New Form')
    
    def test_create_form_invalid_data(self):
        """Test creating form with invalid data"""
        url = '/api/forms/'
        data = {
            'name': '',  # Empty name
            'description': 'New Description'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)
    
    def test_get_form_details(self):
        """Test getting form template details"""
        url = f'/api/forms/{self.form.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Form')
    
    def test_update_form(self):
        """Test updating a form template"""
        url = f'/api/forms/{self.form.id}/'
        data = {'name': 'Updated Form'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.form.refresh_from_db()
        self.assertEqual(self.form.name, 'Updated Form')
    
    def test_delete_form(self):
        """Test deleting a form template"""
        url = f'/api/forms/{self.form.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(FormTemplate.objects.count(), 0)
    
    def test_unauthorized_access(self):
        """Test unauthorized access to forms"""
        self.client.force_authenticate(user=None)
        url = '/api/forms/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class FormSubmissionAPITest(APITestCase):
    """Test FormSubmission API endpoints"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.form = FormTemplate.objects.create(
            name='Test Form',
            created_by=self.user
        )
        self.submission = FormSubmission.objects.create(
            form_template=self.form,
            submitted_by='John Doe',
            form_data={'field1': 'value1'}
        )
    
    def test_list_submissions_authenticated(self):
        """Test listing submissions with authentication"""
        self.client.force_authenticate(user=self.user)
        url = '/api/submissions/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_list_submissions_unauthorized(self):
        """Test listing submissions without authentication"""
        url = '/api/submissions/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_mark_submission_processed(self):
        """Test marking submission as processed"""
        self.client.force_authenticate(user=self.user)
        url = f'/api/submissions/{self.submission.id}/mark_processed/'
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.submission.refresh_from_db()
        self.assertTrue(self.submission.is_processed)


class PublicAPITest(APITestCase):
    """Test public API endpoints"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.form = FormTemplate.objects.create(
            name='Public Form',
            description='Public Description',
            is_active=True,
            created_by=self.user
        )
        FormField.objects.create(
            form_template=self.form,
            field_name='name',
            field_type='text',
            label='Name',
            is_required=True,
            order=0
        )
    
    def test_get_public_forms(self):
        """Test getting public forms"""
        url = '/api/public/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Public Form')
    
    def test_submit_form(self):
        """Test submitting a form"""
        url = f'/api/public/{self.form.id}/submit/'
        data = {
            'submitted_by': 'John Doe',
            'name': 'John Doe'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FormSubmission.objects.count(), 1)
    
    def test_submit_form_invalid_data(self):
        """Test submitting form with invalid data"""
        url = f'/api/public/{self.form.id}/submit/'
        data = {
            'submitted_by': 'John Doe'
            # Missing required 'name' field
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_submit_nonexistent_form(self):
        """Test submitting to nonexistent form"""
        url = '/api/public/999/submit/'
        data = {'submitted_by': 'John Doe'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class AuthenticationAPITest(APITestCase):
    """Test authentication API endpoints"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_login_success(self):
        """Test successful login"""
        url = '/api/auth/login/'
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        url = '/api/auth/login/'
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_refresh_token(self):
        """Test token refresh"""
        refresh = RefreshToken.for_user(self.user)
        url = '/api/auth/refresh/'
        data = {'refresh': str(refresh)}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
    
    def test_logout(self):
        """Test logout"""
        refresh = RefreshToken.for_user(self.user)
        access = refresh.access_token
        
        url = '/api/auth/logout/'
        data = {'refresh': str(refresh)}
        headers = {'Authorization': f'Bearer {access}'}
        response = self.client.post(url, data, format='json', headers=headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
