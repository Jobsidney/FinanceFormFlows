# 🧪 FormFlow Testing Guide

## Testing Strategy

FormFlow implements a comprehensive testing strategy covering unit tests, integration tests, and end-to-end tests to ensure reliability and maintainability.

## Test Structure

```
tests/
├── backend/
│   ├── unit/
│   │   ├── test_models.py
│   │   ├── test_serializers.py
│   │   ├── test_views.py
│   │   └── test_tasks.py
│   ├── integration/
│   │   ├── test_api_endpoints.py
│   │   ├── test_authentication.py
│   │   └── test_file_upload.py
│   └── fixtures/
│       ├── test_data.json
│       └── sample_files/
├── frontend/
│   ├── unit/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── integration/
│   │   ├── api.test.ts
│   │   └── auth.test.ts
│   └── e2e/
│       ├── form-creation.spec.ts
│       ├── form-submission.spec.ts
│       └── admin-workflow.spec.ts
└── shared/
    ├── test_helpers.py
    ├── test_fixtures.py
    └── mock_data.py
```

## Backend Testing

### Unit Tests

#### Test Models
```python
# tests/backend/unit/test_models.py
import pytest
from django.test import TestCase
from django.core.exceptions import ValidationError
from forms.models import FormTemplate, FormField, FormSubmission

class FormTemplateModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_form_template_creation(self):
        form = FormTemplate.objects.create(
            name='Test Form',
            description='Test Description',
            created_by=self.user
        )
        self.assertEqual(form.name, 'Test Form')
        self.assertTrue(form.is_active)
        self.assertEqual(form.created_by, self.user)
    
    def test_form_template_str_representation(self):
        form = FormTemplate.objects.create(
            name='Test Form',
            created_by=self.user
        )
        self.assertEqual(str(form), 'Test Form')
    
    def test_form_template_requires_created_by(self):
        with self.assertRaises(ValidationError):
            FormTemplate.objects.create(
                name='Test Form',
                description='Test Description'
            )

class FormFieldModelTest(TestCase):
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
    
    def test_form_field_creation(self):
        field = FormField.objects.create(
            form_template=self.form,
            field_name='test_field',
            field_type='text',
            label='Test Field',
            is_required=True
        )
        self.assertEqual(field.field_name, 'test_field')
        self.assertEqual(field.field_type, 'text')
        self.assertTrue(field.is_required)
    
    def test_form_field_validation(self):
        with self.assertRaises(ValidationError):
            FormField.objects.create(
                form_template=self.form,
                field_name='',  # Empty field name
                field_type='text',
                label='Test Field'
            )

class FormSubmissionModelTest(TestCase):
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
    
    def test_form_submission_creation(self):
        submission = FormSubmission.objects.create(
            form_template=self.form,
            submitted_by='John Doe',
            form_data={'field1': 'value1'}
        )
        self.assertEqual(submission.submitted_by, 'John Doe')
        self.assertFalse(submission.is_processed)
        self.assertIsNotNone(submission.submitted_at)
```

#### Test Serializers
```python
# tests/backend/unit/test_serializers.py
import pytest
from rest_framework.test import APITestCase
from rest_framework import status
from forms.serializers import FormTemplateSerializer, FormSubmissionSerializer

class FormTemplateSerializerTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.form_data = {
            'name': 'Test Form',
            'description': 'Test Description',
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
    
    def test_form_template_serializer_valid_data(self):
        serializer = FormTemplateSerializer(data=self.form_data)
        self.assertTrue(serializer.is_valid())
    
    def test_form_template_serializer_invalid_data(self):
        invalid_data = self.form_data.copy()
        invalid_data['name'] = ''  # Empty name
        serializer = FormTemplateSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('name', serializer.errors)
    
    def test_form_template_serializer_create(self):
        serializer = FormTemplateSerializer(data=self.form_data)
        self.assertTrue(serializer.is_valid())
        form = serializer.save(created_by=self.user)
        self.assertEqual(form.name, 'Test Form')
        self.assertEqual(form.fields.count(), 1)
```

#### Test Views
```python
# tests/backend/unit/test_views.py
import pytest
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from forms.models import FormTemplate, FormSubmission

class FormTemplateViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.form = FormTemplate.objects.create(
            name='Test Form',
            created_by=self.user
        )
    
    def test_list_forms(self):
        url = reverse('formtemplate-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_form(self):
        url = reverse('formtemplate-list')
        data = {
            'name': 'New Form',
            'description': 'New Description',
            'is_active': True,
            'fields': []
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FormTemplate.objects.count(), 2)
    
    def test_update_form(self):
        url = reverse('formtemplate-detail', kwargs={'pk': self.form.pk})
        data = {'name': 'Updated Form'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.form.refresh_from_db()
        self.assertEqual(self.form.name, 'Updated Form')
    
    def test_delete_form(self):
        url = reverse('formtemplate-detail', kwargs={'pk': self.form.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(FormTemplate.objects.count(), 0)
```

#### Test Tasks
```python
# tests/backend/unit/test_tasks.py
import pytest
from unittest.mock import patch, MagicMock
from forms.tasks import send_form_submission_notification, process_form_submission

class TaskTest(TestCase):
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
    
    @patch('forms.tasks.send_mail')
    def test_send_form_submission_notification(self, mock_send_mail):
        mock_send_mail.return_value = True
        
        result = send_form_submission_notification.delay(self.submission.id)
        
        self.assertTrue(result.successful())
        mock_send_mail.assert_called_once()
    
    def test_process_form_submission(self):
        result = process_form_submission.delay(self.submission.id)
        
        self.assertTrue(result.successful())
        self.submission.refresh_from_db()
        # Add assertions based on your processing logic
```

### Integration Tests

#### Test API Endpoints
```python
# tests/backend/integration/test_api_endpoints.py
import pytest
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from forms.models import FormTemplate, FormSubmission

class FormSubmissionIntegrationTest(APITestCase):
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
        FormField.objects.create(
            form_template=self.form,
            field_name='name',
            field_type='text',
            label='Name',
            is_required=True,
            order=0
        )
    
    def test_complete_form_submission_flow(self):
        # 1. Get public forms
        url = reverse('public-forms')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 2. Submit form
        submit_url = reverse('public-form-submit', kwargs={'form_id': self.form.id})
        data = {
            'submitted_by': 'John Doe',
            'name': 'John Doe'
        }
        response = self.client.post(submit_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 3. Verify submission in admin
        self.client.force_authenticate(user=self.user)
        admin_url = reverse('formsubmission-list')
        response = self.client.get(admin_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
```

## Frontend Testing

### Unit Tests

#### Test Components
```typescript
// tests/frontend/unit/components/FormList.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormList } from '@/components/client/FormList';

const mockForms = [
  {
    id: 1,
    name: 'Test Form',
    description: 'Test Description',
    is_active: true,
    fields: [],
    submission_count: 5,
    created_at: '2024-01-01T00:00:00Z'
  }
];

describe('FormList', () => {
  it('renders form list correctly', () => {
    const mockOnSelectForm = jest.fn();
    
    render(
      <FormList 
        forms={mockForms} 
        onSelectForm={mockOnSelectForm} 
      />
    );
    
    expect(screen.getByText('Test Form')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
  
  it('calls onSelectForm when form is clicked', () => {
    const mockOnSelectForm = jest.fn();
    
    render(
      <FormList 
        forms={mockForms} 
        onSelectForm={mockOnSelectForm} 
      />
    );
    
    fireEvent.click(screen.getByText('Test Form'));
    expect(mockOnSelectForm).toHaveBeenCalledWith(mockForms[0]);
  });
  
  it('shows loading state', () => {
    render(<FormList forms={[]} onSelectForm={jest.fn()} isLoading={true} />);
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });
  
  it('shows empty state when no forms', () => {
    render(<FormList forms={[]} onSelectForm={jest.fn()} />);
    
    expect(screen.getByText('No forms available')).toBeInTheDocument();
  });
});
```

#### Test Hooks
```typescript
// tests/frontend/unit/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import * as authService from '@/services/auth';

jest.mock('@/services/auth');

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('initializes with correct default state', () => {
    (authService.isAuthenticated as jest.Mock).mockReturnValue(false);
    
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });
  
  it('handles login successfully', async () => {
    const mockUser = { id: 1, username: 'testuser' };
    (authService.login as jest.Mock).mockResolvedValue(mockUser);
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('testuser', 'password');
    });
    
    expect(authService.login).toHaveBeenCalledWith('testuser', 'password');
    expect(result.current.user).toEqual(mockUser);
  });
  
  it('handles login failure', async () => {
    (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));
    
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await expect(result.current.login('testuser', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });
});
```

### Integration Tests

#### Test API Integration
```typescript
// tests/frontend/integration/api.test.ts
import { api } from '@/lib/api';
import { publicFormsApi } from '@/services/api';

// Mock fetch
global.fetch = jest.fn();

describe('API Integration', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });
  
  it('fetches public forms successfully', async () => {
    const mockForms = [
      { id: 1, name: 'Test Form', is_active: true }
    ];
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockForms
    });
    
    const forms = await publicFormsApi.getForms();
    
    expect(fetch).toHaveBeenCalledWith('/api/public/');
    expect(forms).toEqual(mockForms);
  });
  
  it('handles API errors', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' })
    });
    
    await expect(publicFormsApi.getForms()).rejects.toThrow();
  });
  
  it('submits form successfully', async () => {
    const formData = {
      submitted_by: 'John Doe',
      field1: 'value1'
    };
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, ...formData })
    });
    
    const result = await publicFormsApi.submit(1, formData);
    
    expect(fetch).toHaveBeenCalledWith('/api/public/1/submit/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    expect(result.id).toBe(1);
  });
});
```

### End-to-End Tests

#### Test Form Creation Workflow
```typescript
// tests/frontend/e2e/form-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Form Creation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin');
    await page.fill('[data-testid="username"]', 'admin');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/admin');
  });
  
  test('creates a new form successfully', async ({ page }) => {
    // Navigate to create form
    await page.click('[data-testid="create-form-tab"]');
    
    // Fill form details
    await page.fill('[data-testid="form-name"]', 'E2E Test Form');
    await page.fill('[data-testid="form-description"]', 'Form created by E2E test');
    
    // Add a field
    await page.click('[data-testid="add-field-button"]');
    await page.fill('[data-testid="field-name-0"]', 'test_field');
    await page.selectOption('[data-testid="field-type-0"]', 'text');
    await page.fill('[data-testid="field-label-0"]', 'Test Field');
    await page.check('[data-testid="field-required-0"]');
    
    // Submit form
    await page.click('[data-testid="submit-form-button"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('text=E2E Test Form')).toBeVisible();
  });
  
  test('validates required fields', async ({ page }) => {
    await page.click('[data-testid="create-form-tab"]');
    await page.click('[data-testid="submit-form-button"]');
    
    await expect(page.locator('[data-testid="form-name-error"]')).toBeVisible();
    await expect(page.locator('text=Form name is required')).toBeVisible();
  });
});
```

#### Test Form Submission Workflow
```typescript
// tests/frontend/e2e/form-submission.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Form Submission Workflow', () => {
  test('submits form successfully', async ({ page }) => {
    // Go to public forms page
    await page.goto('/');
    
    // Select a form
    await page.click('[data-testid="form-card-0"]');
    
    // Fill form fields
    await page.fill('[data-testid="submitted-by"]', 'John Doe');
    await page.fill('[data-testid="field-full_name"]', 'John Doe');
    await page.fill('[data-testid="field-email"]', 'john@example.com');
    
    // Submit form
    await page.click('[data-testid="submit-button"]');
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('text=Form submitted successfully')).toBeVisible();
  });
  
  test('validates required fields', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="form-card-0"]');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="field-error-full_name"]')).toBeVisible();
  });
  
  test('handles file upload', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="form-card-0"]');
    
    // Upload file
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles('tests/fixtures/sample.pdf');
    
    await page.fill('[data-testid="submitted-by"]', 'John Doe');
    await page.click('[data-testid="submit-button"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

## Running Tests

### Backend Tests
```bash
# Run all tests
cd backend
python manage.py test

# Run specific test file
python manage.py test forms.tests.test_models

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

### Frontend Tests
```bash
# Unit tests
cd frontend
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests with coverage
npm run test:coverage
```

### Docker Tests
```bash
# Run tests in Docker
docker-compose -f docker-compose.test.yml up --build

# Run specific test suite
docker-compose -f docker-compose.test.yml run frontend npm test
docker-compose -f docker-compose.test.yml run backend python manage.py test
```

## Test Data Management

### Fixtures
```python
# tests/backend/fixtures/test_data.json
{
  "users": [
    {
      "model": "auth.user",
      "pk": 1,
      "fields": {
        "username": "testuser",
        "email": "test@example.com",
        "is_staff": true
      }
    }
  ],
  "form_templates": [
    {
      "model": "forms.formtemplate",
      "pk": 1,
      "fields": {
        "name": "Test KYC Form",
        "description": "Test KYC form for testing",
        "is_active": true,
        "created_by": 1
      }
    }
  ]
}
```

### Mock Data
```typescript
// tests/frontend/mock_data.ts
export const mockForms = [
  {
    id: 1,
    name: 'Test Form',
    description: 'Test Description',
    is_active: true,
    fields: [
      {
        id: 1,
        field_name: 'full_name',
        field_type: 'text',
        label: 'Full Name',
        is_required: true,
        order: 0
      }
    ],
    submission_count: 5,
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const mockSubmissions = [
  {
    id: 1,
    form_template: 1,
    form_template_name: 'Test Form',
    submitted_by: 'John Doe',
    submitted_at: '2024-01-01T00:00:00Z',
    is_processed: false,
    form_data: {
      full_name: 'John Doe'
    },
    files: []
  }
];
```

## Continuous Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          python manage.py test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Run tests
        run: |
          cd frontend
          npm test
      - name: Run E2E tests
        run: |
          cd frontend
          npm run test:e2e
```

## Performance Testing

### Load Testing
```python
# tests/performance/load_test.py
import asyncio
import aiohttp
import time

async def load_test():
    async with aiohttp.ClientSession() as session:
        tasks = []
        for i in range(100):  # 100 concurrent requests
            task = session.get('http://localhost:8000/api/public/')
            tasks.append(task)
        
        start_time = time.time()
        responses = await asyncio.gather(*tasks)
        end_time = time.time()
        
        successful = sum(1 for r in responses if r.status == 200)
        print(f"Successful requests: {successful}/100")
        print(f"Time taken: {end_time - start_time:.2f} seconds")

if __name__ == "__main__":
    asyncio.run(load_test())
```

This comprehensive testing strategy ensures FormFlow maintains high quality and reliability across all components and workflows.
