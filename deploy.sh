#!/bin/bash

# Task Management Application Deployment Script
# This script deploys the application to production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        print_warning "Running as root. Consider using a non-root user for security."
    fi
}

# Install system dependencies
install_dependencies() {
    print_status "Installing system dependencies..."
    
    # Update package list
    sudo apt-get update
    
    # Install required packages
    sudo apt-get install -y \
        curl \
        wget \
        git \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release
    
    print_success "System dependencies installed"
}

# Install Docker
install_docker() {
    if command -v docker &> /dev/null; then
        print_success "Docker is already installed"
        return
    fi
    
    print_status "Installing Docker..."
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker installed successfully"
    print_warning "Please log out and log back in for Docker group changes to take effect"
}

# Install Docker Compose
install_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose is already installed"
        return
    fi
    
    print_status "Installing Docker Compose..."
    
    # Download Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Make it executable
    sudo chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker Compose installed successfully"
}

# Configure firewall
configure_firewall() {
    print_status "Configuring firewall..."
    
    # Allow SSH
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80
    sudo ufw allow 443
    
    # Enable firewall
    sudo ufw --force enable
    
    print_success "Firewall configured"
}

# Create production environment files
create_production_env() {
    print_status "Creating production environment files..."
    
    # Backend production environment
    cat > backend/.env.production << EOF
DATABASE_URL=postgresql://postgres:${DB_PASSWORD:-changeme}@postgres:5432/task_management
REDIS_URL=redis://redis:6379
SECRET_KEY=${SECRET_KEY:-$(openssl rand -hex 32)}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=https://${DOMAIN:-your-domain.com},http://${DOMAIN:-your-domain.com}

# OAuth Settings (configure these)
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-}
GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID:-}
GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET:-}

# Email Settings (configure these)
SMTP_HOST=${SMTP_HOST:-}
SMTP_PORT=${SMTP_PORT:-587}
SMTP_USERNAME=${SMTP_USERNAME:-}
SMTP_PASSWORD=${SMTP_PASSWORD:-}
EOF

    # Frontend production environment
    cat > frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=https://${DOMAIN:-your-domain.com}/api
EOF

    print_success "Production environment files created"
}

# Create production Docker Compose file
create_production_compose() {
    print_status "Creating production Docker Compose file..."
    
    cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: task_management
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: \${DB_PASSWORD:-changeme}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    networks:
      - app-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - app-network

  # FastAPI Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://postgres:\${DB_PASSWORD:-changeme}@postgres:5432/task_management
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=\${SECRET_KEY:-changeme}
      - CORS_ORIGINS=https://\${DOMAIN:-your-domain.com}
    restart: unless-stopped
    depends_on:
      - postgres
      - redis
    networks:
      - app-network

  # Next.js Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      - NEXT_PUBLIC_API_URL=https://\${DOMAIN:-your-domain.com}/api
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - app-network

  # NGINX Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/logs:/var/log/nginx
    restart: unless-stopped
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
EOF

    print_success "Production Docker Compose file created"
}

# Setup SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    # Create SSL directory
    mkdir -p nginx/ssl
    
    # Generate self-signed certificate for testing
    # In production, use Let's Encrypt or a proper certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=${DOMAIN:-localhost}"
    
    print_success "SSL certificates generated"
    print_warning "For production, replace with proper SSL certificates"
}

# Deploy application
deploy_application() {
    print_status "Deploying application..."
    
    # Stop existing services
    docker-compose -f docker-compose.prod.yml down || true
    
    # Build and start services
    docker-compose -f docker-compose.prod.yml up --build -d
    
    # Run migrations
    docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
    
    print_success "Application deployed successfully"
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Create monitoring script
    cat > monitor.sh << 'EOF'
#!/bin/bash

# Simple monitoring script
echo "=== Task Management App Status ==="
echo "Date: $(date)"
echo ""

# Check Docker services
echo "Docker Services:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "Service Health:"

# Check backend health
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ Backend: Healthy"
else
    echo "❌ Backend: Unhealthy"
fi

# Check frontend
if curl -f http://localhost/ > /dev/null 2>&1; then
    echo "✅ Frontend: Healthy"
else
    echo "❌ Frontend: Unhealthy"
fi

# Check database
if docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database: Healthy"
else
    echo "❌ Database: Unhealthy"
fi

# Check Redis
if docker-compose -f docker-compose.prod.yml exec redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: Healthy"
else
    echo "❌ Redis: Unhealthy"
fi

echo ""
echo "Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
EOF

    chmod +x monitor.sh
    
    print_success "Monitoring setup completed"
}

# Create backup script
create_backup_script() {
    print_status "Creating backup script..."
    
    cat > backup.sh << 'EOF'
#!/bin/bash

# Database backup script
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="task_management_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

echo "Creating database backup..."
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres task_management > $BACKUP_DIR/$BACKUP_FILE

echo "Backup created: $BACKUP_DIR/$BACKUP_FILE"

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t task_management_backup_*.sql | tail -n +8 | xargs -r rm

echo "Old backups cleaned up"
EOF

    chmod +x backup.sh
    
    print_success "Backup script created"
}

# Main deployment function
main() {
    echo "=========================================="
    echo "  Task Management Application Deployment"
    echo "=========================================="
    echo ""
    
    # Check if running as root
    check_root
    
    # Install dependencies
    install_dependencies
    install_docker
    install_docker_compose
    
    # Configure system
    configure_firewall
    
    # Create production configuration
    create_production_env
    create_production_compose
    setup_ssl
    
    # Deploy application
    deploy_application
    
    # Setup monitoring and backup
    setup_monitoring
    create_backup_script
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📱 Your application is now running at:"
    echo "   http://${DOMAIN:-your-domain.com}"
    echo ""
    echo "🔧 Management commands:"
    echo "   Monitor: ./monitor.sh"
    echo "   Backup: ./backup.sh"
    echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "   Restart: docker-compose -f docker-compose.prod.yml restart"
    echo ""
    echo "⚠️  Important:"
    echo "   1. Update environment variables in backend/.env.production"
    echo "   2. Replace SSL certificates with proper ones"
    echo "   3. Configure OAuth providers"
    echo "   4. Set up email notifications"
    echo ""
}

# Check command line arguments
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --help, -h    Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  DOMAIN        Domain name for the application"
    echo "  DB_PASSWORD   Database password"
    echo "  SECRET_KEY    Secret key for JWT tokens"
    echo ""
    echo "Example:"
    echo "  DOMAIN=myapp.com DB_PASSWORD=securepass $0"
    exit 0
fi

# Run main function
main "$@"
