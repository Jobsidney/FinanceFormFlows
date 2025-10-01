from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    FormTemplateViewSet, FormFieldViewSet, FormSubmissionViewSet,
    NotificationLogViewSet, PublicFormViewSet
)
from .auth_views import (
    login_view, register_view, refresh_token_view, 
    logout_view, user_profile_view
)

router = DefaultRouter()
router.register(r'forms', FormTemplateViewSet)
router.register(r'fields', FormFieldViewSet)
router.register(r'submissions', FormSubmissionViewSet)
router.register(r'notifications', NotificationLogViewSet)
router.register(r'public', PublicFormViewSet, basename='public')

urlpatterns = [
    path('api/', include(router.urls)),
    
    # Authentication URLs
    path('api/auth/login/', login_view, name='login'),
    path('api/auth/register/', register_view, name='register'),
    path('api/auth/refresh/', refresh_token_view, name='refresh'),
    path('api/auth/logout/', logout_view, name='logout'),
    path('api/auth/profile/', user_profile_view, name='profile'),
]
