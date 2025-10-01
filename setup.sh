#!/bin/bash

echo "🔧 Setting up Onboarding Form System..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "   Please install Python 3.8+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "   Please install Node.js 18+ and try again."
    exit 1
fi

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo "❌ Redis is required but not installed."
    echo "   macOS: brew install redis"
    echo "   Ubuntu: sudo apt install redis-server"
    echo "   Or use Docker: docker run -d -p 6379:6379 redis:alpine"
    exit 1
fi

# Start Redis if not running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "🔄 Starting Redis..."
    if command -v brew &> /dev/null; then
        brew services start redis
    elif command -v systemctl &> /dev/null; then
        sudo systemctl start redis
    else
        echo "❌ Please start Redis manually and run this script again."
        exit 1
    fi
    sleep 2
fi

echo "✅ Redis is running"

# Setup Backend
echo "📦 Setting up Django backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Create admin user if it doesn't exist
echo "Creating admin user..."
python manage.py shell << EOF
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Admin user created: admin / admin123')
else:
    print('Admin user already exists')
EOF

cd ..

# Setup Frontend
echo "⚛️ Setting up Next.js frontend..."
cd frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   ./start_simple.sh"
echo ""
echo "🌐 Access Points:"
echo "   Client:  http://localhost:3000"
echo "   Admin:   http://localhost:3000/admin"
echo "   API:     http://localhost:8000/api/"
echo ""
echo "🔐 Login: admin / admin123"
