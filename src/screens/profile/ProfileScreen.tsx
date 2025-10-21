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
import { useStore } from '../../store/useStore';
import { UserService } from '../../services/users';
import { MediaService } from '../../services/media';
import { AuthService } from '../../services/auth';
import { notificationService } from '../../services/notifications';
import { presenceService } from '../../services/presence';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 700;

export default function ProfileScreen() {
  const { user, setUser } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  
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
      console.log('Starting profile save for user:', user.uid);
      console.log('Form data:', { firstName, lastName, phoneNumber, profilePicture });
      
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
      console.log('Starting account deletion for user:', user!.uid);
      
      // Always require verification - no more time-based bypass
      const canUsePassword = AuthService.canReauthenticateWithPassword();
      const currentUser = AuthService.getCurrentUser();
      
      if (canUsePassword) {
        // Email/password users must provide password
        if (!password) {
          throw new Error('Password verification is required for account deletion');
        }
        console.log('Re-authenticating user before deletion...');
        await AuthService.reauthenticateUser(password);
      } else if (currentUser?.emailVerified) {
        // Google Auth users must have verified email
        console.log('Email verified, proceeding with deletion...');
      } else {
        throw new Error('Email verification is required for account deletion');
      }
      
      const currentAuthUser = AuthService.getCurrentUser();
      
      // Delete from both Firebase Auth and Firestore
      await UserService.deleteUserAccount(user!.uid, currentAuthUser);
      console.log('Account deleted successfully from both Firebase Auth and Firestore');
      
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

  const handlePingNotification = async () => {
    try {
      setIsPinging(true);
      await notificationService.sendPingNotification();
      Alert.alert('Ping Sent!', 'You should receive a test notification shortly.');
    } catch (error) {
      console.error('Error sending ping notification:', error);
      Alert.alert('Error', 'Failed to send ping notification. Please check your notification permissions.');
    } finally {
      setIsPinging(false);
    }
  };

  const handlePresenceUpdate = async () => {
    try {
      await presenceService.forceUpdatePresence();
      Alert.alert('Presence Updated!', 'Your presence status has been manually updated. Check the console for details.');
    } catch (error) {
      console.error('Error updating presence:', error);
      Alert.alert('Error', 'Failed to update presence status.');
    }
  };

  const handleTestLocalNotification = async () => {
    try {
      setIsPinging(true);
      
      // Use the simplified local test function
      const success = await notificationService.testLocalNotification();
      
      if (success) {
        Alert.alert('Test Sent!', 'You should receive a local notification shortly. This works in Expo Go!');
      } else {
        Alert.alert('Test Failed', 'Failed to send local notification. Check the console for error details.');
      }
    } catch (error) {
      console.error('Error sending local test notification:', error);
      Alert.alert('Error', 'Failed to send local test notification. Check the console for details.');
    } finally {
      setIsPinging(false);
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
        contentContainerStyle={[styles.scrollContent, isSmallScreen && styles.scrollContentSmall]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>Profile</Text>
        </View>

        {/* Profile Picture */}
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
            {isUploadingImage && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.pictureButtonsContainer}>
            <TouchableOpacity
              style={styles.editPictureButton}
              onPress={handleImagePicker}
              disabled={isUploadingImage}
            >
              <Text style={styles.editPictureButtonText}>
                {isUploadingImage ? 'Uploading...' : 'Edit Picture'}
              </Text>
            </TouchableOpacity>
            
            {profilePicture && (
              <TouchableOpacity
                style={styles.deletePictureButton}
                onPress={handleDeleteProfilePicture}
                disabled={isUploadingImage}
              >
                <Text style={styles.deletePictureButtonText}>
                  Delete Picture
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Email (Read-only) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>Email</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={user?.email || ''}
              editable={false}
              placeholder="Email"
            />
            <Text style={styles.readOnlyNote}>Email cannot be changed</Text>
          </View>

          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>First Name</Text>
            <TextInput
              style={[styles.input, isSmallScreen && styles.inputSmall]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              editable={!isSaving}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>Last Name</Text>
            <TextInput
              style={[styles.input, isSmallScreen && styles.inputSmall]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              editable={!isSaving}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>Phone Number</Text>
            <TextInput
              style={[styles.input, isSmallScreen && styles.inputSmall]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              editable={!isSaving}
            />
            <Text style={styles.phoneNote}>Phone number will be verified later</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pingButton, isPinging && styles.pingButtonDisabled]}
            onPress={handlePingNotification}
            disabled={isPinging || isSaving}
          >
            <Text style={styles.pingButtonText}>
              {isPinging ? 'Sending...' : '🔔 Test Notification'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pingButton, isPinging && styles.pingButtonDisabled]}
            onPress={handleTestLocalNotification}
            disabled={isPinging || isSaving}
          >
            <Text style={styles.pingButtonText}>
              {isPinging ? 'Sending...' : '📱 Local Test'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pingButton}
            onPress={handlePresenceUpdate}
            disabled={isSaving}
          >
            <Text style={styles.pingButtonText}>
              🔄 Update Presence
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={isSaving}
          >
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  scrollContentSmall: {
    paddingVertical: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  titleSmall: {
    fontSize: 24,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pictureButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  editPictureButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  editPictureButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  deletePictureButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#ff4444',
    borderRadius: 20,
  },
  deletePictureButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
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
  actions: {
    gap: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#a0c8ff',
  },
  saveButtonText: {
    color: '#fff',
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
  deleteButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
