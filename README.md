# Full-Stack Task Management Application

A comprehensive task management application built with modern web technologies.

## Features

- **Frontend**: Next.js with React hooks, TypeScript, and responsive design
- **Backend**: FastAPI with PostgreSQL ORM and Redis caching
- **Authentication**: JWT, OAuth, SSO, and session authentication
- **Deployment**: Docker containers with CI/CD pipelines and NGINX
- **Database**: PostgreSQL with ACID compliance
- **Caching**: Redis for improved performance

## Project Structure

```
├── frontend/          # Next.js React application
├── backend/           # FastAPI Python application
├── docker/            # Docker configuration files
├── nginx/             # NGINX configuration
├── .github/           # CI/CD pipeline configuration
└── README.md
```

## Quick Start

1. Clone the repository
2. Run `docker-compose up` to start all services
3. Access the application at `http://localhost:3000`

## Development

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Technologies Used

- **Frontend**: Next.js, React, TypeScript
- **Backend**: FastAPI, PostgreSQL, Redis
- **Authentication**: JWT, OAuth, SSO
- **Deployment**: Docker, NGINX, CI/CD
