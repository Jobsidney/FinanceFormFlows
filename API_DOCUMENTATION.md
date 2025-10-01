# FormFlow API Documentation

## Base URL
- **Development**: `http://localhost:8000/api/`
- **Production**: `http://localhost:8000/api/` (Local deployment)

## Authentication

FormFlow uses JWT (JSON Web Token) authentication with refresh tokens.

### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "",
    "last_name": ""
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Logout
```http
POST /api/auth/logout/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## Public APIs (No Authentication Required)

### Get All Public Forms
```http
GET /api/public/
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "KYC Form",
    "description": "Know Your Customer onboarding form",
    "is_active": true,
    "fields": [
      {
        "id": 1,
        "field_name": "full_name",
        "field_type": "text",
        "label": "Full Name",
        "placeholder": "Enter your full name",
        "help_text": "Please enter your legal name as it appears on official documents",
        "is_required": true,
        "is_visible": true,
        "order": 0,
        "configuration": {}
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Submit Form
```http
POST /api/public/{form_id}/submit/
Content-Type: multipart/form-data

{
  "submitted_by": "John Doe",
  "full_name": "John Doe",
  "email": "john@example.com",
  "files": [file1, file2]
}
```

**Response:**
```json
{
  "id": 1,
  "form_template": 1,
  "submitted_by": "John Doe",
  "submitted_at": "2024-01-01T00:00:00Z",
  "is_processed": false,
  "form_data": {
    "full_name": "John Doe",
    "email": "john@example.com"
  },
  "files": []
}
```

## Admin APIs (Authentication Required)

### Form Templates

#### List Forms
```http
GET /api/forms/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `search`: Search by name or description
- `is_active`: Filter by active status
- `ordering`: Sort by field (name, created_at, etc.)

**Response:**
```json
{
  "count": 10,
  "next": "http://localhost:8000/api/forms/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "KYC Form",
      "description": "Know Your Customer onboarding form",
      "is_active": true,
      "configuration": {},
      "created_by": 1,
      "created_by_name": "admin",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "submission_count": 5,
      "fields": [...]
    }
  ]
}
```

#### Create Form
```http
POST /api/forms/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "New Form",
  "description": "Form description",
  "is_active": true,
  "configuration": {},
  "fields": [
    {
      "field_name": "field_1",
      "field_type": "text",
      "label": "Field Label",
      "placeholder": "Enter value",
      "help_text": "Help text",
      "is_required": true,
      "is_visible": true,
      "order": 0,
      "configuration": {}
    }
  ]
}
```

**Response:**
```json
{
  "id": 2,
  "name": "New Form",
  "description": "Form description",
  "is_active": true,
  "configuration": {},
  "created_by": 1,
  "created_by_name": "admin",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "submission_count": 0,
  "fields": [...]
}
```

#### Get Form Details
```http
GET /api/forms/{id}/
Authorization: Bearer <access_token>
```

#### Update Form
```http
PATCH /api/forms/{id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Form Name",
  "is_active": false
}
```

#### Delete Form
```http
DELETE /api/forms/{id}/
Authorization: Bearer <access_token>
```

### Form Submissions

#### List Submissions
```http
GET /api/submissions/
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `form_template`: Filter by form template ID
- `is_processed`: Filter by processed status
- `submitted_by`: Filter by submitter
- `date_from`: Filter by submission date (from)
- `date_to`: Filter by submission date (to)

**Response:**
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/submissions/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "form_template": 1,
      "form_template_name": "KYC Form",
      "submitted_by": "John Doe",
      "submitted_at": "2024-01-01T00:00:00Z",
      "is_processed": false,
      "form_data": {
        "full_name": "John Doe",
        "email": "john@example.com"
      },
      "files": [
        {
          "id": 1,
          "field_name": "document",
          "file": "/media/submissions/file.pdf",
          "original_filename": "document.pdf",
          "file_size": 1024000,
          "uploaded_at": "2024-01-01T00:00:00Z"
        }
      ]
    }
  ]
}
```

#### Get Submissions by Form
```http
GET /api/submissions/by_form/?form_template={form_id}
Authorization: Bearer <access_token>
```

#### Mark Submission as Processed
```http
PATCH /api/submissions/{id}/mark_processed/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "is_processed": true,
  "processed_at": "2024-01-01T00:00:00Z"
}
```

### Form Fields

#### List Fields for Form
```http
GET /api/forms/{form_id}/fields/
Authorization: Bearer <access_token>
```

#### Create Field
```http
POST /api/forms/{form_id}/fields/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "field_name": "new_field",
  "field_type": "email",
  "label": "Email Address",
  "placeholder": "Enter your email",
  "help_text": "We'll use this to contact you",
  "is_required": true,
  "is_visible": true,
  "order": 1,
  "configuration": {
    "max_length": 254
  }
}
```

#### Update Field
```http
PATCH /api/forms/{form_id}/fields/{field_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "label": "Updated Label",
  "is_required": false
}
```

#### Delete Field
```http
DELETE /api/forms/{form_id}/fields/{field_id}/
Authorization: Bearer <access_token>
```

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "code": "ERROR_CODE",
  "field_errors": {
    "field_name": ["Field-specific error message"]
  }
}
```

### HTTP Status Codes
- `200 OK`: Successful GET, PATCH requests
- `201 Created`: Successful POST requests
- `204 No Content`: Successful DELETE requests
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Common Error Codes
- `VALIDATION_ERROR`: Form validation failed
- `AUTHENTICATION_FAILED`: Invalid credentials
- `TOKEN_EXPIRED`: JWT token expired
- `PERMISSION_DENIED`: Insufficient permissions
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `FILE_TOO_LARGE`: Uploaded file exceeds size limit
- `INVALID_FILE_TYPE`: File type not allowed

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Public APIs**: 100 requests per minute per IP
- **Authenticated APIs**: 1000 requests per minute per user
- **File Uploads**: 10 uploads per minute per user

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## File Upload

### Supported File Types
- **Documents**: PDF, DOC, DOCX, TXT
- **Images**: JPG, JPEG, PNG, GIF
- **Spreadsheets**: XLS, XLSX, CSV

### File Size Limits
- **Maximum file size**: 10MB per file
- **Maximum files per submission**: 10 files
- **Total submission size**: 50MB

### File Upload Example
```javascript
const formData = new FormData();
formData.append('submitted_by', 'John Doe');
formData.append('field_value', 'Some value');
formData.append('files', fileInput.files[0]);

fetch('/api/public/1/submit/', {
  method: 'POST',
  body: formData
});
```

## Webhooks (Future Enhancement)

### Form Submission Webhook
```http
POST https://your-webhook-url.com/form-submission
Content-Type: application/json
X-FormFlow-Signature: sha256=...

{
  "event": "form.submission.created",
  "data": {
    "submission_id": 123,
    "form_template_id": 1,
    "submitted_by": "John Doe",
    "submitted_at": "2024-01-01T00:00:00Z",
    "form_data": {...}
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install formflow-sdk
```

```javascript
import FormFlow from 'formflow-sdk';

const client = new FormFlow({
  baseURL: 'http://localhost:8000/api/',
  apiKey: 'your-jwt-token'
});

// Get forms
const forms = await client.forms.list();

// Submit form
const submission = await client.forms.submit(formId, {
  submitted_by: 'John Doe',
  field_data: {...}
});
```

### Python
```bash
pip install formflow-sdk
```

```python
from formflow import FormFlowClient

client = FormFlowClient(
    base_url='http://localhost:8000/api/',
    api_key='your-jwt-token'
)

# Get forms
forms = client.forms.list()

# Submit form
submission = client.forms.submit(form_id, {
    'submitted_by': 'John Doe',
    'field_data': {...}
})
```

## Testing

### Test Environment
- **Base URL**: `http://localhost:8000/api/`
- **Test Credentials**: Username: `admin`, Password: `admin123`
- **Mock Data**: Pre-populated test forms and submissions available

### API Testing Tools
- **Swagger UI**: Available at `/api/docs/`
- **ReDoc**: Available at `/api/redoc/`
- **Django REST Framework Browsable API**: Available at `/api/`

## Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- Form template management
- Form submission handling
- File upload support
- JWT authentication
- Admin dashboard APIs

### v1.1.0 (Planned)
- Webhook support
- Advanced filtering
- Bulk operations
- Analytics endpoints
- Mobile SDK

## Support

For API support and questions:
- **Documentation**: See README.md in project root
- **Email**: kakwiristephen@gmail.com
- **Project**: FormFlow Platform Assessment
- **Local Development**: http://localhost:8000/api/
