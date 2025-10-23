import { User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocalizationStrings {
  // Navigation
  messages: string;
  profile: string;
  
  // Authentication
  signIn: string;
  signUp: string;
  signOut: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  
  // Chat
  sendMessage: string;
  typeMessage: string;
  online: string;
  offline: string;
  lastSeen: string;
  typing: string;
  read: string;
  delivered: string;
  sent: string;
  
  // Groups
  createGroup: string;
  addMembers: string;
  groupName: string;
  groupDescription: string;
  members: string;
  leaveGroup: string;
  deleteGroup: string;
  
  // Profile
  editProfile: string;
  changePhoto: string;
  status: string;
  about: string;
  settings: string;
  translationSettings: string;
  languageSettings: string;
  
  // Translation
  translate: string;
  translating: string;
  translationFailed: string;
  clearTranslationCache: string;
  clearCacheConfirm: string;
  clearCacheSuccess: string;
  clearCacheError: string;
  cancel: string;
  clear: string;
  success: string;
  error: string;
  
  // Voice Messages
  recordVoiceMessage: string;
  playVoiceMessage: string;
  pauseVoiceMessage: string;
  viewTranscription: string;
  voiceTranscription: string;
  noTranscriptionAvailable: string;
  
  // Notifications
  newMessage: string;
  newGroupMessage: string;
  messageFrom: string;
  
  // Common
  loading: string;
  retry: string;
  done: string;
  back: string;
  next: string;
  save: string;
  delete: string;
  edit: string;
  close: string;
  yes: string;
  no: string;
  ok: string;
  
  // Additional UI strings
  unknownUser: string;
  addMessage: string;
  groupChat: string;
  send: string;
  failedToSendMessage: string;
  failedToSendVoiceMessage: string;
  failedToAddReaction: string;
  noMessagesYet: string;
  // Profile and Auth strings
  saveChanges: string;
  saving: string;
  editPicture: string;
  uploading: string;
  deletePicture: string;
  deleteAccount: string;
  emailCannotBeChanged: string;
  enterFirstName: string;
  enterLastName: string;
  enterPhoneNumber: string;
  phoneNumberWillBeVerified: string;
  welcomeBack: string;
  signInToAccount: string;
  signingIn: string;
  signInWithGoogle: string;
  dontHaveAccount: string;
  createAccount: string;
  signUpForAccount: string;
  creatingAccount: string;
  signUpWithGoogle: string;
  alreadyHaveAccount: string;
  connectWithWorld: string;
  loadingProfile: string;
  userNotFound: string;
  goBack: string;
  deletedUser: string;
  userDeletedAccount: string;
  // Language settings
  translationLanguage: string;
  messagesWillBeTranslatedTo: string;
  culturalHints: string;
  showCulturalContext: string;
  removeCachedTranslations: string;
  selectLanguage: string;
  // Smart Suggestions
  smartSuggestions: string;
  generatingSuggestions: string;
  // Translation Display
  aiAnalysis: string;
  intent: string;
  tone: string;
  topic: string;
  entities: string;
  literal: string;
}

// English (default)
const en: LocalizationStrings = {
  // Navigation
  messages: 'Messages',
  profile: 'Profile',
  
  // Authentication
  signIn: 'Sign In',
  signUp: 'Sign Up',
  signOut: 'Sign Out',
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  firstName: 'First Name',
  lastName: 'Last Name',
  phoneNumber: 'Phone Number',
  
  // Chat
  sendMessage: 'Send Message',
  typeMessage: 'Type a message...',
  online: 'Online',
  offline: 'Offline',
  lastSeen: 'Last seen',
  typing: 'typing...',
  read: 'Read',
  delivered: 'Delivered',
  sent: 'Sent',
  
  // Groups
  createGroup: 'Create Group',
  addMembers: 'Add Members',
  groupName: 'Group Name',
  groupDescription: 'Group Description',
  members: 'Members',
  leaveGroup: 'Leave Group',
  deleteGroup: 'Delete Group',
  
  // Profile
  editProfile: 'Edit Profile',
  changePhoto: 'Change Photo',
  status: 'Status',
  about: 'About',
  settings: 'Settings',
  translationSettings: 'Translation Settings',
  languageSettings: 'Language Settings',
  
  // Translation
  translate: 'Translate',
  translating: 'Translating...',
  translationFailed: 'Translation failed',
  clearTranslationCache: 'Clear Translation Cache',
  clearCacheConfirm: 'This will clear all cached translations and cultural hints. You may need to re-translate some messages.',
  clearCacheSuccess: 'Translation cache cleared',
  clearCacheError: 'Failed to clear cache',
  cancel: 'Cancel',
  clear: 'Clear',
  success: 'Success',
  error: 'Error',
  
  // Voice Messages
  recordVoiceMessage: 'Record Voice Message',
  playVoiceMessage: 'Play Voice Message',
  pauseVoiceMessage: 'Pause Voice Message',
  viewTranscription: 'View Transcription',
  voiceTranscription: 'Voice Transcription',
  noTranscriptionAvailable: 'No transcription available',
  
  // Notifications
  newMessage: 'New Message',
  newGroupMessage: 'New Group Message',
  messageFrom: 'Message from',
  
  // Common
  loading: 'Loading...',
  retry: 'Retry',
  done: 'Done',
  back: 'Back',
  next: 'Next',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  close: 'Close',
  yes: 'Yes',
  no: 'No',
  ok: 'OK',
  
  // Additional UI strings
  unknownUser: 'Unknown User',
  addMessage: 'Add a message...',
  groupChat: 'Group Chat',
  send: 'Send',
  failedToSendMessage: 'Failed to send message',
  failedToSendVoiceMessage: 'Failed to send voice message',
  failedToAddReaction: 'Failed to add reaction',
  noMessagesYet: 'No messages yet',
  // Profile and Auth strings
  saveChanges: 'Save Changes',
  saving: 'Saving...',
  editPicture: 'Edit Picture',
  uploading: 'Uploading...',
  deletePicture: 'Delete Picture',
  deleteAccount: 'Delete Account',
  emailCannotBeChanged: 'Email cannot be changed',
  enterFirstName: 'Enter your first name',
  enterLastName: 'Enter your last name',
  enterPhoneNumber: 'Enter your phone number',
  phoneNumberWillBeVerified: 'Phone number will be verified later',
  welcomeBack: 'Welcome Back!',
  signInToAccount: 'Sign in to your account',
  signingIn: 'Signing In...',
  signInWithGoogle: 'Sign in with Google',
  dontHaveAccount: "Don't have an account? Sign up",
  createAccount: 'Create Account',
  signUpForAccount: 'Sign up for a new account',
  creatingAccount: 'Creating Account...',
  signUpWithGoogle: 'Sign up with Google',
  alreadyHaveAccount: 'Already have an account? Sign in',
  connectWithWorld: 'Connect with the world',
  loadingProfile: 'Loading profile...',
  userNotFound: 'User not found',
  goBack: 'Go Back',
  deletedUser: 'Deleted User',
  userDeletedAccount: 'This user has deleted their account',
  // Language settings
  translationLanguage: 'Translation Language',
  messagesWillBeTranslatedTo: 'Messages will be translated to:',
  culturalHints: 'Cultural Hints',
  showCulturalContext: 'Show cultural context for slang, idioms, and cultural references',
  removeCachedTranslations: 'Remove cached translations to free up storage space',
  selectLanguage: 'Select Language',
  // Smart Suggestions
  smartSuggestions: 'Smart Suggestions',
  generatingSuggestions: 'Generating suggestions...',
  // Translation Display
  aiAnalysis: 'AI Analysis',
  intent: 'Intent',
  tone: 'Tone',
  topic: 'Topic',
  entities: 'Entities',
  literal: 'Literal',
};

// Spanish
const es: LocalizationStrings = {
  // Navigation
  messages: 'Mensajes',
  profile: 'Perfil',
  
  // Authentication
  signIn: 'Iniciar Sesión',
  signUp: 'Registrarse',
  signOut: 'Cerrar Sesión',
  email: 'Correo Electrónico',
  password: 'Contraseña',
  confirmPassword: 'Confirmar Contraseña',
  firstName: 'Nombre',
  lastName: 'Apellido',
  phoneNumber: 'Número de Teléfono',
  
  // Chat
  sendMessage: 'Enviar Mensaje',
  typeMessage: 'Escribe un mensaje...',
  online: 'En línea',
  offline: 'Desconectado',
  lastSeen: 'Visto por última vez',
  typing: 'escribiendo...',
  read: 'Leído',
  delivered: 'Entregado',
  sent: 'Enviado',
  
  // Groups
  createGroup: 'Crear Grupo',
  addMembers: 'Agregar Miembros',
  groupName: 'Nombre del Grupo',
  groupDescription: 'Descripción del Grupo',
  members: 'Miembros',
  leaveGroup: 'Abandonar Grupo',
  deleteGroup: 'Eliminar Grupo',
  
  // Profile
  editProfile: 'Editar Perfil',
  changePhoto: 'Cambiar Foto',
  status: 'Estado',
  about: 'Acerca de',
  settings: 'Configuración',
  translationSettings: 'Configuración de Traducción',
  languageSettings: 'Configuración de Idioma',
  
  // Translation
  translate: 'Traducir',
  translating: 'Traduciendo...',
  translationFailed: 'Error en la traducción',
  clearTranslationCache: 'Limpiar Caché de Traducción',
  clearCacheConfirm: 'Esto eliminará todas las traducciones y pistas culturales en caché. Es posible que necesites volver a traducir algunos mensajes.',
  clearCacheSuccess: 'Caché de traducción limpiado',
  clearCacheError: 'Error al limpiar caché',
  cancel: 'Cancelar',
  clear: 'Limpiar',
  success: 'Éxito',
  error: 'Error',
  
  // Voice Messages
  recordVoiceMessage: 'Grabar Mensaje de Voz',
  playVoiceMessage: 'Reproducir Mensaje de Voz',
  pauseVoiceMessage: 'Pausar Mensaje de Voz',
  viewTranscription: 'Ver Transcripción',
  voiceTranscription: 'Transcripción de Voz',
  noTranscriptionAvailable: 'No hay transcripción disponible',
  
  // Notifications
  newMessage: 'Nuevo Mensaje',
  newGroupMessage: 'Nuevo Mensaje de Grupo',
  messageFrom: 'Mensaje de',
  
  // Common
  loading: 'Cargando...',
  retry: 'Reintentar',
  done: 'Hecho',
  back: 'Atrás',
  next: 'Siguiente',
  save: 'Guardar',
  delete: 'Eliminar',
  edit: 'Editar',
  close: 'Cerrar',
  yes: 'Sí',
  no: 'No',
  ok: 'OK',
  
  // Additional UI strings
  unknownUser: 'Usuario Desconocido',
  addMessage: 'Agregar mensaje...',
  groupChat: 'Chat Grupal',
  send: 'Enviar',
  failedToSendMessage: 'Error al enviar mensaje',
  failedToSendVoiceMessage: 'Error al enviar mensaje de voz',
  failedToAddReaction: 'Error al agregar reacción',
  noMessagesYet: 'Aún no hay mensajes',
  // Profile and Auth strings
  saveChanges: 'Guardar Cambios',
  saving: 'Guardando...',
  editPicture: 'Editar Foto',
  uploading: 'Subiendo...',
  deletePicture: 'Eliminar Foto',
  deleteAccount: 'Eliminar Cuenta',
  emailCannotBeChanged: 'El correo no se puede cambiar',
  enterFirstName: 'Ingresa tu nombre',
  enterLastName: 'Ingresa tu apellido',
  enterPhoneNumber: 'Ingresa tu número de teléfono',
  phoneNumberWillBeVerified: 'El número de teléfono se verificará más tarde',
  welcomeBack: '¡Bienvenido de nuevo!',
  signInToAccount: 'Inicia sesión en tu cuenta',
  signingIn: 'Iniciando sesión...',
  signInWithGoogle: 'Iniciar sesión con Google',
  dontHaveAccount: '¿No tienes cuenta? Regístrate',
  createAccount: 'Crear Cuenta',
  signUpForAccount: 'Regístrate para una nueva cuenta',
  creatingAccount: 'Creando cuenta...',
  signUpWithGoogle: 'Registrarse con Google',
  alreadyHaveAccount: '¿Ya tienes cuenta? Inicia sesión',
  connectWithWorld: 'Conecta con el mundo',
  loadingProfile: 'Cargando perfil...',
  userNotFound: 'Usuario no encontrado',
  goBack: 'Volver',
  deletedUser: 'Usuario Eliminado',
  userDeletedAccount: 'Este usuario ha eliminado su cuenta',
  // Language settings
  translationLanguage: 'Idioma de Traducción',
  messagesWillBeTranslatedTo: 'Los mensajes se traducirán a:',
  culturalHints: 'Pistas Culturales',
  showCulturalContext: 'Mostrar contexto cultural para jerga, modismos y referencias culturales',
  removeCachedTranslations: 'Eliminar traducciones en caché para liberar espacio de almacenamiento',
  selectLanguage: 'Seleccionar Idioma',
  // Smart Suggestions
  smartSuggestions: 'Sugerencias Inteligentes',
  generatingSuggestions: 'Generando sugerencias...',
  // Translation Display
  aiAnalysis: 'Análisis de IA',
  intent: 'Intención',
  tone: 'Tono',
  topic: 'Tema',
  entities: 'Entidades',
  literal: 'Literal',
};

// Chinese (Simplified)
const zh: LocalizationStrings = {
  // Navigation
  messages: '消息',
  profile: '个人资料',
  
  // Authentication
  signIn: '登录',
  signUp: '注册',
  signOut: '退出登录',
  email: '邮箱',
  password: '密码',
  confirmPassword: '确认密码',
  firstName: '名字',
  lastName: '姓氏',
  phoneNumber: '电话号码',
  
  // Chat
  sendMessage: '发送消息',
  typeMessage: '输入消息...',
  online: '在线',
  offline: '离线',
  lastSeen: '最后上线',
  typing: '正在输入...',
  read: '已读',
  delivered: '已送达',
  sent: '已发送',
  
  // Groups
  createGroup: '创建群组',
  addMembers: '添加成员',
  groupName: '群组名称',
  groupDescription: '群组描述',
  members: '成员',
  leaveGroup: '退出群组',
  deleteGroup: '删除群组',
  
  // Profile
  editProfile: '编辑个人资料',
  changePhoto: '更换头像',
  status: '状态',
  about: '关于',
  settings: '设置',
  translationSettings: '翻译设置',
  languageSettings: '语言设置',
  
  // Translation
  translate: '翻译',
  translating: '翻译中...',
  translationFailed: '翻译失败',
  clearTranslationCache: '清除翻译缓存',
  clearCacheConfirm: '这将清除所有缓存的翻译和文化提示。您可能需要重新翻译一些消息。',
  clearCacheSuccess: '翻译缓存已清除',
  clearCacheError: '清除缓存失败',
  cancel: '取消',
  clear: '清除',
  success: '成功',
  error: '错误',
  
  // Voice Messages
  recordVoiceMessage: '录制语音消息',
  playVoiceMessage: '播放语音消息',
  pauseVoiceMessage: '暂停语音消息',
  viewTranscription: '查看转录',
  voiceTranscription: '语音转录',
  noTranscriptionAvailable: '无转录可用',
  
  // Notifications
  newMessage: '新消息',
  newGroupMessage: '新群组消息',
  messageFrom: '来自',
  
  // Common
  loading: '加载中...',
  retry: '重试',
  done: '完成',
  back: '返回',
  next: '下一步',
  save: '保存',
  delete: '删除',
  edit: '编辑',
  close: '关闭',
  yes: '是',
  no: '否',
  ok: '确定',
  
  // Additional UI strings
  unknownUser: '未知用户',
  addMessage: '添加消息...',
  groupChat: '群组聊天',
  send: '发送',
  failedToSendMessage: '发送消息失败',
  failedToSendVoiceMessage: '发送语音消息失败',
  failedToAddReaction: '添加反应失败',
  noMessagesYet: '暂无消息',
  // Profile and Auth strings
  saveChanges: '保存更改',
  saving: '保存中...',
  editPicture: '编辑照片',
  uploading: '上传中...',
  deletePicture: '删除照片',
  deleteAccount: '删除账户',
  emailCannotBeChanged: '邮箱无法更改',
  enterFirstName: '输入您的名字',
  enterLastName: '输入您的姓氏',
  enterPhoneNumber: '输入您的电话号码',
  phoneNumberWillBeVerified: '电话号码稍后将进行验证',
  welcomeBack: '欢迎回来！',
  signInToAccount: '登录您的账户',
  signingIn: '登录中...',
  signInWithGoogle: '使用 Google 登录',
  dontHaveAccount: '没有账户？注册',
  createAccount: '创建账户',
  signUpForAccount: '注册新账户',
  creatingAccount: '创建账户中...',
  signUpWithGoogle: '使用 Google 注册',
  alreadyHaveAccount: '已有账户？登录',
  connectWithWorld: '与世界连接',
  loadingProfile: '加载个人资料中...',
  userNotFound: '用户未找到',
  goBack: '返回',
  deletedUser: '已删除用户',
  userDeletedAccount: '此用户已删除其账户',
  // Language settings
  translationLanguage: '翻译语言',
  messagesWillBeTranslatedTo: '消息将翻译为：',
  culturalHints: '文化提示',
  showCulturalContext: '显示俚语、习语和文化参考的文化背景',
  removeCachedTranslations: '删除缓存的翻译以释放存储空间',
  selectLanguage: '选择语言',
  // Smart Suggestions
  smartSuggestions: '智能建议',
  generatingSuggestions: '正在生成建议...',
  // Translation Display
  aiAnalysis: 'AI分析',
  intent: '意图',
  tone: '语气',
  topic: '主题',
  entities: '实体',
  literal: '字面意思',
};

// Available languages
export const availableLanguages = [
  { code: 'EN', name: 'English', nativeName: 'English' },
  { code: 'ES', name: 'Spanish', nativeName: 'Español' },
  { code: 'ZH', name: 'Chinese', nativeName: '中文' },
];

// Language mappings
const translations: Record<string, LocalizationStrings> = {
  EN: en,
  ES: es,
  ZH: zh,
};

class LocalizationService {
  private currentLanguage: string = 'EN';
  private user: User | null = null;
  private readonly LANGUAGE_STORAGE_KEY = 'selected_language';

  constructor() {
    // Initialize with English as default
    this.currentLanguage = 'EN';
    // Load persisted language on initialization
    this.loadPersistedLanguage();
  }

  /**
   * Load persisted language from AsyncStorage
   */
  private async loadPersistedLanguage() {
    try {
      const persistedLanguage = await AsyncStorage.getItem(this.LANGUAGE_STORAGE_KEY);
      if (persistedLanguage && translations[persistedLanguage]) {
        this.currentLanguage = persistedLanguage;
        console.log('Loaded persisted language:', persistedLanguage);
      }
    } catch (error) {
      console.error('Error loading persisted language:', error);
    }
  }

  /**
   * Initialize the localization service (call this on app start)
   */
  async initialize() {
    await this.loadPersistedLanguage();
  }

  /**
   * Persist language choice to AsyncStorage
   */
  private async persistLanguage(languageCode: string) {
    try {
      await AsyncStorage.setItem(this.LANGUAGE_STORAGE_KEY, languageCode);
      console.log('Persisted language choice:', languageCode);
    } catch (error) {
      console.error('Error persisting language choice:', error);
    }
  }

  /**
   * Set the current user and their language preference
   */
  setUser(user: User | null) {
    this.user = user;
    if (user?.defaultLanguage) {
      console.log('Setting user language preference from Firebase:', user.defaultLanguage);
      this.setLanguage(user.defaultLanguage);
    } else {
      console.log('No user language preference found, using persisted language');
    }
  }

  /**
   * Set the current language
   */
  setLanguage(languageCode: string) {
    if (translations[languageCode]) {
      this.currentLanguage = languageCode;
      // Persist the language choice
      this.persistLanguage(languageCode);
    } else {
      console.warn(`Language ${languageCode} not supported, falling back to English`);
      this.currentLanguage = 'EN';
      // Persist the fallback language
      this.persistLanguage('EN');
    }
  }

  /**
   * Get the current language code
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Get the current language name
   */
  getCurrentLanguageName(): string {
    const lang = availableLanguages.find(l => l.code === this.currentLanguage);
    return lang?.name || 'English';
  }

  /**
   * Get the current language native name
   */
  getCurrentLanguageNativeName(): string {
    const lang = availableLanguages.find(l => l.code === this.currentLanguage);
    return lang?.nativeName || 'English';
  }

  /**
   * Get a localized string
   */
  t(key: keyof LocalizationStrings): string {
    const translation = translations[this.currentLanguage];
    if (!translation) {
      console.warn(`Translation not found for language ${this.currentLanguage}, key ${key}`);
      return translations.EN[key] || key;
    }
    return translation[key] || translations.EN[key] || key;
  }

  /**
   * Get all available languages
   */
  getAvailableLanguages() {
    return availableLanguages;
  }

  /**
   * Check if a language is supported
   */
  isLanguageSupported(languageCode: string): boolean {
    return languageCode in translations;
  }

  /**
   * Get language info by code
   */
  getLanguageInfo(languageCode: string) {
    return availableLanguages.find(l => l.code === languageCode);
  }

  /**
   * Format a localized string with parameters
   */
  format(key: keyof LocalizationStrings, params: Record<string, string | number> = {}): string {
    let text = this.t(key);
    
    // Replace parameters in the format {paramName}
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(new RegExp(`{${param}}`, 'g'), String(value));
    });
    
    return text;
  }
}

export const localizationService = new LocalizationService();
