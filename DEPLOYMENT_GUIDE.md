# FitTrack Pro - Deployment Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Production Deployment](#production-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment (AWS/Azure/GCP)](#cloud-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Database Migration](#database-migration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Backup & Recovery](#backup--recovery)

---

## Local Development Setup

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 15+
- Maven 3.9+
- Angular CLI 17+
- Docker & Docker Compose (optional)

### Quick Start

#### 1. Database Setup
```bash
# Option A: Using Docker
cd /path/to/project
docker-compose up -d postgres

# Option B: Local PostgreSQL
createdb fittrack
psql fittrack < setup.sql
```

#### 2. Backend Setup
```bash
cd fittrack-backend

# Create .env file
cat > .env << EOF
DB_URL=jdbc:postgresql://localhost:5432/fittrack
DB_USER=fittrack_user
DB_PASSWORD=fittrack_pass
JWT_SECRET=$(openssl rand -base64 64)
SERVER_PORT=8080
EOF

# Load environment and run
source .env
mvn clean install
mvn spring-boot:run
```

Backend available at: `http://localhost:8080`

#### 3. Frontend Setup
```bash
cd fittrack-frontend

npm install
ng serve

# Or with custom port
ng serve --port 4200
```

Frontend available at: `http://localhost:4200`

---

## Production Deployment

### Backend Production Build

#### 1. Create Production JAR
```bash
cd fittrack-backend

# Clean and package
mvn clean package -DskipTests

# JAR location
ls target/fittrack-backend-0.0.1-SNAPSHOT.jar
```

#### 2. Run Production JAR
```bash
# With environment variables
java -jar target/fittrack-backend-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  --spring.datasource.url=jdbc:postgresql://prod-db:5432/fittrack \
  --spring.datasource.username=$DB_USER \
  --spring.datasource.password=$DB_PASSWORD \
  --jwt.secret=$JWT_SECRET \
  --server.port=8080
```

#### 3. Production application.yml
```yaml
spring:
  profiles: prod
  datasource:
    url: ${DB_URL}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  flyway:
    enabled: true
    baseline-on-migrate: true

server:
  port: 8080
  error:
    include-message: never
    include-stacktrace: never

logging:
  level:
    root: INFO
    com.fittrack: INFO
  file:
    name: /var/log/fittrack/application.log
```

### Frontend Production Build

#### 1. Build for Production
```bash
cd fittrack-frontend

# Production build
ng build --configuration production

# Build output in dist/fittrack-frontend/
```

#### 2. Serve with Nginx

Create `/etc/nginx/sites-available/fittrack`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/fittrack-frontend;
    index index.html;

    # Angular routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/fittrack /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## Docker Deployment

### Complete Stack with Docker Compose

#### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: fittrack-db-prod
    restart: always
    environment:
      POSTGRES_DB: fittrack
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - fittrack-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d fittrack"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./fittrack-backend
      dockerfile: Dockerfile
    container_name: fittrack-backend-prod
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/fittrack
      SPRING_DATASOURCE_USERNAME: ${DB_USER}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8080:8080"
    networks:
      - fittrack-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  frontend:
    build:
      context: ./fittrack-frontend
      dockerfile: Dockerfile.prod
    container_name: fittrack-frontend-prod
    restart: always
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - fittrack-network

volumes:
  postgres_data:
    driver: local

networks:
  fittrack-network:
    driver: bridge
```

#### Backend Dockerfile
```dockerfile
# fittrack-backend/Dockerfile
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Frontend Dockerfile
```dockerfile
# fittrack-frontend/Dockerfile.prod
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --configuration production

FROM nginx:alpine
COPY --from=build /app/dist/fittrack-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Deploy with Docker
```bash
# Create .env file with secrets
cat > .env << EOF
DB_USER=fittrack_user
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
EOF

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

---

## Cloud Deployment

### AWS Deployment

#### Architecture
- **EC2**: Application servers
- **RDS**: PostgreSQL database
- **S3**: Static assets
- **CloudFront**: CDN for frontend
- **Elastic Load Balancer**: Load balancing
- **Route 53**: DNS management

#### Deployment Steps

##### 1. Create RDS PostgreSQL Instance
```bash
aws rds create-db-instance \
  --db-instance-identifier fittrack-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --master-username fittrack_admin \
  --master-user-password $(openssl rand -base64 32) \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name fittrack-subnet
```

##### 2. Deploy Backend on EC2
```bash
# SSH to EC2 instance
ssh -i key.pem ec2-user@your-instance-ip

# Install Java
sudo yum install java-17-amazon-corretto

# Upload JAR
scp -i key.pem target/fittrack-backend.jar ec2-user@your-instance-ip:~/

# Create systemd service
sudo cat > /etc/systemd/system/fittrack-backend.service << EOF
[Unit]
Description=FitTrack Backend
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user
ExecStart=/usr/bin/java -jar /home/ec2-user/fittrack-backend.jar
Restart=always
Environment="SPRING_PROFILES_ACTIVE=prod"
Environment="DB_URL=jdbc:postgresql://fittrack-db.xxxxx.rds.amazonaws.com:5432/fittrack"

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl enable fittrack-backend
sudo systemctl start fittrack-backend
```

##### 3. Deploy Frontend to S3 + CloudFront
```bash
# Build production bundle
ng build --configuration production

# Sync to S3
aws s3 sync dist/fittrack-frontend/ s3://fittrack-frontend/ --delete

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name fittrack-frontend.s3.amazonaws.com \
  --default-root-object index.html
```

### Azure Deployment

#### Using Azure App Service
```bash
# Create resource group
az group create --name fittrack-rg --location eastus

# Create PostgreSQL
az postgres flexible-server create \
  --resource-group fittrack-rg \
  --name fittrack-db \
  --admin-user fittrack_admin \
  --admin-password YourPassword123! \
  --sku-name Standard_B1ms

# Deploy backend
az webapp up \
  --resource-group fittrack-rg \
  --name fittrack-backend \
  --runtime "JAVA:17-java17" \
  --sku B1

# Deploy frontend
az staticwebapp create \
  --name fittrack-frontend \
  --resource-group fittrack-rg \
  --source https://github.com/yourrepo/fittrack-frontend \
  --location eastus \
  --branch main
```

### Google Cloud Platform

#### Using Cloud Run
```bash
# Build and push Docker image
gcloud builds submit --tag gcr.io/PROJECT_ID/fittrack-backend

# Deploy to Cloud Run
gcloud run deploy fittrack-backend \
  --image gcr.io/PROJECT_ID/fittrack-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Create Cloud SQL instance
gcloud sql instances create fittrack-db \
  --database-version=POSTGRES_15 \
  --cpu=1 \
  --memory=3840MB \
  --region=us-central1
```

---

## Environment Configuration

### Production Environment Variables

#### Backend (.env or system environment)
```bash
# Database
DB_URL=jdbc:postgresql://production-db:5432/fittrack
DB_USER=fittrack_admin
DB_PASSWORD=<strong-password>

# JWT
JWT_SECRET=<256-bit-secret>
JWT_ACCESS_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

# Server
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod

# Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_FILE_PATH=/var/log/fittrack/

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

#### Frontend (environment.prod.ts)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com',
  apiVersion: 'v1'
};
```

---

## Database Migration

### Flyway in Production

#### Baseline Existing Database
```bash
mvn flyway:baseline -Dflyway.baselineVersion=1
```

#### Run Migrations
```bash
# Automatic on startup (application.yml)
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true

# Manual execution
mvn flyway:migrate

# Check status
mvn flyway:info
```

#### Rollback Strategy
```sql
-- Create backup before migration
pg_dump fittrack > backup_$(date +%Y%m%d_%H%M%S).sql

-- If migration fails, restore
psql fittrack < backup_20251210_120000.sql
```

---

## Monitoring & Logging

### Application Monitoring

#### Spring Boot Actuator Endpoints
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
```

Access metrics:
- Health: `http://localhost:8080/actuator/health`
- Metrics: `http://localhost:8080/actuator/metrics`
- Info: `http://localhost:8080/actuator/info`

### Logging

#### Log Aggregation with ELK Stack
```yaml
# logback-spring.xml
<appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
    <destination>logstash:5000</destination>
    <encoder class="net.logstash.logback.encoder.LoggingEventCompositeJsonEncoder">
        <providers>
            <timestamp/>
            <message/>
            <loggerName/>
            <threadName/>
            <logLevel/>
            <stackTrace/>
        </providers>
    </encoder>
</appender>
```

### Application Performance Monitoring (APM)

#### New Relic Integration
```bash
# Download agent
wget https://download.newrelic.com/newrelic/java-agent/newrelic-agent/current/newrelic-java.zip
unzip newrelic-java.zip

# Run with agent
java -javaagent:newrelic/newrelic.jar \
  -jar fittrack-backend.jar
```

---

## Backup & Recovery

### Database Backup

#### Automated Daily Backups
```bash
#!/bin/bash
# /opt/scripts/backup-fittrack.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/var/backups/fittrack
mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump -h localhost -U fittrack_user fittrack | gzip > $BACKUP_DIR/fittrack_$DATE.sql.gz

# Keep last 30 days
find $BACKUP_DIR -name "fittrack_*.sql.gz" -mtime +30 -delete

# Upload to S3
aws s3 cp $BACKUP_DIR/fittrack_$DATE.sql.gz s3://fittrack-backups/
```

#### Crontab Entry
```bash
0 2 * * * /opt/scripts/backup-fittrack.sh
```

### Restore from Backup
```bash
# Decompress
gunzip fittrack_20251210_120000.sql.gz

# Restore
psql -h localhost -U fittrack_user -d fittrack < fittrack_20251210_120000.sql
```

---

## SSL/TLS Configuration

### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Nginx SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Set up JDK 17
        uses: actions/setup-java@v2
        with:
          java-version: '17'

      - name: Build with Maven
        run: |
          cd fittrack-backend
          mvn clean package -DskipTests

      - name: Deploy to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          source: "fittrack-backend/target/*.jar"
          target: "/opt/fittrack/"

      - name: Restart service
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: sudo systemctl restart fittrack-backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Build
        run: |
          cd fittrack-frontend
          npm ci
          ng build --configuration production

      - name: Deploy to S3
        run: |
          aws s3 sync fittrack-frontend/dist/fittrack-frontend/ s3://fittrack-frontend/ --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"
```

---

## Health Checks & Monitoring

### Uptime Monitoring
```bash
# Pingdom
# StatusCake
# UptimeRobot

# Self-hosted with Prometheus
curl http://localhost:8080/actuator/health
```

### Performance Benchmarks
```bash
# Backend response times
ab -n 1000 -c 10 https://api.yourdomain.com/api/v1/exercises

# Database query performance
EXPLAIN ANALYZE SELECT * FROM workouts WHERE user_id = 1;
```

---

## Scaling Strategy

### Horizontal Scaling
- Load balancer (Nginx, AWS ALB)
- Multiple backend instances
- Session management (Redis)
- Database read replicas

### Vertical Scaling
- Increase EC2 instance size
- Upgrade RDS instance class
- Optimize database indexes
- Enable connection pooling

---

**Document Version**: 1.0
**Last Updated**: December 2025
**For Support**: support@fittrack.com
