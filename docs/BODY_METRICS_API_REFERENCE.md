# Body Metrics API Reference

## Base URL
```
/api/v1/metrics
```

## Authentication
All endpoints require JWT Bearer token authentication:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get Body Metrics

**Endpoint**: `GET /api/v1/metrics/body-metrics`

**Description**: Retrieve body metrics for the authenticated user, optionally filtered by date range.

**Query Parameters**:
- `startDate` (optional): Start date in ISO format (YYYY-MM-DD)
- `endDate` (optional): End date in ISO format (YYYY-MM-DD)

**Example Request**:
```bash
GET /api/v1/metrics/body-metrics?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response**:
```json
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": 1,
    "userId": 123,
    "date": "2025-12-12",
    "weightKg": 75.5,
    "bodyFatPercentage": 18.5,
    "muscleMassKg": 45.2,
    "waistCm": 85.0,
    "chestCm": 100.0,
    "armsCm": 35.0,
    "legsCm": 60.0,
    "notes": "Morning weight, before breakfast"
  },
  {
    "id": 2,
    "userId": 123,
    "date": "2025-12-11",
    "weightKg": 75.8,
    "bodyFatPercentage": 18.7,
    "muscleMassKg": 45.0,
    "waistCm": 85.5,
    "chestCm": 99.5,
    "armsCm": 34.8,
    "legsCm": 60.2,
    "notes": null
  }
]
```

---

### 2. Add Body Metrics

**Endpoint**: `POST /api/v1/metrics/body-metrics`

**Description**: Create a new body metrics entry for the authenticated user.

**Request Body**:
```json
{
  "date": "2025-12-12",
  "weightKg": 75.5,
  "bodyFatPercentage": 18.5,
  "muscleMassKg": 45.2,
  "waistCm": 85.0,
  "chestCm": 100.0,
  "armsCm": 35.0,
  "legsCm": 60.0,
  "notes": "Morning weight, before breakfast"
}
```

**Required Fields**:
- `date`: Date in ISO format (YYYY-MM-DD)
- `weightKg`: Weight in kilograms (must be positive, max 500)

**Optional Fields**:
- `bodyFatPercentage`: Body fat percentage (0-100)
- `muscleMassKg`: Muscle mass in kilograms
- `waistCm`: Waist circumference in centimeters
- `chestCm`: Chest circumference in centimeters
- `armsCm`: Arms circumference in centimeters
- `legsCm`: Legs circumference in centimeters
- `notes`: Optional text notes (max 500 characters)

**Example Request**:
```bash
POST /api/v1/metrics/body-metrics
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "date": "2025-12-12",
  "weightKg": 75.5,
  "bodyFatPercentage": 18.5,
  "notes": "Morning weight"
}
```

**Success Response**:
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 1,
  "userId": 123,
  "date": "2025-12-12",
  "weightKg": 75.5,
  "bodyFatPercentage": 18.5,
  "muscleMassKg": null,
  "waistCm": null,
  "chestCm": null,
  "armsCm": null,
  "legsCm": null,
  "notes": "Morning weight"
}
```

**Error Response**:
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "timestamp": "2025-12-12T16:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Weight is required",
  "path": "/api/v1/metrics/body-metrics"
}
```

---

### 3. Update Body Metrics

**Endpoint**: `PUT /api/v1/metrics/body-metrics/{id}`

**Description**: Update an existing body metrics entry. Only the owner can update their entries.

**Path Parameters**:
- `id`: The ID of the body metrics entry to update

**Request Body**: Same as POST request

**Example Request**:
```bash
PUT /api/v1/metrics/body-metrics/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "date": "2025-12-12",
  "weightKg": 75.3,
  "bodyFatPercentage": 18.4,
  "notes": "Updated morning weight"
}
```

**Success Response**:
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 1,
  "userId": 123,
  "date": "2025-12-12",
  "weightKg": 75.3,
  "bodyFatPercentage": 18.4,
  "muscleMassKg": null,
  "waistCm": null,
  "chestCm": null,
  "armsCm": null,
  "legsCm": null,
  "notes": "Updated morning weight"
}
```

**Error Response** (Not Found):
```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "timestamp": "2025-12-12T16:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Body metrics not found",
  "path": "/api/v1/metrics/body-metrics/999"
}
```

**Error Response** (Unauthorized Access):
```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "timestamp": "2025-12-12T16:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Body metrics not found for this user",
  "path": "/api/v1/metrics/body-metrics/1"
}
```

---

### 4. Delete Body Metrics

**Endpoint**: `DELETE /api/v1/metrics/body-metrics/{id}`

**Description**: Delete a body metrics entry. Only the owner can delete their entries.

**Path Parameters**:
- `id`: The ID of the body metrics entry to delete

**Example Request**:
```bash
DELETE /api/v1/metrics/body-metrics/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response**:
```json
HTTP/1.1 204 No Content
```

**Error Response** (Not Found):
```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "timestamp": "2025-12-12T16:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Body metrics not found",
  "path": "/api/v1/metrics/body-metrics/999"
}
```

---

## Data Validation Rules

### Weight (weightKg)
- **Required**: Yes
- **Type**: Double
- **Min**: Greater than 0
- **Max**: Less than 500
- **Format**: Up to 1 decimal place recommended

### Body Fat Percentage (bodyFatPercentage)
- **Required**: No
- **Type**: Double
- **Min**: 0
- **Max**: 100
- **Format**: Percentage value

### Muscle Mass (muscleMassKg)
- **Required**: No
- **Type**: Double
- **Min**: Greater than 0
- **Format**: Kilograms

### Body Measurements (waistCm, chestCm, armsCm, legsCm)
- **Required**: No
- **Type**: Double
- **Min**: Greater than 0
- **Format**: Centimeters

### Notes
- **Required**: No
- **Type**: String
- **Max Length**: 500 characters

### Date
- **Required**: Yes
- **Type**: LocalDate
- **Format**: ISO-8601 (YYYY-MM-DD)
- **Constraint**: One entry per user per date

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success - Request completed successfully |
| 201 | Created - New resource created successfully |
| 204 | No Content - Delete operation successful |
| 400 | Bad Request - Invalid input data or validation error |
| 401 | Unauthorized - Missing or invalid JWT token |
| 404 | Not Found - Resource doesn't exist or user doesn't have access |
| 500 | Internal Server Error - Server-side error |

---

## Common Error Scenarios

### Duplicate Entry for Same Date
```json
HTTP/1.1 400 Bad Request

{
  "message": "Body metrics entry already exists for this date"
}
```

**Solution**: Use PUT to update the existing entry instead.

### Invalid Weight Value
```json
HTTP/1.1 400 Bad Request

{
  "message": "Weight must be positive"
}
```

**Solution**: Ensure weight is greater than 0 and less than 500.

### Invalid Body Fat Percentage
```json
HTTP/1.1 400 Bad Request

{
  "message": "Body fat percentage must be between 0 and 100"
}
```

**Solution**: Ensure body fat percentage is within valid range.

### Unauthorized Access
```json
HTTP/1.1 401 Unauthorized

{
  "message": "Full authentication is required to access this resource"
}
```

**Solution**: Include valid JWT Bearer token in Authorization header.

---

## Rate Limiting

Currently, there are no rate limits on these endpoints. However, best practices suggest:
- Avoid making rapid consecutive requests
- Implement client-side caching for frequently accessed data
- Batch operations when possible

---

## Integration Examples

### JavaScript/TypeScript (Angular)
```typescript
// Add body metrics
addBodyMetrics(data: BodyMetricsRequest): Observable<BodyMetrics> {
  return this.http.post<BodyMetrics>(
    `${this.API_URL}/body-metrics`,
    data
  );
}

// Get body metrics with date range
getBodyMetrics(startDate?: string, endDate?: string): Observable<BodyMetrics[]> {
  let params = new HttpParams();
  if (startDate) params = params.set('startDate', startDate);
  if (endDate) params = params.set('endDate', endDate);

  return this.http.get<BodyMetrics[]>(
    `${this.API_URL}/body-metrics`,
    { params }
  );
}
```

### cURL Examples

**Add entry:**
```bash
curl -X POST http://localhost:8080/api/v1/metrics/body-metrics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-12",
    "weightKg": 75.5,
    "bodyFatPercentage": 18.5,
    "notes": "Morning weight"
  }'
```

**Get entries:**
```bash
curl -X GET "http://localhost:8080/api/v1/metrics/body-metrics?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update entry:**
```bash
curl -X PUT http://localhost:8080/api/v1/metrics/body-metrics/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-12",
    "weightKg": 75.3,
    "bodyFatPercentage": 18.4
  }'
```

**Delete entry:**
```bash
curl -X DELETE http://localhost:8080/api/v1/metrics/body-metrics/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Swagger/OpenAPI Documentation

The API is fully documented with Swagger/OpenAPI. Access the interactive API documentation at:
```
http://localhost:8080/swagger-ui.html
```

This provides:
- Interactive API testing
- Request/response examples
- Schema definitions
- Authentication setup

---

## Database Schema Reference

**Table**: `body_metrics`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | No | AUTO | Primary key |
| user_id | BIGINT | No | - | Foreign key to users table |
| date | DATE | No | - | Date of measurement |
| weight_kg | DOUBLE PRECISION | No | - | Weight in kilograms |
| body_fat_percentage | DOUBLE PRECISION | Yes | NULL | Body fat percentage (0-100) |
| muscle_mass_kg | DOUBLE PRECISION | Yes | NULL | Muscle mass in kg |
| waist_cm | DOUBLE PRECISION | Yes | NULL | Waist circumference in cm |
| chest_cm | DOUBLE PRECISION | Yes | NULL | Chest circumference in cm |
| arms_cm | DOUBLE PRECISION | Yes | NULL | Arms circumference in cm |
| legs_cm | DOUBLE PRECISION | Yes | NULL | Legs circumference in cm |
| notes | TEXT | Yes | NULL | Optional notes |
| created_at | TIMESTAMP | No | CURRENT_TIMESTAMP | Record creation time |

**Indexes**:
- `idx_body_metrics_user_date` on (user_id, date DESC)
- `idx_body_metrics_date` on (date)

**Constraints**:
- `uq_body_metrics_user_date`: UNIQUE(user_id, date)
- `chk_body_metrics_weight`: weight_kg > 0 AND weight_kg < 500
- `chk_body_metrics_body_fat`: body_fat_percentage >= 0 AND body_fat_percentage <= 100
- Foreign key constraint on user_id with CASCADE delete

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-12 | Initial implementation of body metrics endpoints |

---

## Support

For API issues or questions:
- Check the Swagger documentation
- Review the error messages for guidance
- Ensure JWT token is valid and not expired
- Verify request payload matches the schema
