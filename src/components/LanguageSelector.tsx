import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../hooks/useLocalization';
import { useStore } from '../store/useStore';
import { availableLanguages } from '../api/localization';
import { UserService } from '../api/users';
import { simpleTranslationService } from '../api/simpleTranslation';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageSelector({ visible, onClose }: LanguageSelectorProps) {
  const { t, setLanguage } = useLocalization();
  const { 
    user, 
    setUser,
    defaultTranslationLanguage,
    translationMode,
    translationCacheEnabled,
    smartSuggestionsUseRAG,
    smartSuggestionsIncludeOtherLanguage,
    setDefaultTranslationLanguage,
    setTranslationMode,
    setTranslationCacheEnabled,
    setSmartSuggestionsUseRAG,
    setSmartSuggestionsIncludeOtherLanguage,
    clearTranslationCache
  } = useStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLanguageList, setShowLanguageList] = useState(false);
  const [showTranslationModeList, setShowTranslationModeList] = useState(false);

  const translationLanguages = availableLanguages;
  
  const translationModes = [
    { 
      value: 'manual', 
      title: t('manualTranslate'), 
      description: t('manualTranslateDescription') 
    },
    { 
      value: 'auto', 
      title: t('autoTranslate'), 
      description: t('autoTranslateDescription') 
    },
    { 
      value: 'advanced', 
      title: t('advancedTranslate'), 
      description: t('advancedTranslateDescription') 
    },
    { 
      value: 'auto-advanced', 
      title: t('autoAdvancedTranslate'), 
      description: t('autoAdvancedTranslateDescription') 
    }
  ];

  const handleLanguageSelect = async (languageCode: string) => {
    if (languageCode === defaultTranslationLanguage || isUpdating) return;

    setIsUpdating(true);
    try {
      // Clear translation cache when language changes
      // Different target languages will produce different translations
      await clearTranslationCache();
      
      // Update translation language
      setDefaultTranslationLanguage(languageCode);
      
      // Update UI language to match
      setLanguage(languageCode);
      
      // Update user's default language in Firestore
      if (user) {
        await UserService.updateUserProfile(user.uid, {
          defaultLanguage: languageCode,
        });
        
        // Update local user state - preserve all existing settings
        const updatedUser = {
          ...user,
          defaultLanguage: languageCode,
          // Ensure all settings are preserved from the current user object
          translationCacheEnabled: user.translationCacheEnabled,
          smartSuggestionsUseRAG: user.smartSuggestionsUseRAG,
          smartSuggestionsIncludeOtherLanguage: user.smartSuggestionsIncludeOtherLanguage,
        };
        setUser(updatedUser);
      }
      
      setShowLanguageList(false);
    } catch (error) {
      console.error('Error updating language:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTranslationModeSelect = async (mode: 'manual' | 'auto' | 'advanced' | 'auto-advanced') => {
    if (mode === translationMode || isUpdating) return;

    setIsUpdating(true);
    try {
      // Clear translation cache when mode changes
      // Different modes may produce different results (e.g., advanced vs simple)
      await clearTranslationCache();
      
      // Update translation mode
      setTranslationMode(mode);
      
      // Update user profile with new translation mode preference
      if (user) {
        await UserService.updateUserProfile(user.uid, {
          translationMode: mode,
        });
        
        // Update local user state - preserve all existing settings
        const updatedUser = {
          ...user,
          translationMode: mode,
          // Ensure all settings are preserved from the current user object
          translationCacheEnabled: user.translationCacheEnabled,
          smartSuggestionsUseRAG: user.smartSuggestionsUseRAG,
          smartSuggestionsIncludeOtherLanguage: user.smartSuggestionsIncludeOtherLanguage,
        };
        setUser(updatedUser);
      }
      
      setShowTranslationModeList(false);
    } catch (error) {
      console.error('Error updating translation mode:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      t('clearTranslationCache'),
      t('clearCacheConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clear'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Actually clear the translation cache
              await clearTranslationCache();
              Alert.alert(t('success'), t('clearCacheSuccess'));
            } catch (error) {
              console.error('Error clearing translation cache:', error);
              Alert.alert(t('error'), t('clearCacheError'));
            }
          }
        }
      ]
    );
  };

  const handleTranslationCacheToggle = async (enabled: boolean) => {
    try {
      setIsUpdating(true);
      await setTranslationCacheEnabled(enabled);
    } catch (error) {
      console.error('Error updating translation cache setting:', error);
      Alert.alert(t('error'), t('updateSettingError'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSmartSuggestionsRAGToggle = async (useRAG: boolean) => {
    try {
      setIsUpdating(true);
      await setSmartSuggestionsUseRAG(useRAG);
    } catch (error) {
      console.error('Error updating smart suggestions RAG setting:', error);
      Alert.alert(t('error'), t('updateSettingError'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSmartSuggestionsLanguageToggle = async (includeOtherLanguage: boolean) => {
    try {
      setIsUpdating(true);
      await setSmartSuggestionsIncludeOtherLanguage(includeOtherLanguage);
    } catch (error) {
      console.error('Error updating smart suggestions language setting:', error);
      Alert.alert(t('error'), t('updateSettingError'));
    } finally {
      setIsUpdating(false);
    }
  };

  const renderLanguageItem = ({ item }: { item: { code: string; name: string; nativeName: string } }) => {
    const isSelected = item.code === defaultTranslationLanguage;
    
    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          isSelected && styles.selectedLanguageItem
        ]}
        onPress={() => handleLanguageSelect(item.code)}
        disabled={isUpdating}
      >
        <View style={styles.languageInfo}>
          <Text style={[
            styles.languageName,
            isSelected && styles.selectedLanguageName
          ]}>
            {item.nativeName}
          </Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark" size={20} color="#3B82F6" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={isUpdating}
          >
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('languageSettings')}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Language Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌐 {t('languageSettings')}</Text>
            
            {/* Translation language */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowLanguageList(true)}
              disabled={isUpdating}
            >
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{t('translationLanguage')}</Text>
                <Text style={styles.settingDescription}>
                  {t('messagesWillBeTranslatedTo')} {translationLanguages.find(l => l.code === defaultTranslationLanguage)?.nativeName || 'English'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Translation mode setting */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowTranslationModeList(true)}
              disabled={isUpdating}
            >
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{t('translationMode')}</Text>
                <Text style={styles.settingDescription}>
                  {translationMode === 'manual' && t('manualTranslateDescription')}
                  {translationMode === 'auto' && t('autoTranslateDescription')}
                  {translationMode === 'advanced' && t('advancedTranslateDescription')}
                  {translationMode === 'auto-advanced' && t('autoAdvancedTranslateDescription')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Translation cache toggle */}
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{t('translationCache')}</Text>
                <Text style={styles.settingDescription}>
                  {t('translationCacheDescription')}
                </Text>
              </View>
              <Switch
                value={translationCacheEnabled}
                onValueChange={handleTranslationCacheToggle}
                disabled={isUpdating}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={translationCacheEnabled ? '#fff' : '#fff'}
              />
            </View>

            {/* Clear cache */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleClearCache}
              disabled={isUpdating}
            >
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{t('clearTranslationCache')}</Text>
                <Text style={styles.settingDescription}>
                  {t('removeCachedTranslations')}
                </Text>
              </View>
              <Ionicons name="trash" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Smart Suggestions Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('smartSuggestions')}</Text>
            
            {/* RAG vs Recent Messages toggle */}
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{t('useRAGContext')}</Text>
                <Text style={styles.settingDescription}>
                  {smartSuggestionsUseRAG 
                    ? t('useRAGContextDescriptionEnabled')
                    : t('useRAGContextDescriptionDisabled')
                  }
                </Text>
              </View>
              <Switch
                value={smartSuggestionsUseRAG}
                onValueChange={handleSmartSuggestionsRAGToggle}
                disabled={isUpdating}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={smartSuggestionsUseRAG ? '#fff' : '#fff'}
              />
            </View>

            {/* Include other language toggle */}
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{t('includeOtherLanguage')}</Text>
                <Text style={styles.settingDescription}>
                  {smartSuggestionsIncludeOtherLanguage 
                    ? t('includeOtherLanguageDescriptionEnabled')
                    : t('includeOtherLanguageDescriptionDisabled')
                  }
                </Text>
              </View>
              <Switch
                value={smartSuggestionsIncludeOtherLanguage}
                onValueChange={handleSmartSuggestionsLanguageToggle}
                disabled={isUpdating}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={smartSuggestionsIncludeOtherLanguage ? '#fff' : '#fff'}
              />
            </View>
          </View>

        </ScrollView>

        {/* Language List Modal */}
        <Modal
          visible={showLanguageList}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLanguageList(false)}
        >
          <View style={styles.modalOverlay}>
            <SafeAreaView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowLanguageList(false)}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={translationLanguages}
                keyExtractor={(item) => item.code}
                renderItem={renderLanguageItem}
                style={styles.languageList}
                showsVerticalScrollIndicator={false}
              />
            </SafeAreaView>
          </View>
        </Modal>

        {/* Translation Mode List Modal */}
        <Modal
          visible={showTranslationModeList}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTranslationModeList(false)}
        >
          <View style={styles.modalOverlay}>
            <SafeAreaView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('selectTranslationMode')}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowTranslationModeList(false)}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={translationModes}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => {
                  const isSelected = item.value === translationMode;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.languageItem,
                        isSelected && styles.selectedLanguageItem
                      ]}
                      onPress={() => handleTranslationModeSelect(item.value as 'manual' | 'auto' | 'advanced' | 'auto-advanced')}
                      disabled={isUpdating}
                    >
                      <View style={styles.languageInfo}>
                        <Text style={[
                          styles.languageName,
                          isSelected && styles.selectedLanguageName
                        ]}>
                          {item.title}
                        </Text>
                        <Text style={[
                          styles.languageDescription,
                          isSelected && styles.selectedLanguageDescription
                        ]}>
                          {item.description}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color="#3B82F6" />
                      )}
                    </TouchableOpacity>
                  );
                }}
                style={styles.languageList}
                showsVerticalScrollIndicator={false}
              />
            </SafeAreaView>
          </View>
        </Modal>

        {isUpdating && (
          <View style={styles.updatingOverlay}>
            <Text style={styles.updatingText}>{t('loading')}</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  tipsSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  languageList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedLanguageItem: {
    backgroundColor: '#F0F9FF',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  languageDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  selectedLanguageDescription: {
    color: '#3B82F6',
  },
  selectedLanguageName: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  languageNativeName: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedLanguageNativeName: {
    color: '#3B82F6',
  },
  updatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updatingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
