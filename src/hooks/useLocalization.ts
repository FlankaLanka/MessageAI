import { useState, useEffect } from 'react';
import { localizationService, LocalizationStrings } from '../api/localization';
import { useStore } from '../store/useStore';

/**
 * Hook for accessing localization functionality
 */
export function useLocalization() {
  const { user } = useStore();
  const [, forceUpdate] = useState({});

  // Update localization service when user changes
  useEffect(() => {
    localizationService.setUser(user);
  }, [user]);

  /**
   * Get a localized string
   */
  const t = (key: keyof LocalizationStrings): string => {
    return localizationService.t(key);
  };

  /**
   * Format a localized string with parameters
   */
  const format = (key: keyof LocalizationStrings, params: Record<string, string | number> = {}): string => {
    return localizationService.format(key, params);
  };

  /**
   * Get current language code
   */
  const getCurrentLanguage = (): string => {
    return localizationService.getCurrentLanguage();
  };

  /**
   * Get current language name
   */
  const getCurrentLanguageName = (): string => {
    return localizationService.getCurrentLanguageName();
  };

  /**
   * Get current language native name
   */
  const getCurrentLanguageNativeName = (): string => {
    return localizationService.getCurrentLanguageNativeName();
  };

  /**
   * Set language
   */
  const setLanguage = (languageCode: string) => {
    localizationService.setLanguage(languageCode);
    // Force re-render to update all localized strings
    forceUpdate({});
  };

  /**
   * Get available languages
   */
  const getAvailableLanguages = () => {
    return localizationService.getAvailableLanguages();
  };

  /**
   * Check if language is supported
   */
  const isLanguageSupported = (languageCode: string): boolean => {
    return localizationService.isLanguageSupported(languageCode);
  };

  /**
   * Get language info
   */
  const getLanguageInfo = (languageCode: string) => {
    return localizationService.getLanguageInfo(languageCode);
  };

  return {
    t,
    format,
    getCurrentLanguage,
    getCurrentLanguageName,
    getCurrentLanguageNativeName,
    setLanguage,
    getAvailableLanguages,
    isLanguageSupported,
    getLanguageInfo,
  };
}

/**
 * Hook for getting a specific localized string
 */
export function useTranslation(key: keyof LocalizationStrings): string {
  const { t } = useLocalization();
  return t(key);
}

/**
 * Hook for formatting a localized string with parameters
 */
export function useFormattedTranslation(
  key: keyof LocalizationStrings, 
  params: Record<string, string | number> = {}
): string {
  const { format } = useLocalization();
  return format(key, params);
}
