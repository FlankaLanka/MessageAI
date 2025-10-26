import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useLocalization } from '../../hooks/useLocalization';

interface TranslationSettingsScreenProps {
  onNavigateBack: () => void;
}

export default function TranslationSettingsScreen({ onNavigateBack }: TranslationSettingsScreenProps) {
  const {
    clearTranslationCache
  } = useStore();
  
  const { t, format } = useLocalization();

  const [showCacheModal, setShowCacheModal] = useState(false);

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


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onNavigateBack}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('languageSettings')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>


        {/* Cache management */}
        <TouchableOpacity
          style={styles.settingSection}
          onPress={() => setShowCacheModal(true)}
        >
          <View style={styles.settingHeader}>
            <View style={styles.settingIcon}>
              <Ionicons name="trash" size={24} color="#EF4444" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>{t('clearTranslationCache')}</Text>
              <Text style={styles.settingDescription}>
                Remove cached translations to free up storage space
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Translation info */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <Text style={styles.infoTitle}>Translation Tips</Text>
          </View>
          <Text style={styles.infoText}>
            • Set your translation language to translate messages{'\n'}
            • Use 'Advanced' or 'Auto-Advanced' modes for cultural hints and context{'\n'}
            • Translations are cached for faster loading and reduced costs{'\n'}
            • Voice messages are automatically transcribed and translated{'\n'}
            • Tap the translate button on messages to translate them
          </Text>
        </View>
      </ScrollView>


      {/* Cache Management Modal */}
      <Modal
        visible={showCacheModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCacheModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cache Management</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCacheModal(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.cacheContent}>
              <Text style={styles.cacheDescription}>
                Clearing the translation cache will remove all stored translations and cultural hints. 
                This may result in re-translating some messages when you view them again.
              </Text>
              <TouchableOpacity
                style={styles.clearCacheButton}
                onPress={handleClearCache}
              >
                <Ionicons name="trash" size={20} color="#fff" />
                <Text style={styles.clearCacheText}>Clear Cache</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  backButton: {
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
  settingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  infoSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  cacheContent: {
    padding: 20,
  },
  cacheDescription: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    marginBottom: 24,
  },
  clearCacheButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  clearCacheText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
