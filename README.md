# FormFlow - Dynamic Onboarding Form System

A comprehensive full-stack onboarding platform for financial services firms that supports customizable forms, document uploads, and asynchronous admin notifications. Built as a professional assessment project demonstrating modern web development practices.

## 🚀 Features

### Admin Features
- **Dynamic Form Builder**: Create unlimited forms with various field types
- **Field Configuration**: Support for text, email, number, date, dropdown, checkbox, radio, textarea, file upload, and phone fields
- **Conditional Logic**: Fields can show/hide based on other field values
- **Form Management**: Edit, delete, and manage form templates
- **Submission Monitoring**: View and process form submissions
- **Real-time Notifications**: Email notifications when new forms are submitted

### Client Features
- **Public Form Access**: Users can view and fill out available forms
- **Dynamic Form Rendering**: Forms render based on admin configuration
- **File Upload Support**: Multiple file uploads per form
- **Form Validation**: Client-side and server-side validation
- **Responsive Design**: Mobile-friendly interface

### Technical Features
- **Scalable Architecture**: Designed to handle unlimited forms and fields
- **Async Processing**: Celery-based background tasks for notifications
- **Flexible Data Model**: JSON-based configuration for maximum flexibility
- **RESTful API**: Complete API for all operations
- **Comprehensive Testing**: Unit tests for all components

## 🏗️ Architecture

### Backend (Django + DRF)
- **Django 5.2**: Web framework
- **Django REST Framework**: API development
- **Celery**: Async task processing
- **Redis**: Message broker and cache
- **SQLite**: Database (easily configurable for PostgreSQL/MySQL)

### Frontend (Next.js + React)
- **Next.js 15**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **React Hook Form**: Form handling
- **Zod**: Schema validation

## 📋 Design Decisions

### 1. Field Configuration Strategy
**Choice**: JSON-based configuration with dedicated field models
**Justification**: 
- Provides maximum flexibility for future field types
- Allows complex validation rules and conditional logic
- Maintains data integrity while supporting dynamic schemas
- Easier to extend without database migrations

### 2. Form Rendering Approach
**Choice**: Server-side form configuration with client-side rendering
**Justification**:
- Better performance (no need to fetch field configs separately)
- Consistent validation between frontend and backend
- Easier to maintain and debug
- Supports complex conditional logic

### 3. Notification System
**Choice**: Celery with email notifications
**Justification**:
- Async processing prevents blocking form submissions
- Easily extensible to support multiple notification channels
- Reliable with retry mechanisms
- Can handle high volume of submissions

### 4. File Upload Strategy
**Choice**: Direct file storage with metadata tracking
**Justification**:
- Simple and reliable file handling
- Easy to implement file validation
- Supports multiple files per form
- Clear audit trail of uploaded files

## 🚀 Quick Start

### One-Command Setup
```bash
git clone <your-repo-url>
cd FormFlow
chmod +x setup.sh start_simple.sh
./setup.sh
./start_simple.sh
```

> **Project Structure**: See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for file organization

### Manual Setup
```bash
# Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python manage.py migrate
python manage.py createsuperuser  # admin/admin123
python manage.py runserver

# Frontend (new terminal)
cd frontend && npm install && npm run dev

# Celery (new terminal)
cd backend && source venv/bin/activate
celery -A onboarding_system worker --loglevel=info
```

### Access Points
- **Client**: http://localhost:3000
- **Admin**: http://localhost:3000/admin (admin/admin123)
- **API**: http://localhost:8000/api/

## API

**Authentication**: JWT tokens required for admin endpoints
**Public Endpoints**: `/api/public/` for form submissions
**Admin Endpoints**: `/api/forms/`, `/api/submissions/` for management

## 🧪 Testing

```bash
# Backend tests
cd backend && python manage.py test

# Frontend tests  
cd frontend && npm test
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
CELERY_BROKER_URL=redis://localhost:6379/0
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
ADMIN_EMAIL=admin@example.com
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📈 Scalability Considerations

### Database
- Current: SQLite (development)
- Production: PostgreSQL or MySQL
- Indexing on frequently queried fields
- Consider read replicas for high read volume

### File Storage
- Current: Local file storage
- Production: AWS S3, Google Cloud Storage, or Azure Blob
- CDN for file delivery

### Caching
- Redis for session storage
- Consider Redis for API response caching
- Frontend caching for form templates

### Background Tasks
- Celery with Redis broker
- Consider RabbitMQ for high volume
- Horizontal scaling of Celery workers

## 🔒 Security Features

- CSRF protection
- CORS configuration
- File upload validation
- SQL injection prevention (Django ORM)
- XSS protection
- Secure file storage
- Input validation and sanitization

## 🚀 Deployment

### Backend Deployment
1. Set up production database
2. Configure environment variables
3. Run migrations
4. Set up Celery workers
5. Configure web server (Nginx + Gunicorn)

### Frontend Deployment
1. Build production bundle
2. Deploy to CDN or static hosting
3. Configure environment variables

### Recommended Platforms
- **Backend**: Heroku, DigitalOcean, AWS EC2
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: PostgreSQL on AWS RDS, Google Cloud SQL
- **Redis**: AWS ElastiCache, Redis Cloud

## Documentation

### Core Documentation
- [Quick Start Guide](QUICK_START.md) - Get up and running quickly
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Production deployment instructions
- [Project Structure](PROJECT_STRUCTURE.md) - Codebase organization

### Technical Documentation
- [Architecture Documentation](ARCHITECTURE.md) - System architecture and design decisions
- [API Documentation](API_DOCUMENTATION.md) - Complete API reference and examples
- [Design Rationale](DESIGN_RATIONALE.md) - Detailed design decisions and rationale
- [Testing Guide](TESTING_GUIDE.md) - Comprehensive testing strategy and examples

### Assessment Requirements
This project fulfills all requirements from the Full Stack Developer Practical Assessment:

✅ **Admin Setup**: Visual form builder with field configuration  
✅ **Client Submission**: Public form access with file uploads  
✅ **Notifications**: Celery-based async email notifications  
✅ **Edge Cases**: Handles unlimited forms, evolving fields, multiple file uploads  
✅ **Scalability**: Designed for unknown future requirements  
✅ **Documentation**: Comprehensive technical documentation  
✅ **Testing**: Unit, integration, and E2E test coverage  
✅ **Professional Quality**: Production-ready code and design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Note**: This system is designed to be highly flexible and scalable. The JSON-based configuration allows for easy extension without code changes, making it perfect for evolving business requirements.
