# Task Management Application - Development Guide

This guide covers setting up and developing the full-stack task management application locally.

## Project Overview

This is a comprehensive task management application built with:

- **Frontend**: Next.js 14 with React, TypeScript, and Tailwind CSS
- **Backend**: FastAPI with Python 3.11
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Cache**: Redis for session management and caching
- **Authentication**: JWT, OAuth (Google, GitHub), and session-based auth
- **Deployment**: Docker containers with NGINX reverse proxy

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Docker and Docker Compose
- Git

## Quick Start

### 1. Clone and Setup

```bash
git clone <your-repository-url>
cd Task_Management_Application
./setup.sh
```

This will:
- Check prerequisites
- Create environment files
- Start all services with Docker
- Run database migrations
- Display access information

### 2. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Development Setup

### Backend Development

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

6. **Start the development server**:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Development

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Project Structure

```
Task_Management_Application/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── core/           # Core configuration and utilities
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routers/        # API routes
│   │   └── __init__.py
│   ├── alembic/            # Database migrations
│   ├── tests/              # Test files
│   ├── main.py             # FastAPI application entry point
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend Docker configuration
├── frontend/               # Next.js frontend
│   ├── app/                # Next.js 13+ app directory
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── types/              # TypeScript type definitions
│   ├── package.json        # Node.js dependencies
│   └── Dockerfile          # Frontend Docker configuration
├── nginx/                  # NGINX configuration
├── .github/workflows/      # CI/CD pipeline
├── docker-compose.yml      # Development Docker setup
├── docker-compose.prod.yml # Production Docker setup
├── setup.sh               # Development setup script
├── deploy.sh              # Production deployment script
└── README.md              # Project documentation
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/github` - GitHub OAuth login

### User Endpoints

- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user
- `DELETE /api/users/me` - Delete current user

### Task Endpoints

- `GET /api/tasks` - Get user's tasks (with filtering and pagination)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PATCH /api/tasks/{id}/complete` - Mark task as completed
- `GET /api/tasks/stats/summary` - Get task statistics

## Database Schema

### Users Table
- `id` (Primary Key)
- `email` (Unique)
- `username` (Unique)
- `hashed_password`
- `full_name`
- `is_active`
- `is_verified`
- `avatar_url`
- `provider` (local, google, github)
- `provider_id`
- `created_at`
- `updated_at`
- `last_login`

### Tasks Table
- `id` (Primary Key)
- `title`
- `description`
- `status` (todo, in_progress, completed, cancelled)
- `priority` (low, medium, high, urgent)
- `due_date`
- `completed_at`
- `owner_id` (Foreign Key to Users)
- `created_at`
- `updated_at`

### Refresh Tokens Table
- `id` (Primary Key)
- `token` (Unique)
- `user_id` (Foreign Key to Users)
- `is_revoked`
- `expires_at`
- `created_at`

## Development Workflow

### 1. Feature Development

1. Create a new branch:
   ```bash
   git checkout -b feature/new-feature
   ```

2. Make your changes
3. Write tests
4. Run tests:
   ```bash
   # Backend tests
   cd backend && pytest

   # Frontend tests
   cd frontend && npm test
   ```

5. Commit your changes:
   ```bash
   git add .
   git commit -m "Add new feature"
   ```

6. Push and create pull request:
   ```bash
   git push origin feature/new-feature
   ```

### 2. Database Changes

1. Create a new migration:
   ```bash
   cd backend
   alembic revision --autogenerate -m "Description of changes"
   ```

2. Review the generated migration file
3. Apply the migration:
   ```bash
   alembic upgrade head
   ```

### 3. API Development

1. Define Pydantic schemas in `app/schemas/`
2. Create SQLAlchemy models in `app/models/`
3. Implement API routes in `app/routers/`
4. Add authentication/authorization as needed
5. Write tests for your endpoints

### 4. Frontend Development

1. Create TypeScript types in `types/`
2. Implement API calls in `lib/api.ts`
3. Create React components in `components/`
4. Use custom hooks for state management
5. Add proper error handling and loading states

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v
```

### Frontend Testing

```bash
cd frontend

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## Code Quality

### Backend

- Use type hints for all functions
- Follow PEP 8 style guidelines
- Use Pydantic for data validation
- Write comprehensive docstrings
- Use dependency injection for database sessions

### Frontend

- Use TypeScript for type safety
- Follow React best practices
- Use custom hooks for reusable logic
- Implement proper error boundaries
- Use Tailwind CSS for styling

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/task_management
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000

# OAuth Settings
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Docker Development

### Start all services

```bash
docker-compose up --build
```

### Start specific service

```bash
docker-compose up backend
docker-compose up frontend
docker-compose up postgres
docker-compose up redis
```

### View logs

```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop services

```bash
docker-compose down
```

### Rebuild services

```bash
docker-compose up --build --force-recreate
```

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Find process using port
   lsof -i :3000
   lsof -i :8000
   
   # Kill process
   kill -9 <PID>
   ```

2. **Database connection issues**:
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # Check database logs
   docker-compose logs postgres
   ```

3. **Redis connection issues**:
   ```bash
   # Check if Redis is running
   docker-compose ps redis
   
   # Test Redis connection
   docker-compose exec redis redis-cli ping
   ```

4. **Frontend build issues**:
   ```bash
   # Clear Next.js cache
   rm -rf frontend/.next
   
   # Reinstall dependencies
   cd frontend && rm -rf node_modules && npm install
   ```

5. **Backend import issues**:
   ```bash
   # Check Python path
   export PYTHONPATH="${PYTHONPATH}:$(pwd)/backend"
   
   # Reinstall dependencies
   cd backend && pip install -r requirements.txt
   ```

### Performance Issues

1. **Slow database queries**:
   - Check database indexes
   - Use database query profiling
   - Optimize SQLAlchemy queries

2. **Frontend performance**:
   - Use React DevTools Profiler
   - Implement code splitting
   - Optimize bundle size

3. **Memory issues**:
   ```bash
   # Check Docker memory usage
   docker stats
   
   # Check system memory
   free -h
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Ensure all tests pass
6. Submit a pull request

### Pull Request Guidelines

- Provide a clear description of changes
- Include tests for new functionality
- Update documentation as needed
- Ensure code follows project conventions
- Request review from team members

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
