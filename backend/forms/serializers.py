from rest_framework import serializers
from django.contrib.auth.models import User
from .models import FormTemplate, FormField, FormSubmission, FormFile, NotificationLog, FormValidationRule


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class FormValidationRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormValidationRule
        fields = ['id', 'rule_type', 'rule_value', 'error_message', 'is_active']


class FormFieldSerializer(serializers.ModelSerializer):
    validation_rules = FormValidationRuleSerializer(many=True, read_only=True)
    
    class Meta:
        model = FormField
        fields = [
            'id', 'field_name', 'field_type', 'label', 'placeholder', 
            'help_text', 'is_required', 'is_visible', 'order', 
            'configuration', 'conditional_logic', 'validation_rules'
        ]


class FormTemplateSerializer(serializers.ModelSerializer):
    fields = FormFieldSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    submission_count = serializers.SerializerMethodField()
    
    class Meta:
        model = FormTemplate
        fields = [
            'id', 'name', 'description', 'is_active', 'created_by', 
            'created_by_name', 'created_at', 'updated_at', 'configuration', 
            'fields', 'submission_count'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_submission_count(self, obj):
        return obj.submissions.count()


class FormFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormFile
        fields = ['id', 'field_name', 'file', 'original_filename', 'file_size', 'uploaded_at']
        read_only_fields = ['original_filename', 'file_size', 'uploaded_at']


class FormSubmissionSerializer(serializers.ModelSerializer):
    files = FormFileSerializer(many=True, read_only=True)
    form_template_name = serializers.CharField(source='form_template.name', read_only=True)
    
    class Meta:
        model = FormSubmission
        fields = [
            'id', 'form_template', 'form_template_name', 'submitted_by', 
            'submitted_at', 'is_processed', 'processed_at', 'form_data', 'files'
        ]
        read_only_fields = ['submitted_at', 'is_processed', 'processed_at']


class FormSubmissionCreateSerializer(serializers.ModelSerializer):
    files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = FormSubmission
        fields = ['form_template', 'submitted_by', 'form_data', 'files']
    
    def create(self, validated_data):
        files_data = validated_data.pop('files', [])
        submission = FormSubmission.objects.create(**validated_data)
        
        # Handle file uploads
        for file_data in files_data:
            FormFile.objects.create(
                submission=submission,
                field_name=file_data.name,
                file=file_data,
                original_filename=file_data.name,
                file_size=file_data.size
            )
        
        return submission


class NotificationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationLog
        fields = ['id', 'notification_type', 'status', 'sent_at', 'error_message', 'retry_count', 'created_at']


class FormFieldCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormField
        fields = [
            'field_name', 'field_type', 'label', 'placeholder', 'help_text',
            'is_required', 'is_visible', 'order', 'configuration', 'conditional_logic'
        ]
    
    def validate_field_name(self, value):
        # Ensure field name is unique within the form template
        form_template_id = self.context.get('form_template_id')
        if form_template_id:
            if FormField.objects.filter(
                form_template_id=form_template_id, 
                field_name=value
            ).exists():
                raise serializers.ValidationError("Field name must be unique within the form template.")
        return value


class FormTemplateCreateSerializer(serializers.ModelSerializer):
    fields = FormFieldCreateSerializer(many=True, required=False)
    
    class Meta:
        model = FormTemplate
        fields = ['name', 'description', 'is_active', 'configuration', 'fields']
    
    def create(self, validated_data):
        fields_data = validated_data.pop('fields', [])
        # Set the created_by field to the current user
        validated_data['created_by'] = self.context['request'].user
        form_template = FormTemplate.objects.create(**validated_data)
        
        # Create form fields
        for field_data in fields_data:
            FormField.objects.create(form_template=form_template, **field_data)
        
        return form_template
