import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { UserService } from '../../api/users';
import { MediaService } from '../../api/media';
import { AuthService } from '../../api/auth';
import { useLocalization } from '../../hooks/useLocalization';
import LanguageSelector from '../../components/LanguageSelector';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 700;

interface ProfileScreenProps {
  // No longer needed - settings are combined
}

export default function ProfileScreen() {
  const { user, setUser } = useStore();
  const { t } = useLocalization();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhoneNumber(user.phoneNumber || '');
      setProfilePicture(user.photoURL || '');
    }
  }, [user]);

  const handleImagePicker = async () => {
    try {
      setIsUploadingImage(true);
      
      Alert.alert(
        'Select Photo',
        'Choose how you want to add a profile picture',
        [
          { text: 'Camera', onPress: () => pickImage('camera') },
          { text: 'Photo Library', onPress: () => pickImage('library') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Error opening image picker:', error);
      Alert.alert('Error', 'Failed to open image picker');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      setIsUploadingImage(true);
      
      const imageUri = source === 'camera' 
        ? await MediaService.takePhoto()
        : await MediaService.pickImage();
      
      if (imageUri && user) {
        // Upload to Firebase Storage
        const downloadURL = await MediaService.uploadProfilePicture(user.uid, imageUri);
        setProfilePicture(downloadURL);
        
        // Update user profile
        await UserService.updateUserProfile(user.uid, { photoURL: downloadURL });
        
        // Update local state
        const updatedUser = { ...user, photoURL: downloadURL };
        setUser(updatedUser);
        
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!profilePicture) {
      Alert.alert('No Profile Picture', 'You don\'t have a profile picture to delete');
      return;
    }

    Alert.alert(
      'Delete Profile Picture',
      'Are you sure you want to delete your profile picture? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsUploadingImage(true);
              
              // Delete from Firebase Storage
              await MediaService.deleteProfilePicture(profilePicture);
              
              // Update user profile to remove photoURL
              await UserService.updateUserProfile(user!.uid, { photoURL: '' });
              
              // Update local state
              const updatedUser = { ...user!, photoURL: '' };
              setUser(updatedUser);
              setProfilePicture('');
              
              Alert.alert('Success', 'Profile picture deleted successfully!');
            } catch (error) {
              console.error('Error deleting profile picture:', error);
              Alert.alert('Error', 'Failed to delete profile picture. Please try again.');
            } finally {
              setIsUploadingImage(false);
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated. Please sign in again.');
      return;
    }
    
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }

    try {
      setIsSaving(true);
      
      // Ensure user document exists (fallback for missing documents)
      await UserService.ensureUserDocumentExists(user.uid, user.email);
      
      // Check phone number availability if changed
      if (phoneNumber && phoneNumber !== user.phoneNumber) {
        try {
          const isAvailable = await UserService.checkPhoneNumberAvailable(phoneNumber, user.uid);
          if (!isAvailable) {
            Alert.alert('Error', 'This phone number is already in use');
            return;
          }
        } catch (error) {
          console.error('Error checking phone number availability:', error);
          Alert.alert('Error', 'Failed to validate phone number. Please try again.');
          return;
        }
      }

      const updates = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: `${firstName.trim()} ${lastName.trim()}`,
        phoneNumber: phoneNumber.trim() || '',
        photoURL: profilePicture,
      };

      await UserService.updateUserProfile(user.uid, updates);
      
      // Update local state
      const updatedUser = { 
        ...user, 
        ...updates,
        updatedAt: Date.now()
      };
      setUser(updatedUser);
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      let errorMessage = 'Failed to save profile';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will remove you from all chats.\n\nFor security reasons, you will need to verify your identity.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            // Start secure deletion process
            startSecureDeletionProcess();
          },
        },
      ]
    );
  };

  const handleDebugPresence = async () => {
    try {
      const { presenceService } = await import('../../api/presence');
      const { networkService } = await import('../../api/network');
      
      console.log('🔍 Debugging presence system...');
      presenceService.debugCurrentState();
      networkService.debugState();
      
      // Trigger both normal and force presence checks
      await presenceService.forceUpdatePresence();
      await presenceService.forcePresenceCheck();
      
      Alert.alert(
        'Debug Info',
        'Check console for presence and network debug information. Both normal and force presence checks triggered.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error debugging presence:', error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      t('logOut'),
      'Are you sure you want to sign out?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logOut'),
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 User initiated sign out');
              
              // Force user offline before signing out
              const { presenceService } = await import('../../api/presence');
              await presenceService.forceOffline();
              
              // Sign out from Firebase Auth
              await AuthService.signOut();
              
              console.log('✅ Sign out completed successfully');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const startSecureDeletionProcess = () => {
    const canUsePassword = AuthService.canReauthenticateWithPassword();
    const providers = AuthService.getUserProviders();
    
    if (canUsePassword) {
      // User has email/password - require password verification
      Alert.prompt(
        'Verify Your Identity',
        'For security reasons, please enter your password to confirm account deletion:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Account',
            style: 'destructive',
            onPress: (password) => {
              if (password && password.trim()) {
                attemptAccountDeletion(password.trim());
              } else {
                Alert.alert('Error', 'Password is required to delete your account');
              }
            },
          },
        ],
        'secure-text'
      );
    } else if (providers.includes('google.com')) {
      // Google Auth user - require email verification
      Alert.alert(
        'Email Verification Required',
        'For Google sign-in users, we need to verify your email address before account deletion. A verification email will be sent to your registered email address.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send Verification',
            style: 'default',
            onPress: () => {
              sendEmailVerificationForDeletion();
            },
          },
        ]
      );
    } else {
      // Other providers - require re-authentication
      Alert.alert(
        'Re-authentication Required',
        'For security reasons, please sign out and sign back in before deleting your account.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: () => {
              // Sign out and redirect to auth
              AuthService.signOut();
            },
          },
        ]
      );
    }
  };

  const sendEmailVerificationForDeletion = async () => {
    try {
      setIsLoading(true);
      await AuthService.sendAccountDeletionVerification();
      
      Alert.alert(
        'Verification Email Sent',
        'Please check your email and click the verification link. After verification, you can proceed with account deletion.',
        [
          { text: 'OK', onPress: () => {
            // Check if email is verified and proceed
            checkEmailVerificationAndDelete();
          }},
        ]
      );
    } catch (error) {
      console.error('Error sending verification email:', error);
      Alert.alert('Error', 'Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmailVerificationAndDelete = () => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser?.emailVerified) {
      Alert.alert(
        'Email Verified',
        'Your email has been verified. You can now proceed with account deletion.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Account',
            style: 'destructive',
            onPress: () => {
              attemptAccountDeletion();
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Email Not Verified',
        'Please check your email and click the verification link first.',
        [{ text: 'OK' }]
      );
    }
  };

  const attemptAccountDeletion = async (password?: string) => {
    try {
      setIsLoading(true);
      
      // Always require verification - no more time-based bypass
      const canUsePassword = AuthService.canReauthenticateWithPassword();
      const currentUser = AuthService.getCurrentUser();
      
      if (canUsePassword) {
        // Email/password users must provide password
        if (!password) {
          throw new Error('Password verification is required for account deletion');
        }
        await AuthService.reauthenticateUser(password);
      } else if (currentUser?.emailVerified) {
        // Google Auth users must have verified email
      } else {
        throw new Error('Email verification is required for account deletion');
      }
      
      const currentAuthUser = AuthService.getCurrentUser();
      
      // Delete from both Firebase Auth and Firestore
      await UserService.deleteUserAccount(user!.uid, currentAuthUser);
      
      // The user is now automatically signed out from Firebase Auth
      // The AuthService.onAuthStateChanged listener will handle the sign out
      
      Alert.alert('Account Deleted', 'Your account has been deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      
      let errorMessage = 'Failed to delete account';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <TouchableOpacity
            style={styles.profilePictureContainer}
            onPress={handleImagePicker}
            disabled={isUploadingImage}
          >
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Text style={styles.placeholderText}>
                  {firstName.charAt(0) || lastName.charAt(0) || '?'}
                </Text>
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
            {isUploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.editPictureButton}
            onPress={handleImagePicker}
            disabled={isUploadingImage}
          >
            <Text style={styles.editPictureText}>
              {isUploadingImage ? t('uploading') : t('editPicture')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('personalInformation')}</Text>
          
          {/* Email (Read-only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('email')}</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={user?.email || ''}
              editable={false}
              placeholder={t('email')}
            />
            <Text style={styles.helperText}>{t('emailCannotBeChanged')}</Text>
          </View>

          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('firstName')}</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t('enterFirstName')}
              editable={!isSaving}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('lastName')}</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t('enterLastName')}
              editable={!isSaving}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('phoneNumber')}</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder={t('enterPhoneNumber')}
              keyboardType="phone-pad"
              editable={!isSaving}
            />
            <Text style={styles.helperText}>{t('phoneNumberWillBeVerified')}</Text>
          </View>
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? t('saving') : t('saveChanges')}
          </Text>
        </TouchableOpacity>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings')}</Text>
          
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowLanguageSelector(true)}
            disabled={isSaving}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="globe-outline" size={20} color="#8E8E93" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{t('languageSettings')}</Text>
              <Text style={styles.settingSubtitle}>{t('english')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleDebugPresence}
            disabled={isSaving}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: '#007AFF' }]}>
              <Ionicons name="bug" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Debug Presence</Text>
              <Text style={styles.settingSubtitle}>Check presence and network status</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </TouchableOpacity>

        </View>

        {/* Danger Zone Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dangerZone')}</Text>
          
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleSignOut}
            disabled={isSaving}
          >
            <View style={styles.buttonIconContainer}>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.logoutButtonText}>{t('logOut')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={isSaving}
          >
            <View style={styles.buttonIconContainer}>
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.deleteButtonText}>{t('deleteAccount')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Selector Modal */}
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profilePictureContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPictureButton: {
    marginTop: 8,
  },
  editPictureText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  labelSmall: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 50,
  },
  inputSmall: {
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 44,
  },
  readOnlyInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  readOnlyNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  phoneNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#A0C8FF',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pingButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pingButtonDisabled: {
    backgroundColor: '#a8d5a8',
  },
  pingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // New modern styles
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIconContainer: {
    backgroundColor: '#E8F5E8',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  deleteRow: {
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  dangerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deleteIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  deleteTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
  helperText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  // New button styles
  logoutButton: {
    backgroundColor: '#8E8E93',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#8E8E93',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
