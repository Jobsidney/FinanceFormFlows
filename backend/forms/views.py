from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import FormTemplate, FormField, FormSubmission, FormFile, NotificationLog
from .serializers import (
    FormTemplateSerializer, FormFieldSerializer, FormSubmissionSerializer,
    FormSubmissionCreateSerializer, FormTemplateCreateSerializer,
    NotificationLogSerializer
)
from .tasks import send_form_submission_notification
import json


class FormTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing form templates.
    Admins can create, read, update, and delete form templates.
    """
    queryset = FormTemplate.objects.all()
    permission_classes = [AllowAny]  # Changed for demo purposes
    
    def get_serializer_class(self):
        if self.action == 'create':
            return FormTemplateCreateSerializer
        return FormTemplateSerializer
    
    def get_queryset(self):
        # Filter by active status if requested
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            return self.queryset.filter(is_active=is_active.lower() == 'true')
        return self.queryset
    
    @action(detail=True, methods=['post'])
    def add_field(self, request, pk=None):
        """Add a new field to an existing form template."""
        form_template = self.get_object()
        serializer = FormFieldSerializer(data=request.data, context={'form_template_id': form_template.id})
        
        if serializer.is_valid():
            serializer.save(form_template=form_template)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        """Get all submissions for a specific form template."""
        form_template = self.get_object()
        submissions = form_template.submissions.all()
        serializer = FormSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def public_form(self, request, pk=None):
        """Public endpoint for clients to view form template (no auth required)."""
        form_template = get_object_or_404(FormTemplate, pk=pk, is_active=True)
        serializer = FormTemplateSerializer(form_template)
        return Response(serializer.data)


class FormFieldViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing individual form fields.
    """
    queryset = FormField.objects.all()
    serializer_class = FormFieldSerializer
    permission_classes = [AllowAny]  # Changed for demo purposes
    
    def get_queryset(self):
        form_template_id = self.request.query_params.get('form_template')
        if form_template_id:
            return self.queryset.filter(form_template_id=form_template_id)
        return self.queryset


class FormSubmissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing form submissions.
    """
    queryset = FormSubmission.objects.all()
    permission_classes = [AllowAny]  # Allow public submissions
    
    def get_serializer_class(self):
        if self.action == 'create':
            return FormSubmissionCreateSerializer
        return FormSubmissionSerializer
    
    def get_queryset(self):
        # Admins can see all submissions, others see only their own
        if self.request.user.is_authenticated:
            return self.queryset
        return self.queryset.none()  # Public users can't list submissions
    
    def create(self, request, *args, **kwargs):
        """Create a new form submission and trigger notification."""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            submission = serializer.save()
            
            # Trigger async notification
            send_form_submission_notification.delay(submission.id)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def by_form(self, request):
        """Get submissions filtered by form template."""
        form_template_id = request.query_params.get('form_template')
        if not form_template_id:
            return Response({'error': 'form_template parameter is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        submissions = self.get_queryset().filter(form_template_id=form_template_id)
        serializer = self.get_serializer(submissions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_processed(self, request, pk=None):
        """Mark a submission as processed."""
        submission = self.get_object()
        submission.is_processed = True
        submission.save()
        return Response({'status': 'processed'})


class NotificationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing notification logs.
    """
    queryset = NotificationLog.objects.all()
    serializer_class = NotificationLogSerializer
    permission_classes = [AllowAny]  # Changed for demo purposes
    
    def get_queryset(self):
        submission_id = self.request.query_params.get('submission')
        if submission_id:
            return self.queryset.filter(submission_id=submission_id)
        return self.queryset


class PublicFormViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public ViewSet for clients to view and submit forms.
    No authentication required.
    """
    queryset = FormTemplate.objects.filter(is_active=True)
    serializer_class = FormTemplateSerializer
    permission_classes = [AllowAny]
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit a form (public endpoint)."""
        form_template = self.get_object()
        
        # Prepare submission data
        submission_data = {
            'form_template': form_template.id,
            'submitted_by': request.data.get('submitted_by', 'Anonymous'),
            'form_data': request.data.get('form_data', {}),
            'files': request.FILES.getlist('files', [])
        }
        
        serializer = FormSubmissionCreateSerializer(data=submission_data)
        if serializer.is_valid():
            submission = serializer.save()
            
            # Trigger async notification
            send_form_submission_notification.delay(submission.id)
            
            return Response({
                'message': 'Form submitted successfully',
                'submission_id': submission.id
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)