"""
Unit tests for FormFlow models
"""
from django.test import TestCase
from django.contrib.auth.models import User
from .models import FormTemplate, FormField, FormSubmission, FormFile


class FormTemplateModelTest(TestCase):
    """Test FormTemplate model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_form_template_creation(self):
        """Test creating a form template"""
        form = FormTemplate.objects.create(
            name='Test Form',
            description='Test Description',
            created_by=self.user
        )
        self.assertEqual(form.name, 'Test Form')
        self.assertTrue(form.is_active)
        self.assertEqual(form.created_by, self.user)
        self.assertIsNotNone(form.created_at)
        self.assertIsNotNone(form.updated_at)
    
    def test_form_template_str_representation(self):
        """Test string representation of form template"""
        form = FormTemplate.objects.create(
            name='Test Form',
            created_by=self.user
        )
        self.assertEqual(str(form), 'Test Form')
    
    def test_form_template_requires_created_by(self):
        """Test that created_by is required"""
        with self.assertRaises(Exception):
            FormTemplate.objects.create(
                name='Test Form',
                description='Test Description'
            )
    
    def test_form_template_configuration_json(self):
        """Test configuration field stores JSON properly"""
        config = {'theme': 'blue', 'layout': 'vertical'}
        form = FormTemplate.objects.create(
            name='Test Form',
            created_by=self.user,
            configuration=config
        )
        self.assertEqual(form.configuration, config)


class FormFieldModelTest(TestCase):
    """Test FormField model"""
    
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
        """Test creating a form field"""
        field = FormField.objects.create(
            form_template=self.form,
            field_name='test_field',
            field_type='text',
            label='Test Field',
            is_required=True,
            order=0
        )
        self.assertEqual(field.field_name, 'test_field')
        self.assertEqual(field.field_type, 'text')
        self.assertTrue(field.is_required)
        self.assertTrue(field.is_visible)
        self.assertEqual(field.order, 0)
    
    def test_form_field_str_representation(self):
        """Test string representation of form field"""
        field = FormField.objects.create(
            form_template=self.form,
            field_name='test_field',
            field_type='text',
            label='Test Field'
        )
        self.assertEqual(str(field), 'Test Field (text)')
    
    def test_form_field_configuration_json(self):
        """Test configuration field stores JSON properly"""
        config = {'max_length': 100, 'pattern': '[A-Za-z]+'}
        field = FormField.objects.create(
            form_template=self.form,
            field_name='test_field',
            field_type='text',
            label='Test Field',
            configuration=config
        )
        self.assertEqual(field.configuration, config)


class FormSubmissionModelTest(TestCase):
    """Test FormSubmission model"""
    
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
        """Test creating a form submission"""
        form_data = {'field1': 'value1', 'field2': 'value2'}
        submission = FormSubmission.objects.create(
            form_template=self.form,
            submitted_by='John Doe',
            form_data=form_data
        )
        self.assertEqual(submission.submitted_by, 'John Doe')
        self.assertFalse(submission.is_processed)
        self.assertIsNotNone(submission.submitted_at)
        self.assertEqual(submission.form_data, form_data)
    
    def test_form_submission_str_representation(self):
        """Test string representation of form submission"""
        submission = FormSubmission.objects.create(
            form_template=self.form,
            submitted_by='John Doe',
            form_data={'field1': 'value1'}
        )
        expected = f"Submission {submission.id} - {submission.form_template.name}"
        self.assertEqual(str(submission), expected)


class FormFileModelTest(TestCase):
    """Test FormFile model"""
    
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
    
    def test_form_file_creation(self):
        """Test creating a form file"""
        file = FormFile.objects.create(
            submission=self.submission,
            field_name='document',
            file='test_file.pdf',
            original_filename='test_file.pdf',
            file_size=1024
        )
        self.assertEqual(file.field_name, 'document')
        self.assertEqual(file.original_filename, 'test_file.pdf')
        self.assertEqual(file.file_size, 1024)
        self.assertIsNotNone(file.uploaded_at)