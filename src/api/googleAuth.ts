import { Platform } from 'react-native';
import { 
  GoogleAuthProvider, 
  signInWithCredential,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from './firebase';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Configure WebBrowser for better OAuth experience
WebBrowser.maybeCompleteAuthSession();

// Debug Google Sign-In configuration
console.log('🔧 Google Sign-In Config Debug:', {
  webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID ? 
    `${process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID.substring(0, 20)}...` : 'MISSING',
  platform: Platform.OS
});

export class GoogleAuthService {
  /**
   * Sign in with Google - uses Firebase web authentication for all platforms
   * This works in Expo Go by using Firebase's built-in web authentication
   */
  static async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      console.log('🔍 Starting Google sign-in for platform:', Platform.OS);
      console.log('🌐 Using Firebase web authentication (works in Expo Go)');
      
      return await this.signInWithGoogleWeb();
    } catch (error: any) {
      console.error('❌ Google sign in failed:', error);
      throw this.handleGoogleAuthError(error);
    }
  }

  /**
   * Google Sign-In using Expo WebBrowser and Firebase
   * This works on all platforms including Expo Go
   */
  private static async signInWithGoogleWeb(): Promise<FirebaseUser> {
    try {
      console.log('🌐 Starting Google authentication with Expo WebBrowser...');
      
      if (!process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID) {
        throw new Error('Google client ID not configured');
      }
      
      // Create redirect URI
      const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true,
      });
      
      console.log('🌐 Redirect URI:', redirectUri);
      
      // Create the OAuth request
      const request = new AuthSession.AuthRequest({
        clientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.Token,
        extraParams: {},
        additionalParameters: {},
        usePKCE: false,
      });
      
      console.log('🌐 Starting Google OAuth flow...');
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        useProxy: true,
      });
      
      if (result.type === 'success') {
        console.log('✅ Google OAuth successful');
        
        // Get the ID token from the result
        const { id_token } = result.params;
        
        if (!id_token) {
          throw new Error('No ID token received from Google');
        }
        
        console.log('🌐 Creating Firebase credential...');
        // Create Google credential with the ID token
        const credential = GoogleAuthProvider.credential(id_token);
        
        console.log('🌐 Signing in to Firebase...');
        // Sign in to Firebase with the credential
        const userCredential = await signInWithCredential(auth, credential);
        console.log('✅ Firebase sign-in successful');
        
        return userCredential.user;
      } else {
        throw new Error('Google authentication was cancelled or failed');
      }
    } catch (error: any) {
      console.error('❌ Google authentication failed:', error);
      throw error;
    }
  }

  /**
   * Handle Google authentication errors with user-friendly messages
   */
  private static handleGoogleAuthError(error: any): Error {
    // Handle Firebase authentication errors
    if (error.code === 'auth/account-exists-with-different-credential') {
      return new Error('An account already exists with this email address using a different sign-in method');
    } else if (error.code === 'auth/email-already-in-use') {
      return new Error('This email address is already in use');
    } else if (error.code === 'auth/operation-not-allowed') {
      return new Error('Google sign-in is not enabled for this app');
    } else if (error.code === 'auth/too-many-requests') {
      return new Error('Too many failed attempts. Please try again later');
    } else if (error.code === 'auth/network-request-failed') {
      return new Error('Network error. Please check your internet connection');
    } else if (error.code === 'auth/popup-closed-by-user') {
      return new Error('Google sign-in was cancelled');
    } else if (error.code === 'auth/popup-blocked') {
      return new Error('Popup was blocked by browser. Please allow popups and try again');
    } else if (error.code === 'auth/redirect-cancelled-by-user') {
      return new Error('Google sign-in was cancelled');
    } else if (error.message?.includes('cancelled') || error.message?.includes('canceled')) {
      return new Error('Google sign-in was cancelled');
    } else if (error.message?.includes('Redirect initiated')) {
      return new Error('Redirect initiated - user will be redirected to Google');
    } else {
      // Generic error message
      return new Error(error.message || 'Google sign-in failed. Please try again');
    }
  }

  /**
   * Check if Google Sign-In is available on the current platform
   */
  static async isGoogleSignInAvailable(): Promise<boolean> {
    try {
      // Firebase Google authentication is available on all platforms
      return true;
    } catch (error) {
      console.warn('Google Sign-In not available:', error);
      return false;
    }
  }

  /**
   * Sign out from Google (if needed)
   */
  static async signOutFromGoogle(): Promise<void> {
    try {
      // Firebase handles sign out automatically
      console.log('✅ Google sign out handled by Firebase');
    } catch (error) {
      console.warn('Google sign out failed:', error);
      // Don't throw error - this is not critical
    }
  }
}

export default GoogleAuthService;
