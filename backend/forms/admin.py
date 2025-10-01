from django.contrib import admin
from .models import (
    FormTemplate, FormField, FormSubmission, FormFile, 
    NotificationLog, FormValidationRule
)


class FormFieldInline(admin.TabularInline):
    model = FormField
    extra = 0
    fields = ['field_name', 'field_type', 'label', 'is_required', 'is_visible', 'order']


class FormValidationRuleInline(admin.TabularInline):
    model = FormValidationRule
    extra = 0


@admin.register(FormTemplate)
class FormTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'is_active', 'created_by', 'created_at', 'submission_count']
    list_filter = ['is_active', 'created_at', 'created_by']
    search_fields = ['name', 'description']
    inlines = [FormFieldInline]
    readonly_fields = ['created_at', 'updated_at']
    
    def submission_count(self, obj):
        return obj.submissions.count()
    submission_count.short_description = 'Submissions'


@admin.register(FormField)
class FormFieldAdmin(admin.ModelAdmin):
    list_display = ['form_template', 'field_name', 'field_type', 'label', 'is_required', 'is_visible', 'order']
    list_filter = ['field_type', 'is_required', 'is_visible', 'form_template']
    search_fields = ['field_name', 'label', 'form_template__name']
    inlines = [FormValidationRuleInline]


@admin.register(FormSubmission)
class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = ['form_template', 'submitted_by', 'submitted_at', 'is_processed']
    list_filter = ['is_processed', 'submitted_at', 'form_template']
    search_fields = ['submitted_by', 'form_template__name']
    readonly_fields = ['submitted_at', 'form_data']
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing object
            return self.readonly_fields + ['form_template', 'submitted_by']
        return self.readonly_fields


@admin.register(FormFile)
class FormFileAdmin(admin.ModelAdmin):
    list_display = ['submission', 'field_name', 'original_filename', 'file_size', 'uploaded_at']
    list_filter = ['uploaded_at', 'field_name']
    search_fields = ['original_filename', 'submission__submitted_by']
    readonly_fields = ['uploaded_at', 'file_size']


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ['submission', 'notification_type', 'status', 'sent_at', 'retry_count', 'created_at']
    list_filter = ['status', 'notification_type', 'created_at']
    search_fields = ['submission__submitted_by', 'submission__form_template__name']
    readonly_fields = ['created_at']


@admin.register(FormValidationRule)
class FormValidationRuleAdmin(admin.ModelAdmin):
    list_display = ['field', 'rule_type', 'rule_value', 'error_message', 'is_active']
    list_filter = ['rule_type', 'is_active', 'field__form_template']
    search_fields = ['field__label', 'error_message']