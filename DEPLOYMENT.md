# Task Management Application - Deployment Guide

This guide covers deploying the full-stack task management application to production.

## Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Root or sudo access
- Domain name (optional, can use IP address)
- SSL certificate (for HTTPS)

## Quick Deployment

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Task_Management_Application
```

### 2. Configure Environment Variables

Set the following environment variables:

```bash
export DOMAIN=your-domain.com
export DB_PASSWORD=your-secure-password
export SECRET_KEY=$(openssl rand -hex 32)
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret
export GITHUB_CLIENT_ID=your-github-client-id
export GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 3. Run Deployment Script

```bash
./deploy.sh
```

The script will:
- Install Docker and Docker Compose
- Configure firewall
- Create production environment files
- Generate SSL certificates
- Deploy the application
- Set up monitoring and backup scripts

## Manual Deployment

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Configure Environment

Create production environment files:

```bash
# Backend environment
cp backend/env.example backend/.env.production
# Edit backend/.env.production with your values

# Frontend environment
echo "NEXT_PUBLIC_API_URL=https://your-domain.com/api" > frontend/.env.production
```

### 3. Deploy with Docker Compose

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up --build -d

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## Configuration

### Environment Variables

#### Backend (.env.production)

```env
DATABASE_URL=postgresql://postgres:password@postgres:5432/task_management
REDIS_URL=redis://redis:6379
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=https://your-domain.com

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

#### Frontend (.env.production)

```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

### SSL Certificates

For production, replace the self-signed certificates with proper ones:

1. **Let's Encrypt (Recommended)**:
   ```bash
   sudo apt install certbot
   sudo certbot certonly --standalone -d your-domain.com
   ```

2. **Update NGINX configuration** to use the certificates:
   ```nginx
   ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
   ```

### OAuth Configuration

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-domain.com/auth/callback/google`
6. Copy Client ID and Client Secret to environment variables

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `https://your-domain.com/auth/callback/github`
4. Copy Client ID and Client Secret to environment variables

## Monitoring

### Health Checks

The application provides health check endpoints:

- Backend: `https://your-domain.com/api/health`
- Frontend: `https://your-domain.com/`

### Monitoring Script

Use the provided monitoring script:

```bash
./monitor.sh
```

This will show:
- Service status
- Resource usage
- Health checks

### Logs

View application logs:

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
```

## Backup and Recovery

### Database Backup

Use the provided backup script:

```bash
./backup.sh
```

This creates a timestamped SQL dump and keeps the last 7 backups.

### Manual Backup

```bash
# Create backup directory
mkdir -p backups

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres task_management > backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore from Backup

```bash
# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres task_management < backups/backup_file.sql
```

## Scaling

### Horizontal Scaling

To scale the application:

1. **Load Balancer**: Use NGINX or a cloud load balancer
2. **Multiple Backend Instances**: Run multiple backend containers
3. **Database Clustering**: Use PostgreSQL clustering
4. **Redis Clustering**: Use Redis Cluster for caching

### Vertical Scaling

Increase resources:

```yaml
# In docker-compose.prod.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

## Security

### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### SSL/TLS

- Use strong SSL/TLS configuration
- Enable HSTS headers
- Use secure cipher suites
- Regular certificate renewal

### Application Security

- Regular security updates
- Strong passwords
- JWT token rotation
- Rate limiting
- Input validation
- SQL injection prevention

## Troubleshooting

### Common Issues

1. **Services not starting**:
   ```bash
   docker-compose -f docker-compose.prod.yml logs
   ```

2. **Database connection issues**:
   ```bash
   docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres
   ```

3. **SSL certificate issues**:
   ```bash
   openssl x509 -in nginx/ssl/cert.pem -text -noout
   ```

4. **Memory issues**:
   ```bash
   docker stats
   ```

### Performance Optimization

1. **Enable caching**:
   - Redis caching is already configured
   - NGINX static file caching

2. **Database optimization**:
   - Regular VACUUM and ANALYZE
   - Proper indexing
   - Connection pooling

3. **Frontend optimization**:
   - Enable gzip compression
   - Static file caching
   - CDN for static assets

## Maintenance

### Regular Tasks

1. **Daily**:
   - Check service health
   - Monitor resource usage
   - Review logs

2. **Weekly**:
   - Database backup
   - Security updates
   - Performance review

3. **Monthly**:
   - SSL certificate renewal
   - Dependency updates
   - Security audit

### Updates

To update the application:

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up --build -d

# Run migrations if needed
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## Support

For issues and questions:

1. Check the logs first
2. Review this documentation
3. Check the GitHub issues
4. Contact the development team

## Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] OAuth providers configured
- [ ] Email notifications set up
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Firewall configured
- [ ] Security headers enabled
- [ ] Performance optimized
- [ ] Documentation updated
