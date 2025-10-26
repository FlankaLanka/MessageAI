import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from './firebase';
import { User } from '../types';

const googleProvider = new GoogleAuthProvider();

export class AuthService {
  // Sign in with email and password
  static async signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('❌ Email sign in failed:', error.code, error.message);
      
      // Handle rate limiting specifically
      if (error.code === 'auth/too-many-requests') {
        const rateLimitError = new Error(
          'Too many failed sign-in attempts. Please wait a few minutes before trying again, or try using a different network.'
        );
        (rateLimitError as any).code = error.code;
        throw rateLimitError;
      }
      
      throw error;
    }
  }

  // Sign up with email and password
  static async signUpWithEmail(
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<FirebaseUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      
      // Update display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`.trim()
      });
      
      // Create user profile in Firestore
      await this.createUserProfile(user, firstName, lastName);
      
      return user;
    } catch (error: any) {
      console.error('❌ Sign up failed:', error.code, error.message);
      
      // Handle rate limiting specifically
      if (error.code === 'auth/too-many-requests') {
        const rateLimitError = new Error(
          'Too many failed attempts. Please wait a few minutes before trying again, or try using a different network.'
        );
        (rateLimitError as any).code = error.code;
        throw rateLimitError;
      }
      
      throw error;
    }
  }

  // Sign in with Google
  static async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      
      if (Platform.OS === 'web') {
        // Use popup for web
        const { signInWithPopup } = await import('firebase/auth');
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        
        // Extract name from Google profile
        const firstName = user.displayName?.split(' ')[0] || 'User';
        const lastName = user.displayName?.split(' ').slice(1).join(' ') || '';
        
        // Create user profile if it doesn't exist
        await this.createUserProfile(user, firstName, lastName);
        
        return user;
      } else {
        // Use AuthSession for React Native
        if (!process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID) {
          throw new Error('Google client ID not configured. Please set EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID in your environment variables.');
        }
        
        // Use a simpler redirect URI for local development
        const redirectUri = AuthSession.makeRedirectUri({
          scheme: 'messageai',
          path: '/auth',
        });
        
        
        // Create the request using implicit flow (better for local development)
        const request = new AuthSession.AuthRequest({
          clientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
          scopes: ['openid', 'profile', 'email'],
          redirectUri,
          responseType: AuthSession.ResponseType.Token,
          extraParams: {},
          additionalParameters: {},
        });
        
        // Start the authentication flow
        const result = await request.promptAsync({
          authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        });
        
        if (result.type === 'success') {
          
          // With implicit flow, tokens are returned directly
          const accessToken = result.params.access_token;
          const idToken = result.params.id_token;
          
          // Create a Google credential with the tokens
          const credential = GoogleAuthProvider.credential(
            idToken,
            accessToken
          );
          
          // Sign in to Firebase with the credential
          const userCredential = await signInWithCredential(auth, credential);
          const user = userCredential.user;
          
          
          // Extract name from Google profile
          const firstName = user.displayName?.split(' ')[0] || 'User';
          const lastName = user.displayName?.split(' ').slice(1).join(' ') || '';
          
          // Create user profile if it doesn't exist
          await this.createUserProfile(user, firstName, lastName);
          
          return user;
        } else {
          throw new Error('Google authentication was cancelled or failed');
        }
      }
    } catch (error: any) {
      console.error('❌ Google sign in failed:', error.code, error.message);
      throw error;
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('❌ Sign out failed:', error.code, error.message);
      throw error;
    }
  }

  // Create user profile in Firestore
  static async createUserProfile(
    firebaseUser: FirebaseUser, 
    firstName: string, 
    lastName: string
  ): Promise<void> {
    try {
      const userRef = doc(firestore, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          firstName,
          lastName,
          displayName: firebaseUser.displayName || `${firstName} ${lastName}`.trim(),
          photoURL: firebaseUser.photoURL || '',
          ...(firebaseUser.phoneNumber && { phoneNumber: firebaseUser.phoneNumber }),
          status: 'offline',
          lastSeen: Date.now(),
          isDeleted: false,
          defaultLanguage: 'EN', // Set default language to English for new users
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        await setDoc(userRef, userData);
      } else {
      }
    } catch (error: any) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
  }

  // Get user profile from Firestore
  static async getUserProfile(uid: string): Promise<User | null> {
    try {
      const userRef = doc(firestore, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as User;
      }
      return null;
    } catch (error: any) {
      console.error('❌ Error getting user profile:', error);
      return null;
    }
  }

  // Sync display name with Firebase Auth profile
  static async syncDisplayNameWithProfile(uid: string, displayName: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === uid) {
        await updateProfile(currentUser, {
          displayName: displayName
        });
      } else {
      }
    } catch (error: any) {
      console.error('❌ Error syncing display name with Firebase Auth:', error);
      // Don't throw error - this is not critical for app functionality
    }
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}

export default AuthService;