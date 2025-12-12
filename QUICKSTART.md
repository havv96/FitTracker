# FitTrack Pro - Quick Start Guide

Get up and running with FitTrack Pro in 5 minutes!

## Prerequisites Check

```bash
# Check Java (need 17 or 21)
java -version

# Check Node.js (need 18 or 20)
node --version

# Check Docker
docker --version
docker-compose --version

# Install Angular CLI if needed
npm install -g @angular/cli@18
```

## 3-Step Setup

### Step 1: Start Database (30 seconds)

```bash
cd "Diplomna Rabota"
docker-compose up -d postgres

# Wait 10 seconds, then verify
docker ps
```

You should see `fittrack-db` running.

### Step 2: Start Backend (1 minute)

Open a new terminal:

```bash
cd "Diplomna Rabota/fittrack-backend"
mvn spring-boot:run
```

Wait for the message: **"Started FitTrackApplication in X seconds"**

### Step 3: Start Frontend (1 minute)

Open another terminal:

```bash
cd "Diplomna Rabota/fittrack-frontend"
ng serve
```

Wait for the message: **"Local: http://localhost:4200/"**

## Test It Out!

1. **Open Browser:** http://localhost:4200
2. **Register:**
   - Email: `test@fittrack.com`
   - Password: `Test12345` (must have 1 uppercase + 1 digit)
3. **Login:** Use the same credentials
4. **Success!** You should see the profile dashboard

## Quick Test with curl

Test the backend directly:

```bash
# Register a user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"api-test@fittrack.com","password":"Test12345"}'

# You should get back an accessToken and refreshToken
```

## Troubleshooting

### "Port 8080 already in use"
```bash
# macOS/Linux
lsof -i :8080 | grep LISTEN
kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### "Database connection failed"
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### "Angular compilation errors"
```bash
cd fittrack-frontend
rm -rf node_modules package-lock.json
npm install
ng serve
```

## Stop Everything

```bash
# Stop frontend: Ctrl+C in the ng serve terminal
# Stop backend: Ctrl+C in the mvn terminal
# Stop database:
docker-compose down
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for all endpoints
- See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for development roadmap

---

**Happy Tracking! 🏋️‍♂️💪**
