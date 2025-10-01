from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
import json


class FormTemplate(models.Model):
    """
    Represents a customizable form template that admins can create.
    This is the core entity that allows for unlimited form creation.
    """
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_forms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # JSON field to store form configuration - this is the key to flexibility
    # This allows for unlimited field types, validation rules, and configurations
    configuration = models.JSONField(default=dict, help_text="Form configuration including fields, validation rules, etc.")
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class FormField(models.Model):
    """
    Individual fields within a form template.
    This allows for granular control over each field's properties.
    """
    FIELD_TYPES = [
        ('text', 'Text Input'),
        ('email', 'Email'),
        ('number', 'Number'),
        ('date', 'Date'),
        ('datetime', 'DateTime'),
        ('dropdown', 'Dropdown'),
        ('checkbox', 'Checkbox'),
        ('radio', 'Radio Button'),
        ('textarea', 'Text Area'),
        ('file', 'File Upload'),
        ('phone', 'Phone Number'),
    ]
    
    form_template = models.ForeignKey(FormTemplate, on_delete=models.CASCADE, related_name='fields')
    field_name = models.CharField(max_length=100)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES)
    label = models.CharField(max_length=200)
    placeholder = models.CharField(max_length=200, blank=True)
    help_text = models.TextField(blank=True)
    is_required = models.BooleanField(default=False)
    is_visible = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    # JSON field for field-specific configuration (options for dropdowns, validation rules, etc.)
    configuration = models.JSONField(default=dict, help_text="Field-specific configuration like options, validation rules")
    
    # Conditional logic - allows fields to show/hide based on other field values
    conditional_logic = models.JSONField(default=dict, blank=True, help_text="Rules for when this field should be visible")
    
    class Meta:
        ordering = ['order', 'id']
        unique_together = ['form_template', 'field_name']
    
    def __str__(self):
        return f"{self.form_template.name} - {self.label}"


class FormSubmission(models.Model):
    """
    Represents a client's submission of a form.
    This stores the actual data submitted by users.
    """
    form_template = models.ForeignKey(FormTemplate, on_delete=models.CASCADE, related_name='submissions')
    submitted_by = models.CharField(max_length=200, blank=True)  # Client name/email
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    # JSON field to store all form data - flexible for any form structure
    form_data = models.JSONField(default=dict, help_text="All form submission data")
    
    class Meta:
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.form_template.name} - {self.submitted_by} - {self.submitted_at}"


class FormFile(models.Model):
    """
    Stores uploaded files associated with form submissions.
    This handles multiple file uploads per form.
    """
    submission = models.ForeignKey(FormSubmission, on_delete=models.CASCADE, related_name='files')
    field_name = models.CharField(max_length=100)
    file = models.FileField(
        upload_to='form_uploads/%Y/%m/%d/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt'])]
    )
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.submission} - {self.original_filename}"


class NotificationLog(models.Model):
    """
    Tracks notification attempts for form submissions.
    This ensures we can monitor and retry failed notifications.
    """
    submission = models.ForeignKey(FormSubmission, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, default='email')
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('retrying', 'Retrying'),
    ], default='pending')
    sent_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    retry_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.submission} - {self.status}"


class FormValidationRule(models.Model):
    """
    Stores custom validation rules for form fields.
    This allows for complex business logic validation.
    """
    field = models.ForeignKey(FormField, on_delete=models.CASCADE, related_name='validation_rules')
    rule_type = models.CharField(max_length=50, choices=[
        ('min_length', 'Minimum Length'),
        ('max_length', 'Maximum Length'),
        ('min_value', 'Minimum Value'),
        ('max_value', 'Maximum Value'),
        ('pattern', 'Regex Pattern'),
        ('custom', 'Custom Logic'),
    ])
    rule_value = models.TextField(help_text="The value or pattern for this validation rule")
    error_message = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.field.label} - {self.rule_type}"