from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from .models import FormSubmission, NotificationLog
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_form_submission_notification(self, submission_id):
    """
    Send notification to admin when a new form is submitted.
    This is an async task that can be retried if it fails.
    """
    try:
        submission = FormSubmission.objects.get(id=submission_id)
        
        # Create notification log entry
        notification_log = NotificationLog.objects.create(
            submission=submission,
            notification_type='email',
            status='pending'
        )
        
        # Get admin email from settings
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'kakwiristephen@gmail.com')
        
        # Prepare email content
        subject = f'New Form Submission: {submission.form_template.name}'
        
        # Create email context
        context = {
            'submission': submission,
            'form_template': submission.form_template,
            'submitted_by': submission.submitted_by,
            'submitted_at': submission.submitted_at,
            'form_data': submission.form_data,
            'files': submission.files.all()
        }
        
        # Render email template (we'll create this)
        html_message = render_to_string('emails/form_submission_notification.html', context)
        plain_message = render_to_string('emails/form_submission_notification.txt', context)
        
        # Send email
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin_email],
            html_message=html_message,
            fail_silently=False
        )
        
        # Update notification log
        notification_log.status = 'sent'
        notification_log.save()
        
        logger.info(f"Notification sent successfully for submission {submission_id}")
        return f"Notification sent for submission {submission_id}"
        
    except FormSubmission.DoesNotExist:
        logger.error(f"Submission {submission_id} not found")
        return f"Submission {submission_id} not found"
        
    except Exception as exc:
        logger.error(f"Error sending notification for submission {submission_id}: {str(exc)}")
        
        # Update notification log with error
        try:
            notification_log = NotificationLog.objects.filter(
                submission_id=submission_id
            ).first()
            if notification_log:
                notification_log.status = 'failed'
                notification_log.error_message = str(exc)
                notification_log.retry_count += 1
                notification_log.save()
        except:
            pass
        
        # Retry the task
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task
def cleanup_old_notifications():
    """
    Cleanup old notification logs to keep the database clean.
    This can be run as a periodic task.
    """
    from datetime import datetime, timedelta
    
    # Delete notification logs older than 30 days
    cutoff_date = datetime.now() - timedelta(days=30)
    deleted_count = NotificationLog.objects.filter(
        created_at__lt=cutoff_date
    ).delete()[0]
    
    logger.info(f"Cleaned up {deleted_count} old notification logs")
    return f"Cleaned up {deleted_count} old notification logs"


@shared_task
def process_form_submission(submission_id):
    """
    Process a form submission (e.g., validate data, trigger business logic).
    This can be extended based on specific business requirements.
    """
    try:
        submission = FormSubmission.objects.get(id=submission_id)
        
        # Add any business logic here
        # For example:
        # - Validate form data against business rules
        # - Update related systems
        # - Generate reports
        # - Send additional notifications
        
        # Mark as processed
        submission.is_processed = True
        submission.save()
        
        logger.info(f"Submission {submission_id} processed successfully")
        return f"Submission {submission_id} processed"
        
    except FormSubmission.DoesNotExist:
        logger.error(f"Submission {submission_id} not found")
        return f"Submission {submission_id} not found"
        
    except Exception as exc:
        logger.error(f"Error processing submission {submission_id}: {str(exc)}")
        raise exc
