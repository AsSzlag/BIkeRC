# API Configuration Setup

This document describes the axios configuration and API setup for the BikeRC application.

## Files Created

### 1. `/src/config/axios.ts`
- Main axios configuration with base URL, timeout, and interceptors
- Automatic token injection for authenticated requests
- Global error handling for common HTTP status codes

### 2. `/src/services/api.ts`
- API service functions for all endpoints
- TypeScript interfaces for data types
- Organized by feature (measurements, analyses, auth, settings)

### 3. `/src/hooks/useApi.ts`
- Custom React hooks for data fetching
- Built-in loading states and error handling
- Easy integration with components

### 4. `/src/utils/errorHandler.ts`
- Utility functions for error handling
- Consistent error formatting across the app

## Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development
```

## API Endpoints

### Measurements
- `GET /measurements` - Get paginated measurements
- `GET /measurements/:id` - Get single measurement
- `POST /measurements` - Create new measurement
- `PUT /measurements/:id` - Update measurement
- `DELETE /measurements/:id` - Delete measurement

### Analyses
- `GET /analyses` - Get paginated analyses
- `GET /analyses/:id` - Get single analysis
- `POST /analyses` - Create new analysis
- `PUT /analyses/:id` - Update analysis
- `DELETE /analyses/:id` - Delete analysis

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Settings
- `GET /settings` - Get user settings
- `PUT /settings` - Update user settings

## Usage Examples

### Using API Services Directly

```typescript
import { measurementsAPI } from '../services/api';

// Get measurements
const measurements = await measurementsAPI.getMeasurements(1, 10, 'id', 'asc');

// Create measurement
const newMeasurement = await measurementsAPI.createMeasurement({
  client: 'John Doe',
  bike: 'Mountain Bike Pro',
  status: 'pending',
  date: '2024-01-15'
});
```

### Using Custom Hooks

```typescript
import { useMeasurements } from '../hooks/useApi';

function MeasurementsPage() {
  const { data, loading, error, totalPages, refetch } = useMeasurements(1, 10);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {data.map(measurement => (
        <div key={measurement.id}>{measurement.client}</div>
      ))}
    </div>
  );
}
```

## Authentication

The axios configuration automatically includes the auth token from localStorage in requests. To set the token:

```typescript
localStorage.setItem('authToken', 'your-jwt-token');
```

## Error Handling

The configuration includes automatic error handling:
- 401 errors redirect to login
- 403 errors log forbidden access
- 500+ errors log server errors
- Network errors are handled gracefully

## Backend Requirements

Your backend should:
1. Accept CORS requests from your frontend
2. Use JWT tokens for authentication
3. Return data in the expected format
4. Handle pagination with `page`, `limit`, `sortBy`, `sortOrder` query parameters
5. Return paginated responses in the format:
   ```json
   {
     "data": [...],
     "total": 100,
     "page": 1,
     "limit": 10,
     "totalPages": 10
   }
   ```

## Next Steps

1. Update your components to use the new API hooks
2. Implement proper error handling with notifications
3. Add loading states to your UI
4. Set up your backend to match the expected API structure
