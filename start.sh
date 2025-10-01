#!/bin/bash

# Creative Dynamic Onboarding Form System - Startup Script

echo "🚀 Starting Creative Dynamic Onboarding Form System..."

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "⚠️  Redis is not running. Please start Redis first:"
    echo "   brew install redis && brew services start redis"
    echo "   or"
    echo "   docker run -d -p 6379:6379 redis:alpine"
    exit 1
fi

# Start backend
echo "📦 Starting Django backend..."
cd backend
source venv/bin/activate
python manage.py runserver &
BACKEND_PID=$!

# Start Celery worker
echo "🔄 Starting Celery worker..."
celery -A onboarding_system worker --loglevel=info &
CELERY_PID=$!

# Start frontend
echo "⚛️  Starting Next.js frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ All services started successfully!"
echo ""
echo "🌐 Access the application:"
echo "   Client Interface: http://localhost:3000"
echo "   Admin Interface:  http://localhost:3000/admin"
echo "   Django Admin:     http://localhost:8000/admin"
echo "   API Endpoints:    http://localhost:8000/api/"
echo ""
echo "📝 To create an admin user, run:"
echo "   cd backend && source venv/bin/activate && python manage.py createsuperuser"
echo ""
echo "🛑 To stop all services, press Ctrl+C"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID $CELERY_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for any process to exit
wait
