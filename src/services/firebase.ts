import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
};

// Debug: Log Firebase config (remove in production)
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? 'Present' : 'Missing',
  authDomain: firebaseConfig.authDomain ? 'Present' : 'Missing',
  projectId: firebaseConfig.projectId ? 'Present' : 'Missing',
  storageBucket: firebaseConfig.storageBucket ? 'Present' : 'Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'Present' : 'Missing',
  appId: firebaseConfig.appId ? 'Present' : 'Missing',
  databaseURL: firebaseConfig.databaseURL ? 'Present' : 'Missing',
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with platform-specific persistence
let auth;
if (Platform.OS === 'web') {
  // For web, use the default auth with browser persistence
  auth = getAuth(app);
} else {
  // For React Native, use AsyncStorage persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };
export const firestore = getFirestore(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// Debug: Log Firestore instance
console.log('Firestore instance created:', {
  app: app.name,
  projectId: firebaseConfig.projectId,
  firestoreType: typeof firestore
});

export default app;
