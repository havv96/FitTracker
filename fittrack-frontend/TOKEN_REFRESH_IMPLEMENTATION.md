# Automatic Token Refresh Implementation

## Overview
Implemented automatic JWT token refresh to prevent 403 Forbidden errors when access tokens expire (15 minutes).

## How It Works

### 1. Token Lifecycle
- **Access Token**: Expires after 15 minutes
- **Refresh Token**: Expires after 7 days
- When access token expires, the system automatically uses the refresh token to get a new access token

### 2. Implementation Details

#### AuthService Updates (auth.service.ts)
Added two new methods:

**`refreshToken()`**:
- Calls `/api/v1/auth/refresh` endpoint
- Updates both access and refresh tokens in localStorage
- If refresh fails, logs out the user

**`handleTokenRefresh()`**:
- Prevents multiple simultaneous refresh requests
- Queues subsequent requests while refresh is in progress
- Ensures thread-safe token refresh

#### Auth Interceptor Updates (auth.interceptor.ts)
Enhanced to handle token expiration:

1. **Automatic Detection**: Catches 401/403 HTTP errors
2. **Auto-Refresh**: Automatically calls `refreshToken()` when token expires
3. **Request Retry**: Retries the original failed request with new token
4. **Fallback**: Logs out user if refresh token is also expired

### 3. User Experience

**Before:**
- Token expires after 15 minutes
- User gets 403 error
- Must manually log out and log back in

**After:**
- Token expires after 15 minutes
- System automatically refreshes token in background
- Original request completes successfully
- User experiences no interruption
- Only logs out if refresh token is expired (after 7 days)

### 4. Testing the Implementation

#### Test Scenario 1: Normal Token Refresh
1. Log in to the application
2. Wait 15+ minutes (or modify token expiration for faster testing)
3. Make any API request (navigate to different page, load data)
4. **Expected**: Request succeeds after automatic token refresh

#### Test Scenario 2: Expired Refresh Token
1. Log in to the application
2. Wait 7+ days (or manually expire refresh token)
3. Make any API request
4. **Expected**: User is automatically logged out and redirected to login page

#### Test Scenario 3: Manual Verification
Open browser console and run:
```javascript
// Check tokens before
console.log('Before:', localStorage.getItem('access_token'));

// Wait for token to expire or make a request that triggers refresh

// Check tokens after
console.log('After:', localStorage.getItem('access_token'));
// Token values should be different
```

### 5. Configuration

Token expiration times are configured in backend `application.yml`:
```yaml
jwt:
  access-token-expiration: 900000    # 15 minutes
  refresh-token-expiration: 604800000 # 7 days
```

To modify:
- Edit `fittrack-backend/src/main/resources/application.yml`
- Restart backend application

### 6. Security Notes

- Refresh tokens are stored in localStorage (consider httpOnly cookies for production)
- Both tokens are updated on each refresh to minimize security risks
- Failed refresh attempts result in immediate logout
- No sensitive data is logged during token refresh

### 7. Troubleshooting

**Issue**: Still getting 403 errors
**Solution**:
1. Clear browser storage: `localStorage.clear()`
2. Log out and log back in
3. Check browser console for error messages

**Issue**: Infinite refresh loop
**Solution**:
- Check backend logs for token validation errors
- Verify JWT secret hasn't changed
- Ensure system time is synchronized

**Issue**: Token not refreshing
**Solution**:
- Verify backend `/api/v1/auth/refresh` endpoint is accessible
- Check network tab for refresh request/response
- Ensure refresh token exists in localStorage

## Files Modified

1. `src/app/core/services/auth.service.ts`
   - Added `refreshToken()` method
   - Added `handleTokenRefresh()` for concurrent request handling

2. `src/app/core/interceptors/auth.interceptor.ts`
   - Enhanced to catch 401/403 errors
   - Automatically refreshes token and retries request
   - Handles logout on refresh failure

## Next Steps

Consider these enhancements:
1. Add loading indicator during token refresh
2. Display toast notification on token refresh
3. Implement silent token refresh before expiration (proactive refresh)
4. Move tokens to httpOnly cookies for better security
5. Add token refresh metrics/logging
