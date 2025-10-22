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
import { UserService } from '../services/users';
import { simpleTranslationService } from '../services/simpleTranslation';

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
    culturalHintsEnabled,
    setDefaultTranslationLanguage,
    setCulturalHintsEnabled,
    clearTranslationCache
  } = useStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLanguageList, setShowLanguageList] = useState(false);

  const translationLanguages = simpleTranslationService.getAvailableLanguages();

  const handleLanguageSelect = async (languageCode: string) => {
    if (languageCode === defaultTranslationLanguage || isUpdating) return;

    setIsUpdating(true);
    try {
      // Update translation language
      setDefaultTranslationLanguage(languageCode);
      
      // Update UI language to match
      setLanguage(languageCode);
      
      // Update user's default language in Firestore
      if (user) {
        await UserService.updateUserProfile(user.uid, {
          defaultLanguage: languageCode,
        });
        
        // Update local user state
        setUser({
          ...user,
          defaultLanguage: languageCode,
        });
      }
      
      setShowLanguageList(false);
    } catch (error) {
      console.error('Error updating language:', error);
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
              await clearTranslationCache();
              Alert.alert(t('success'), t('clearCacheSuccess'));
            } catch (error) {
              Alert.alert(t('error'), t('clearCacheError'));
            }
          }
        }
      ]
    );
  };

  const renderLanguageItem = ({ item }: { item: { code: string; name: string } }) => {
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
            {item.name}
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
                <Text style={styles.settingTitle}>Translation Language</Text>
                <Text style={styles.settingDescription}>
                  Messages will be translated to: {translationLanguages.find(l => l.code === defaultTranslationLanguage)?.name || 'English'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Cultural hints setting */}
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Cultural Hints</Text>
                <Text style={styles.settingDescription}>
                  Show cultural context for slang, idioms, and cultural references
                </Text>
              </View>
              <Switch
                value={culturalHintsEnabled}
                onValueChange={setCulturalHintsEnabled}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={culturalHintsEnabled ? '#fff' : '#fff'}
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
                  Remove cached translations to free up storage space
                </Text>
              </View>
              <Ionicons name="trash" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Translation Tips */}
          <View style={styles.tipsSection}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={20} color="#F59E0B" />
              <Text style={styles.tipsTitle}>{t('translationTips')}</Text>
            </View>
            <Text style={styles.tipsText}>
              {t('setYourDefaultLanguage')}{'\n'}
              {t('culturalHintsHelp')}{'\n'}
              {t('translationsCached')}{'\n'}
              {t('voiceMessagesTranscribed')}{'\n'}
              {t('noLanguageDetectionNeeded')}
            </Text>
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
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  languageList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
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
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
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
