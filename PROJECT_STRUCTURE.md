# 📁 Project Structure

```
FormFlow/
├── README.md                 # Main documentation
├── QUICK_START.md           # Setup guide
├── DEPLOYMENT_GUIDE.md      # Production deployment
├── setup.sh                 # Automated setup script
├── start_simple.sh          # Simple startup script
├── start.sh                 # Original startup script
├── create_admin.py          # Admin user creation script
├── backend/                 # Django REST API
│   ├── forms/              # Forms app
│   ├── onboarding_system/  # Django settings
│   └── requirements.txt    # Python dependencies
└── frontend/               # Next.js React app
    ├── src/
    │   ├── app/           # Pages
    │   ├── components/    # React components
    │   ├── services/      # API services
    │   └── types/         # TypeScript types
    └── package.json       # Node.js dependencies
```

## Key Files

- **README.md**: Main documentation and overview
- **QUICK_START.md**: Step-by-step setup instructions
- **setup.sh**: Automated setup (installs dependencies, creates admin)
- **start_simple.sh**: One-command startup
- **create_admin.py**: Creates admin user (admin/admin123)

## Getting Started

1. Run `./setup.sh` to set up everything
2. Run `./start_simple.sh` to start all services
3. Visit http://localhost:3000 for client interface
4. Visit http://localhost:3000/admin for admin dashboard
