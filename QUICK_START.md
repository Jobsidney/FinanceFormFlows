# 🚀 Quick Start Guide

## Prerequisites

- **Python 3.8+**
- **Node.js 18+**
- **Redis** (for background tasks)

## One-Command Setup

```bash
# Clone and start everything
git clone <your-repo-url>
cd FormFlow
chmod +x setup.sh start_simple.sh
./setup.sh
./start_simple.sh
```

## Manual Setup

### 1. Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser
# Username: admin
# Email: admin@example.com
# Password: admin123

# Start Django server
python manage.py runserver
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Start Celery Worker (New Terminal)

```bash
cd backend
source venv/bin/activate
celery -A onboarding_system worker --loglevel=info
```

## Access Points

- **Client Forms**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Django Admin**: http://localhost:8000/admin
- **API**: http://localhost:8000/api/

## Demo Credentials

- **Username**: admin
- **Password**: admin123

## Troubleshooting

### Redis Connection Error
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Start Redis if not running
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

### Port Already in Use
```bash
# Kill processes on ports 3000 and 8000
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Database Issues
```bash
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py createsuperuser
```

## Features Demo

1. **Visit Admin Dashboard**: http://localhost:3000/admin
2. **Login** with admin/admin123
3. **Create a new form** using the form builder
4. **Visit Client Interface**: http://localhost:3000
5. **Fill out the form** you just created
6. **Check submissions** in the admin dashboard

## Production Deployment

See `README.md` for detailed deployment instructions.
