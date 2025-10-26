import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService } from '../../api/auth';
import { useStore } from '../../store/useStore';
import { useLocalization } from '../../hooks/useLocalization';
import { showErrorAlert, showSuccessAlert } from '../../utils/crossPlatformAlert';

export default function AuthScreen() {
  const { t } = useLocalization();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setAuthenticated, setError } = useStore();
  
  // Get screen dimensions for responsive design
  const { height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenHeight < 700;

  // Sign in form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign up form state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSignIn = async () => {
    if (!signInEmail || !signInPassword) {
      showErrorAlert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const user = await AuthService.signInWithEmail(signInEmail, signInPassword);
      // Auth state will be handled by App.tsx
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      // Show specific message for rate limiting
      if (error.code === 'auth/too-many-requests') {
        showErrorAlert(
          'Too many failed sign-in attempts. Please wait a few minutes before trying again, or try using a different network.'
        );
      } else {
        showErrorAlert(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!signUpEmail || !signUpPassword || !firstName || !lastName) {
      showErrorAlert('Please fill in all fields');
      return;
    }

    if (signUpPassword.length < 6) {
      showErrorAlert('Password must be at least 6 characters long');
      return;
    }

    if (signUpPassword !== confirmPassword) {
      showErrorAlert('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const user = await AuthService.signUpWithEmail(
        signUpEmail, 
        signUpPassword, 
        firstName, 
        lastName
      );
      showSuccessAlert('Account created successfully! You are now logged in.');
    } catch (error: any) {
      console.error('❌ Sign up failed:', error);
      
      // Show specific message for rate limiting
      if (error.code === 'auth/too-many-requests') {
        showErrorAlert(
          'Too many failed attempts. Please wait a few minutes before trying again, or try using a different network.'
        );
      } else {
        showErrorAlert(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };


  const renderSignInForm = () => (
    <View style={styles.form}>
      <Text style={styles.formTitle}>{t('welcomeBack')}</Text>
      <Text style={styles.formSubtitle}>{t('signInToAccount')}</Text>
      
      <TextInput
        style={styles.input}
        placeholder={t('email')}
        value={signInEmail}
        onChangeText={setSignInEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TextInput
        style={styles.input}
        placeholder={t('password')}
        value={signInPassword}
        onChangeText={setSignInPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleSignIn}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? t('signingIn') : t('signIn')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsSignUp(true)}
      >
        <Text style={styles.switchButtonText}>
          {t('dontHaveAccount')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSignUpForm = () => (
    <View style={styles.form}>
      <Text style={styles.formTitle}>{t('createAccount')}</Text>
      <Text style={styles.formSubtitle}>{t('signUpForAccount')}</Text>
      
      <View style={styles.nameRow}>
        <TextInput
          style={[styles.input, styles.nameInput]}
          placeholder={t('firstName')}
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          autoCorrect={false}
        />
        <TextInput
          style={[styles.input, styles.nameInput]}
          placeholder={t('lastName')}
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          autoCorrect={false}
        />
      </View>
      
      <TextInput
        style={styles.input}
        placeholder={t('email')}
        value={signUpEmail}
        onChangeText={setSignUpEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TextInput
        style={styles.input}
        placeholder={t('password')}
        value={signUpPassword}
        onChangeText={setSignUpPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TextInput
        style={styles.input}
        placeholder={t('confirmPassword')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleSignUp}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? t('creatingAccount') : t('signUp')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsSignUp(false)}
      >
        <Text style={styles.switchButtonText}>
          {t('alreadyHaveAccount')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.logo, isSmallScreen && styles.logoSmall]}>
              MessageAI
            </Text>
            <Text style={[styles.tagline, isSmallScreen && styles.taglineSmall]}>
              {t('connectWithWorld')}
            </Text>
          </View>
          
          {isSignUp ? renderSignUpForm() : renderSignInForm()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  logoSmall: {
    fontSize: 28,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
  },
  taglineSmall: {
    fontSize: 14,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    padding: 8,
  },
  switchButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
