# Google OAuth Setup Guide

## Problem
Google OAuth is failing with "invalid_request" error because the redirect URI is not properly configured.

## Solution

### 1. Check the Redirect URI
When you run the app, check the console logs for the redirect URI. It should look like one of these formats:

**For Expo Go (Development):**
```
https://auth.expo.io/@your-username/your-app-slug
```

**For Custom Scheme:**
```
your-scheme://auth
```

### 2. Register Redirect URI in Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project**: `messageai-bc582` (or your project ID)
3. **Navigate to APIs & Services > Credentials**
4. **Find your OAuth 2.0 Client ID** (the one with ID: `481795836565-7q2pkujctdl4l8mt02uhma562umul896.apps.googleusercontent.com`)
5. **Click Edit**
6. **Add the redirect URI** to the "Authorized redirect URIs" section

### 3. Common Redirect URIs to Add

**For Expo Go Development:**
```
https://auth.expo.io/@flankalanka/messageai
```

**For Web Development:**
```
http://localhost:8081
http://localhost:8082
```

**For Custom Scheme (if using):**
```
messageai://auth
```

### 4. Verify the Setup

1. **Run the app**: `npm start`
2. **Check console logs** for the exact redirect URI being used
3. **Copy the exact URI** from the logs
4. **Add it to Google Cloud Console** exactly as shown
5. **Save the changes** in Google Cloud Console
6. **Test the Google Sign-In** again

### 5. Debugging Steps

If you're still getting errors:

1. **Check the exact redirect URI** in console logs
2. **Verify it matches exactly** in Google Cloud Console (no extra spaces, correct protocol)
3. **Make sure the URI is in the "Authorized redirect URIs" section** (not "Authorized JavaScript origins")
4. **Wait a few minutes** for Google's changes to propagate
5. **Try again**

### 6. Common Issues

- **Missing protocol**: Make sure to include `https://` or `http://`
- **Wrong path**: Should be `/auth` or similar, not `/api/v1/oauth/google`
- **Case sensitivity**: Make sure the case matches exactly
- **Extra characters**: No trailing slashes or extra characters

### 7. Expected Console Output

When you run the app, you should see:
```
🌐 Redirect URI: https://auth.expo.io/@flankalanka/messageai
🌐 Make sure this redirect URI is registered in Google Cloud Console
🌐 Expected format: https://auth.expo.io/@your-username/your-app-slug
🌐 If using custom scheme, format should be: your-scheme://auth
```

Copy the exact URI from the first line and add it to Google Cloud Console.

## Next Steps

1. **Run the app** and check the console logs
2. **Copy the redirect URI** from the logs
3. **Add it to Google Cloud Console** exactly as shown
4. **Test Google Sign-In** again

The redirect URI must match exactly between your app and Google Cloud Console for OAuth to work.

