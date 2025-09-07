#!/bin/bash

# Task Management Application Setup Script
# This script sets up the full-stack task management application

set -e

echo "🚀 Setting up Task Management Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if Node.js is installed (for development)
check_node() {
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed. You'll need it for frontend development."
        print_warning "Install Node.js from https://nodejs.org/"
    else
        print_success "Node.js is installed"
    fi
}

# Check if Python is installed (for development)
check_python() {
    if ! command -v python3 &> /dev/null; then
        print_warning "Python 3 is not installed. You'll need it for backend development."
        print_warning "Install Python 3 from https://python.org/"
    else
        print_success "Python 3 is installed"
    fi
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Backend environment file
    if [ ! -f backend/.env ]; then
        cp backend/env.example backend/.env
        print_success "Created backend/.env file"
    else
        print_warning "backend/.env already exists"
    fi
    
    # Frontend environment file
    if [ ! -f frontend/.env.local ]; then
        cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
        print_success "Created frontend/.env.local file"
    else
        print_warning "frontend/.env.local already exists"
    fi
}

# Build and start services
start_services() {
    print_status "Building and starting services with Docker Compose..."
    
    # Build and start all services
    docker-compose up --build -d
    
    print_success "Services started successfully!"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    print_status "Waiting for PostgreSQL..."
    until docker-compose exec postgres pg_isready -U postgres; do
        sleep 2
    done
    print_success "PostgreSQL is ready"
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    until docker-compose exec redis redis-cli ping; do
        sleep 2
    done
    print_success "Redis is ready"
    
    # Wait for backend
    print_status "Waiting for backend..."
    until curl -f http://localhost:8000/health > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Backend is ready"
    
    # Wait for frontend
    print_status "Waiting for frontend..."
    until curl -f http://localhost:3000 > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Frontend is ready"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Create initial migration
    docker-compose exec backend alembic revision --autogenerate -m "Initial migration"
    
    # Run migrations
    docker-compose exec backend alembic upgrade head
    
    print_success "Database migrations completed"
}

# Display access information
show_access_info() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "📱 Access your application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   API Documentation: http://localhost:8000/docs"
    echo ""
    echo "🔧 Development commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart services: docker-compose restart"
    echo "   Rebuild services: docker-compose up --build"
    echo ""
    echo "📚 Next steps:"
    echo "   1. Open http://localhost:3000 in your browser"
    echo "   2. Create an account or sign in"
    echo "   3. Start managing your tasks!"
    echo ""
}

# Main setup function
main() {
    echo "=========================================="
    echo "  Task Management Application Setup"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    check_docker
    check_node
    check_python
    
    # Create environment files
    create_env_files
    
    # Start services
    start_services
    
    # Wait for services
    wait_for_services
    
    # Run migrations
    run_migrations
    
    # Show access information
    show_access_info
}

# Run main function
main "$@"
