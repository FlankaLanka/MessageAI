# Google OAuth Redirect URI Setup

## Problem
Getting `redirect_uri_mismatch` error because the redirect URI doesn't match what's configured in Google Cloud Console.

## Solution

### 1. Add Redirect URI to Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project**: `messageai-bc582` (project-481795836565)
3. **Navigate to APIs & Services > Credentials**
4. **Find your OAuth 2.0 Client ID**: `481795836565-7q2pkujctdl4l8mt02uhma562umul896.apps.googleusercontent.com`
5. **Click Edit**
6. **Add these redirect URIs** to "Authorized redirect URIs":

```
http://localhost:8081
http://localhost:8082
https://auth.expo.io/@anonymous/messageai
```

### 2. Save and Test

1. **Save the changes** in Google Cloud Console
2. **Wait 2-3 minutes** for changes to propagate
3. **Test Google Sign-In** again

### 3. Alternative: Use Firebase's Built-in Google Auth

If you're still having issues, we can switch to using Firebase's built-in Google authentication which doesn't require redirect URI configuration.

## Quick Fix

The app is now using `http://localhost:8081` as the redirect URI. Make sure this exact URI is added to your Google Cloud Console OAuth 2.0 Client ID configuration.

## Expected Result

After adding the redirect URI to Google Cloud Console, the Google Sign-In should work without the `redirect_uri_mismatch` error.

