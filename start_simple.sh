#!/bin/bash

echo "🚀 Starting Onboarding Form System..."

# Check Redis
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis not running. Please start Redis first:"
    echo "   macOS: brew services start redis"
    echo "   Linux: sudo systemctl start redis"
    echo "   Docker: docker run -d -p 6379:6379 redis:alpine"
    exit 1
fi

echo "✅ Redis is running"

# Start Django
echo "📦 Starting Django backend..."
cd backend
source venv/bin/activate
python manage.py runserver &
DJANGO_PID=$!

# Start Celery
echo "🔄 Starting Celery worker..."
celery -A onboarding_system worker --loglevel=info &
CELERY_PID=$!

# Start Frontend
echo "⚛️ Starting Next.js frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "🌐 Access Points:"
echo "   Client:  http://localhost:3000"
echo "   Admin:   http://localhost:3000/admin"
echo "   API:     http://localhost:8000/api/"
echo ""
echo "🔐 Login: admin / admin123"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $DJANGO_PID $CELERY_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM
wait
