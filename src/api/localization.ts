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
  adding: string;
  add: string;
  failedToAddMembers: string;
  typeAtLeast3Characters: string;
  searching: string;
  noUsersFound: string;
  back: string;
  description: string;
  enterGroupName: string;
  enterGroupDescriptionOptional: string;
  searchAndAddMembers: string;
  selectedMembers: string;
  creating: string;
  groupMembersWillBeNotified: string;
  addGroupMembers: string;
  pleaseEnterGroupName: string;
  mustBeLoggedInToCreateGroup: string;
  groupCreatedSuccessfully: string;
  failedToCreateGroup: string;
  searchUsers: string;
  groupMembers: string;
  admin: string;
  noMembersFound: string;
  loadingMembers: string;
  you: string;
  
  // Profile
  editProfile: string;
  changePhoto: string;
  status: string;
  about: string;
  settings: string;
  translationSettings: string;
  languageSettings: string;
  personalInformation: string;
  dangerZone: string;
  logOut: string;
  testPushNotification: string;
  sendTestNotification: string;
  english: string;
  emailCannotBeChanged: string;
  phoneNumberWillBeVerified: string;
  
  // Translation
  translate: string;
  translating: string;
  analyzingWithAI: string;
  translationFailed: string;
  clearTranslationCache: string;
  clearCacheConfirm: string;
  clearCacheSuccess: string;
  clearCacheError: string;
  cancel: string;
  clear: string;
  error: string;
  
  // Voice Messages
  recordVoiceMessage: string;
  playVoiceMessage: string;
  pauseVoiceMessage: string;
  viewTranscription: string;
  hideTranscription: string;
  transcription: string;
  voiceTranscription: string;
  noTranscriptionAvailable: string;
  voiceMessagePreview: string;
  reRecord: string;
  sending: string;
  
  // Notifications
  newMessage: string;
  newGroupMessage: string;
  messageFrom: string;
  
  // Common
  loading: string;
  retry: string;
  next: string;
  save: string;
  delete: string;
  edit: string;
  success: string;
  updateSettingError: string;
  searchByEmail: string;
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
  enterFirstName: string;
  enterLastName: string;
  enterPhoneNumber: string;
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
  
  // Translation Modes
  translationMode: string;
  manualTranslate: string;
  autoTranslate: string;
  advancedTranslate: string;
  autoAdvancedTranslate: string;
  manualTranslateDescription: string;
  autoTranslateDescription: string;
  advancedTranslateDescription: string;
  autoAdvancedTranslateDescription: string;
  selectTranslationMode: string;
  
  // Translation Cache
  translationCache: string;
  translationCacheDescription: string;
  
  // Smart Suggestions
  useRAGContext: string;
  useRAGContextDescription: string;
  useRAGContextDescriptionEnabled: string;
  useRAGContextDescriptionDisabled: string;
  includeOtherLanguage: string;
  includeOtherLanguageDescription: string;
  includeOtherLanguageDescriptionEnabled: string;
  includeOtherLanguageDescriptionDisabled: string;
  backToKeyboard: string;
  
  // Chat List
  noChatsYet: string;
  startConversation: string;
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
  adding: 'Adding...',
  add: 'Add',
  failedToAddMembers: 'Failed to add members to group',
  typeAtLeast3Characters: 'Type at least 3 characters to search',
  searching: 'Searching...',
  noUsersFound: 'No users found',
  back: 'Back',
  description: 'Description',
  enterGroupName: 'Enter group name',
  enterGroupDescriptionOptional: 'Enter group description (optional)',
  searchAndAddMembers: 'Search and Add Members',
  selectedMembers: 'Selected Members',
  creating: 'Creating...',
  groupMembersWillBeNotified: 'Note: Group members will be notified when the group is created.',
  addGroupMembers: 'Add Group Members',
  pleaseEnterGroupName: 'Please enter a group name',
  mustBeLoggedInToCreateGroup: 'You must be logged in to create a group',
  groupCreatedSuccessfully: 'Group created successfully!',
  failedToCreateGroup: 'Failed to create group. Please try again.',
  searchUsers: 'Search Users',
  groupMembers: 'Group Members',
  admin: 'Admin',
  noMembersFound: 'No members found',
  loadingMembers: 'Loading members...',
  you: 'You',
  
  // Profile
  editProfile: 'Edit Profile',
  changePhoto: 'Change Photo',
  status: 'Status',
  about: 'About',
  settings: 'Settings',
  translationSettings: 'Translation Settings',
  languageSettings: 'Language Settings',
  personalInformation: 'Personal Information',
  dangerZone: 'Danger Zone',
  logOut: 'Log Out',
  testPushNotification: 'Test Push Notification',
  sendTestNotification: 'Send a test notification',
  english: 'English',
  emailCannotBeChanged: 'Email cannot be changed',
  phoneNumberWillBeVerified: 'Phone number will be verified later',
  editPicture: 'Edit Picture',
  uploading: 'Uploading...',
  saveChanges: 'Save Changes',
  saving: 'Saving...',
  
  // Translation
  translate: 'Translate',
  translating: 'Translating...',
  analyzingWithAI: 'Analyzing with AI',
  translationFailed: 'Translation failed',
  clearTranslationCache: 'Clear Translation Cache',
  clearCacheConfirm: 'This will clear all cached translations and cultural hints. You may need to re-translate some messages.',
  clearCacheSuccess: 'Translation cache cleared',
  clearCacheError: 'Failed to clear cache',
  cancel: 'Cancel',
  clear: 'Clear',
  error: 'Error',
  
  // Voice Messages
  recordVoiceMessage: 'Record Voice Message',
  playVoiceMessage: 'Play Voice Message',
  pauseVoiceMessage: 'Pause Voice Message',
  viewTranscription: 'View Transcription',
  hideTranscription: 'Hide Transcription',
  transcription: 'Transcription',
  voiceTranscription: 'Voice Transcription',
  noTranscriptionAvailable: 'No transcription available',
  voiceMessagePreview: 'Voice Message Preview',
  reRecord: 'Re-record',
  sending: 'Sending...',
  
  // Notifications
  newMessage: 'New Message',
  newGroupMessage: 'New Group Message',
  messageFrom: 'Message from',
  
  // Common
  loading: 'Loading...',
  retry: 'Retry',
  next: 'Next',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  success: 'Success',
  updateSettingError: 'Failed to update setting. Please try again.',
  searchByEmail: 'Search by email...',
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
  deletePicture: 'Delete Picture',
  deleteAccount: 'Delete Account',
  enterFirstName: 'Enter your first name',
  enterLastName: 'Enter your last name',
  enterPhoneNumber: 'Enter your phone number',
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
  
  // Translation Modes
  translationMode: 'Translation Mode',
  manualTranslate: 'Manual Translate',
  autoTranslate: 'Auto Translate',
  advancedTranslate: 'Advanced Translate',
  autoAdvancedTranslate: 'Auto-Advanced Translate',
  manualTranslateDescription: 'Click translate button to translate messages',
  autoTranslateDescription: 'Automatically translate messages when received',
  advancedTranslateDescription: 'Show cultural hints and AI analysis with translations',
  autoAdvancedTranslateDescription: 'Automatically translate with cultural hints and AI analysis',
  selectTranslationMode: 'Select Translation Mode',
  
  // Translation Cache
  translationCache: 'Translation Cache',
  translationCacheDescription: 'Store translations to speed up repeated text',
  
  // Smart Suggestions
  useRAGContext: 'Use RAG Context',
  useRAGContextDescription: 'Choose between historical context or recent messages',
  useRAGContextDescriptionEnabled: 'Uses historical conversation context (slower but smarter)',
  useRAGContextDescriptionDisabled: 'Uses recent messages only (faster but less context)',
  includeOtherLanguage: 'Include Other Language',
  includeOtherLanguageDescription: 'Show suggestions in multiple languages',
  includeOtherLanguageDescriptionEnabled: 'Shows suggestions in both your language and theirs',
  includeOtherLanguageDescriptionDisabled: 'Shows suggestions only in your language',
  backToKeyboard: 'Back to Keyboard',
  
  // Chat List
  noChatsYet: 'No chats yet',
  startConversation: 'Start a conversation!',
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
  adding: 'Agregando...',
  add: 'Agregar',
  failedToAddMembers: 'Error al agregar miembros al grupo',
  typeAtLeast3Characters: 'Escribe al menos 3 caracteres para buscar',
  searching: 'Buscando...',
  noUsersFound: 'No se encontraron usuarios',
  back: 'Atrás',
  description: 'Descripción',
  enterGroupName: 'Ingresa el nombre del grupo',
  enterGroupDescriptionOptional: 'Ingresa la descripción del grupo (opcional)',
  searchAndAddMembers: 'Buscar y Agregar Miembros',
  selectedMembers: 'Miembros Seleccionados',
  creating: 'Creando...',
  groupMembersWillBeNotified: 'Nota: Los miembros del grupo serán notificados cuando se cree el grupo.',
  addGroupMembers: 'Agregar Miembros del Grupo',
  pleaseEnterGroupName: 'Por favor ingresa un nombre para el grupo',
  mustBeLoggedInToCreateGroup: 'Debes estar conectado para crear un grupo',
  groupCreatedSuccessfully: '¡Grupo creado exitosamente!',
  failedToCreateGroup: 'Error al crear el grupo. Por favor intenta de nuevo.',
  searchUsers: 'Buscar Usuarios',
  groupMembers: 'Miembros del Grupo',
  admin: 'Administrador',
  noMembersFound: 'No se encontraron miembros',
  loadingMembers: 'Cargando miembros...',
  you: 'Tú',
  
  // Profile
  editProfile: 'Editar Perfil',
  changePhoto: 'Cambiar Foto',
  status: 'Estado',
  about: 'Acerca de',
  settings: 'Configuración',
  translationSettings: 'Configuración de Traducción',
  languageSettings: 'Configuración de Idioma',
  personalInformation: 'Información Personal',
  dangerZone: 'Zona de Peligro',
  logOut: 'Cerrar Sesión',
  testPushNotification: 'Probar Notificación Push',
  sendTestNotification: 'Enviar una notificación de prueba',
  english: 'Inglés',
  emailCannotBeChanged: 'El correo electrónico no se puede cambiar',
  phoneNumberWillBeVerified: 'El número de teléfono será verificado más tarde',
  editPicture: 'Editar Foto',
  uploading: 'Subiendo...',
  saveChanges: 'Guardar Cambios',
  saving: 'Guardando...',
  
  // Translation
  translate: 'Traducir',
  translating: 'Traduciendo...',
  analyzingWithAI: 'Analizando con IA',
  translationFailed: 'Error en la traducción',
  clearTranslationCache: 'Limpiar Caché de Traducción',
  clearCacheConfirm: 'Esto eliminará todas las traducciones y pistas culturales en caché. Es posible que necesites volver a traducir algunos mensajes.',
  clearCacheSuccess: 'Caché de traducción limpiado',
  clearCacheError: 'Error al limpiar caché',
  cancel: 'Cancelar',
  clear: 'Limpiar',
  error: 'Error',
  
  // Voice Messages
  recordVoiceMessage: 'Grabar Mensaje de Voz',
  playVoiceMessage: 'Reproducir Mensaje de Voz',
  pauseVoiceMessage: 'Pausar Mensaje de Voz',
  viewTranscription: 'Ver Transcripción',
  hideTranscription: 'Ocultar Transcripción',
  transcription: 'Transcripción',
  voiceTranscription: 'Transcripción de Voz',
  noTranscriptionAvailable: 'No hay transcripción disponible',
  voiceMessagePreview: 'Vista Previa del Mensaje de Voz',
  reRecord: 'Regrabar',
  sending: 'Enviando...',
  
  // Notifications
  newMessage: 'Nuevo Mensaje',
  newGroupMessage: 'Nuevo Mensaje de Grupo',
  messageFrom: 'Mensaje de',
  
  // Common
  loading: 'Cargando...',
  retry: 'Reintentar',
  next: 'Siguiente',
  save: 'Guardar',
  delete: 'Eliminar',
  edit: 'Editar',
  success: 'Éxito',
  updateSettingError: 'Error al actualizar la configuración. Por favor intenta de nuevo.',
  searchByEmail: 'Buscar por email...',
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
  deletePicture: 'Eliminar Foto',
  deleteAccount: 'Eliminar Cuenta',
  enterFirstName: 'Ingresa tu nombre',
  enterLastName: 'Ingresa tu apellido',
  enterPhoneNumber: 'Ingresa tu número de teléfono',
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
  
  // Translation Modes
  translationMode: 'Modo de Traducción',
  manualTranslate: 'Traducir Manualmente',
  autoTranslate: 'Traducir Automáticamente',
  advancedTranslate: 'Traducción Avanzada',
  autoAdvancedTranslate: 'Traducción Auto-Avanzada',
  manualTranslateDescription: 'Haz clic en el botón traducir para traducir mensajes',
  autoTranslateDescription: 'Traducir automáticamente los mensajes cuando se reciban',
  advancedTranslateDescription: 'Mostrar pistas culturales y análisis de IA con traducciones',
  autoAdvancedTranslateDescription: 'Traducir automáticamente con pistas culturales y análisis de IA',
  selectTranslationMode: 'Seleccionar Modo de Traducción',
  
  // Translation Cache
  translationCache: 'Caché de Traducción',
  translationCacheDescription: 'Almacenar traducciones para acelerar texto repetido',
  
  // Smart Suggestions
  useRAGContext: 'Usar Contexto RAG',
  useRAGContextDescription: 'Elegir entre contexto histórico o mensajes recientes',
  useRAGContextDescriptionEnabled: 'Usa contexto histórico de conversación (más lento pero más inteligente)',
  useRAGContextDescriptionDisabled: 'Usa solo mensajes recientes (más rápido pero menos contexto)',
  includeOtherLanguage: 'Incluir Otro Idioma',
  includeOtherLanguageDescription: 'Mostrar sugerencias en múltiples idiomas',
  includeOtherLanguageDescriptionEnabled: 'Muestra sugerencias en tu idioma y el de ellos',
  includeOtherLanguageDescriptionDisabled: 'Muestra sugerencias solo en tu idioma',
  backToKeyboard: 'Volver al Teclado',
  
  // Chat List
  noChatsYet: 'Aún no hay chats',
  startConversation: '¡Inicia una conversación!',
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
  adding: '添加中...',
  add: '添加',
  failedToAddMembers: '添加成员到群组失败',
  typeAtLeast3Characters: '至少输入3个字符进行搜索',
  searching: '搜索中...',
  noUsersFound: '未找到用户',
  back: '返回',
  description: '描述',
  enterGroupName: '输入群组名称',
  enterGroupDescriptionOptional: '输入群组描述（可选）',
  searchAndAddMembers: '搜索并添加成员',
  selectedMembers: '已选成员',
  creating: '创建中...',
  groupMembersWillBeNotified: '注意：群组创建时成员将收到通知。',
  addGroupMembers: '添加群组成员',
  pleaseEnterGroupName: '请输入群组名称',
  mustBeLoggedInToCreateGroup: '您必须登录才能创建群组',
  groupCreatedSuccessfully: '群组创建成功！',
  failedToCreateGroup: '创建群组失败，请重试。',
  searchUsers: '搜索用户',
  groupMembers: '群组成员',
  admin: '管理员',
  noMembersFound: '未找到成员',
  loadingMembers: '正在加载成员...',
  you: '你',
  
  // Profile
  editProfile: '编辑个人资料',
  changePhoto: '更换头像',
  status: '状态',
  about: '关于',
  settings: '设置',
  translationSettings: '翻译设置',
  languageSettings: '语言设置',
  personalInformation: '个人信息',
  dangerZone: '危险区域',
  logOut: '退出登录',
  testPushNotification: '测试推送通知',
  sendTestNotification: '发送测试通知',
  english: '英语',
  emailCannotBeChanged: '邮箱无法更改',
  phoneNumberWillBeVerified: '电话号码将在稍后验证',
  editPicture: '编辑照片',
  uploading: '上传中...',
  saveChanges: '保存更改',
  saving: '保存中...',
  
  // Translation
  translate: '翻译',
  translating: '翻译中...',
  analyzingWithAI: 'AI分析中',
  translationFailed: '翻译失败',
  clearTranslationCache: '清除翻译缓存',
  clearCacheConfirm: '这将清除所有缓存的翻译和文化提示。您可能需要重新翻译一些消息。',
  clearCacheSuccess: '翻译缓存已清除',
  clearCacheError: '清除缓存失败',
  cancel: '取消',
  clear: '清除',
  error: '错误',
  
  // Voice Messages
  recordVoiceMessage: '录制语音消息',
  playVoiceMessage: '播放语音消息',
  pauseVoiceMessage: '暂停语音消息',
  viewTranscription: '查看转录',
  hideTranscription: '隐藏转录',
  transcription: '转录',
  voiceTranscription: '语音转录',
  noTranscriptionAvailable: '无转录可用',
  voiceMessagePreview: '语音消息预览',
  reRecord: '重新录制',
  sending: '发送中...',
  
  // Notifications
  newMessage: '新消息',
  newGroupMessage: '新群组消息',
  messageFrom: '来自',
  
  // Common
  loading: '加载中...',
  retry: '重试',
  next: '下一步',
  save: '保存',
  delete: '删除',
  edit: '编辑',
  success: '成功',
  updateSettingError: '更新设置失败，请重试。',
  searchByEmail: '按邮箱搜索...',
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
  deletePicture: '删除照片',
  deleteAccount: '删除账户',
  enterFirstName: '输入您的名字',
  enterLastName: '输入您的姓氏',
  enterPhoneNumber: '输入您的电话号码',
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
  
  // Translation Modes
  translationMode: '翻译模式',
  manualTranslate: '手动翻译',
  autoTranslate: '自动翻译',
  advancedTranslate: '高级翻译',
  autoAdvancedTranslate: '自动高级翻译',
  manualTranslateDescription: '点击翻译按钮来翻译消息',
  autoTranslateDescription: '收到消息时自动翻译',
  advancedTranslateDescription: '显示文化提示和AI分析与翻译',
  autoAdvancedTranslateDescription: '自动翻译并显示文化提示和AI分析',
  selectTranslationMode: '选择翻译模式',
  
  // Translation Cache
  translationCache: '翻译缓存',
  translationCacheDescription: '存储翻译以加速重复文本',
  
  // Smart Suggestions
  useRAGContext: '使用RAG上下文',
  useRAGContextDescription: '选择历史上下文或最近消息',
  useRAGContextDescriptionEnabled: '使用历史对话上下文（较慢但更智能）',
  useRAGContextDescriptionDisabled: '仅使用最近消息（更快但上下文较少）',
  includeOtherLanguage: '包含其他语言',
  includeOtherLanguageDescription: '以多种语言显示建议',
  includeOtherLanguageDescriptionEnabled: '显示您和他们的语言建议',
  includeOtherLanguageDescriptionDisabled: '仅显示您语言的建议',
  backToKeyboard: '返回键盘',
  
  // Chat List
  noChatsYet: '暂无聊天',
  startConversation: '开始对话！',
};

// French
const fr: LocalizationStrings = {
  // Navigation
  messages: 'Messages',
  profile: 'Profil',
  
  // Authentication
  signIn: 'Se connecter',
  signUp: 'S\'inscrire',
  signOut: 'Se déconnecter',
  email: 'E-mail',
  password: 'Mot de passe',
  confirmPassword: 'Confirmer le mot de passe',
  firstName: 'Prénom',
  lastName: 'Nom de famille',
  phoneNumber: 'Numéro de téléphone',
  
  // Chat
  sendMessage: 'Envoyer un message',
  typeMessage: 'Tapez un message...',
  online: 'En ligne',
  offline: 'Hors ligne',
  lastSeen: 'Dernière connexion',
  typing: 'en train de taper...',
  read: 'Lu',
  delivered: 'Livré',
  sent: 'Envoyé',
  
  // Groups
  createGroup: 'Créer un groupe',
  addMembers: 'Ajouter des membres',
  groupName: 'Nom du groupe',
  groupDescription: 'Description du groupe',
  members: 'Membres',
  leaveGroup: 'Quitter le groupe',
  deleteGroup: 'Supprimer le groupe',
  adding: 'Ajout en cours...',
  add: 'Ajouter',
  failedToAddMembers: 'Échec de l\'ajout de membres au groupe',
  typeAtLeast3Characters: 'Tapez au moins 3 caractères pour rechercher',
  searching: 'Recherche en cours...',
  noUsersFound: 'Aucun utilisateur trouvé',
  back: 'Retour',
  description: 'Description',
  enterGroupName: 'Entrez le nom du groupe',
  enterGroupDescriptionOptional: 'Entrez la description du groupe (optionnel)',
  searchAndAddMembers: 'Rechercher et ajouter des membres',
  selectedMembers: 'Membres sélectionnés',
  creating: 'Création en cours...',
  groupMembersWillBeNotified: 'Note : Les membres du groupe seront notifiés lors de la création du groupe.',
  addGroupMembers: 'Ajouter des membres du groupe',
  pleaseEnterGroupName: 'Veuillez entrer un nom de groupe',
  mustBeLoggedInToCreateGroup: 'Vous devez être connecté pour créer un groupe',
  groupCreatedSuccessfully: 'Groupe créé avec succès !',
  failedToCreateGroup: 'Échec de la création du groupe. Veuillez réessayer.',
  searchUsers: 'Rechercher des utilisateurs',
  groupMembers: 'Membres du groupe',
  admin: 'Administrateur',
  noMembersFound: 'Aucun membre trouvé',
  loadingMembers: 'Chargement des membres...',
  you: 'Vous',
  
  // Profile
  editProfile: 'Modifier le profil',
  changePhoto: 'Changer la photo',
  status: 'Statut',
  about: 'À propos',
  settings: 'Paramètres',
  translationSettings: 'Paramètres de traduction',
  languageSettings: 'Paramètres de langue',
  personalInformation: 'Informations personnelles',
  dangerZone: 'Zone de danger',
  logOut: 'Se déconnecter',
  testPushNotification: 'Tester la notification push',
  sendTestNotification: 'Envoyer une notification de test',
  english: 'Anglais',
  emailCannotBeChanged: 'L\'e-mail ne peut pas être modifié',
  phoneNumberWillBeVerified: 'Le numéro de téléphone sera vérifié plus tard',
  editPicture: 'Modifier la photo',
  uploading: 'Téléchargement en cours...',
  saveChanges: 'Enregistrer les modifications',
  saving: 'Enregistrement en cours...',
  
  // Translation
  translate: 'Traduire',
  translating: 'Traduction en cours...',
  analyzingWithAI: 'Analyse avec IA',
  translationFailed: 'Échec de la traduction',
  clearTranslationCache: 'Vider le cache de traduction',
  clearCacheConfirm: 'Cela supprimera toutes les traductions et indices culturels mis en cache. Vous devrez peut-être retraduire certains messages.',
  clearCacheSuccess: 'Cache de traduction vidé',
  clearCacheError: 'Échec du vidage du cache',
  cancel: 'Annuler',
  clear: 'Vider',
  error: 'Erreur',
  
  // Voice Messages
  recordVoiceMessage: 'Enregistrer un message vocal',
  playVoiceMessage: 'Lire le message vocal',
  pauseVoiceMessage: 'Pause du message vocal',
  viewTranscription: 'Voir la transcription',
  hideTranscription: 'Masquer la transcription',
  transcription: 'Transcription',
  voiceTranscription: 'Transcription vocale',
  noTranscriptionAvailable: 'Aucune transcription disponible',
  voiceMessagePreview: 'Aperçu du message vocal',
  reRecord: 'Réenregistrer',
  sending: 'Envoi en cours...',
  
  // Notifications
  newMessage: 'Nouveau message',
  newGroupMessage: 'Nouveau message de groupe',
  messageFrom: 'Message de',
  
  // Common
  loading: 'Chargement en cours...',
  retry: 'Réessayer',
  next: 'Suivant',
  save: 'Enregistrer',
  delete: 'Supprimer',
  edit: 'Modifier',
  success: 'Succès',
  updateSettingError: 'Échec de la mise à jour du paramètre. Veuillez réessayer.',
  searchByEmail: 'Rechercher par e-mail...',
  close: 'Fermer',
  yes: 'Oui',
  no: 'Non',
  ok: 'OK',
  
  // Additional UI strings
  unknownUser: 'Utilisateur inconnu',
  addMessage: 'Ajouter un message...',
  groupChat: 'Chat de groupe',
  send: 'Envoyer',
  failedToSendMessage: 'Échec de l\'envoi du message',
  failedToSendVoiceMessage: 'Échec de l\'envoi du message vocal',
  failedToAddReaction: 'Échec de l\'ajout de réaction',
  noMessagesYet: 'Aucun message pour le moment',
  deletePicture: 'Supprimer la photo',
  deleteAccount: 'Supprimer le compte',
  enterFirstName: 'Entrez votre prénom',
  enterLastName: 'Entrez votre nom de famille',
  enterPhoneNumber: 'Entrez votre numéro de téléphone',
  welcomeBack: 'Bon retour !',
  signInToAccount: 'Connectez-vous à votre compte',
  signingIn: 'Connexion en cours...',
  signInWithGoogle: 'Se connecter avec Google',
  dontHaveAccount: 'Vous n\'avez pas de compte ? Inscrivez-vous',
  createAccount: 'Créer un compte',
  signUpForAccount: 'Inscrivez-vous pour un nouveau compte',
  creatingAccount: 'Création du compte en cours...',
  signUpWithGoogle: 'S\'inscrire avec Google',
  alreadyHaveAccount: 'Vous avez déjà un compte ? Connectez-vous',
  connectWithWorld: 'Connectez-vous avec le monde',
  loadingProfile: 'Chargement du profil...',
  userNotFound: 'Utilisateur non trouvé',
  goBack: 'Retour',
  deletedUser: 'Utilisateur supprimé',
  userDeletedAccount: 'Cet utilisateur a supprimé son compte',
  // Language settings
  translationLanguage: 'Langue de traduction',
  messagesWillBeTranslatedTo: 'Les messages seront traduits en :',
  culturalHints: 'Indices culturels',
  showCulturalContext: 'Afficher le contexte culturel pour l\'argot, les idiomes et les références culturelles',
  removeCachedTranslations: 'Supprimer les traductions mises en cache pour libérer de l\'espace de stockage',
  selectLanguage: 'Sélectionner la langue',
  // Smart Suggestions
  smartSuggestions: 'Suggestions intelligentes',
  generatingSuggestions: 'Génération de suggestions...',
  // Translation Display
  aiAnalysis: 'Analyse IA',
  intent: 'Intention',
  tone: 'Ton',
  topic: 'Sujet',
  entities: 'Entités',
  literal: 'Littéral',
  
  // Translation Modes
  translationMode: 'Mode de traduction',
  manualTranslate: 'Traduction manuelle',
  autoTranslate: 'Traduction automatique',
  advancedTranslate: 'Traduction avancée',
  autoAdvancedTranslate: 'Traduction automatique avancée',
  manualTranslateDescription: 'Cliquez sur le bouton traduire pour traduire les messages',
  autoTranslateDescription: 'Traduire automatiquement les messages lors de la réception',
  advancedTranslateDescription: 'Afficher les indices culturels et l\'analyse IA avec les traductions',
  autoAdvancedTranslateDescription: 'Traduire automatiquement avec les indices culturels et l\'analyse IA',
  selectTranslationMode: 'Sélectionner le mode de traduction',
  
  // Translation Cache
  translationCache: 'Cache de traduction',
  translationCacheDescription: 'Stocker les traductions pour accélérer le texte répétitif',
  
  // Smart Suggestions
  useRAGContext: 'Utiliser le contexte RAG',
  useRAGContextDescription: 'Choisir entre le contexte historique ou les messages récents',
  useRAGContextDescriptionEnabled: 'Utilise le contexte historique de conversation (plus lent mais plus intelligent)',
  useRAGContextDescriptionDisabled: 'Utilise uniquement les messages récents (plus rapide mais moins de contexte)',
  includeOtherLanguage: 'Inclure une autre langue',
  includeOtherLanguageDescription: 'Afficher les suggestions en plusieurs langues',
  includeOtherLanguageDescriptionEnabled: 'Affiche les suggestions dans votre langue et la leur',
  includeOtherLanguageDescriptionDisabled: 'Affiche les suggestions uniquement dans votre langue',
  backToKeyboard: 'Retour au clavier',
  
  // Chat List
  noChatsYet: 'Aucun chat pour le moment',
  startConversation: 'Commencez une conversation !',
};

// German
const de: LocalizationStrings = {
  // Navigation
  messages: 'Nachrichten',
  profile: 'Profil',
  
  // Authentication
  signIn: 'Anmelden',
  signUp: 'Registrieren',
  signOut: 'Abmelden',
  email: 'E-Mail',
  password: 'Passwort',
  confirmPassword: 'Passwort bestätigen',
  firstName: 'Vorname',
  lastName: 'Nachname',
  phoneNumber: 'Telefonnummer',
  
  // Chat
  sendMessage: 'Nachricht senden',
  typeMessage: 'Nachricht eingeben...',
  online: 'Online',
  offline: 'Offline',
  lastSeen: 'Zuletzt gesehen',
  typing: 'tippt...',
  read: 'Gelesen',
  delivered: 'Zugestellt',
  sent: 'Gesendet',
  
  // Groups
  createGroup: 'Gruppe erstellen',
  addMembers: 'Mitglieder hinzufügen',
  groupName: 'Gruppenname',
  groupDescription: 'Gruppenbeschreibung',
  members: 'Mitglieder',
  leaveGroup: 'Gruppe verlassen',
  deleteGroup: 'Gruppe löschen',
  adding: 'Hinzufügen...',
  add: 'Hinzufügen',
  failedToAddMembers: 'Fehler beim Hinzufügen von Mitgliedern zur Gruppe',
  typeAtLeast3Characters: 'Mindestens 3 Zeichen eingeben zum Suchen',
  searching: 'Suchen...',
  noUsersFound: 'Keine Benutzer gefunden',
  back: 'Zurück',
  description: 'Beschreibung',
  enterGroupName: 'Gruppenname eingeben',
  enterGroupDescriptionOptional: 'Gruppenbeschreibung eingeben (optional)',
  searchAndAddMembers: 'Suchen und Mitglieder hinzufügen',
  selectedMembers: 'Ausgewählte Mitglieder',
  creating: 'Erstellen...',
  groupMembersWillBeNotified: 'Hinweis: Gruppenmitglieder werden benachrichtigt, wenn die Gruppe erstellt wird.',
  addGroupMembers: 'Gruppenmitglieder hinzufügen',
  pleaseEnterGroupName: 'Bitte geben Sie einen Gruppennamen ein',
  mustBeLoggedInToCreateGroup: 'Sie müssen angemeldet sein, um eine Gruppe zu erstellen',
  groupCreatedSuccessfully: 'Gruppe erfolgreich erstellt!',
  failedToCreateGroup: 'Fehler beim Erstellen der Gruppe. Bitte versuchen Sie es erneut.',
  searchUsers: 'Benutzer suchen',
  groupMembers: 'Gruppenmitglieder',
  admin: 'Administrator',
  noMembersFound: 'Keine Mitglieder gefunden',
  loadingMembers: 'Mitglieder laden...',
  you: 'Sie',
  
  // Profile
  editProfile: 'Profil bearbeiten',
  changePhoto: 'Foto ändern',
  status: 'Status',
  about: 'Über',
  settings: 'Einstellungen',
  translationSettings: 'Übersetzungseinstellungen',
  languageSettings: 'Spracheinstellungen',
  personalInformation: 'Persönliche Informationen',
  dangerZone: 'Gefahrenbereich',
  logOut: 'Abmelden',
  testPushNotification: 'Push-Benachrichtigung testen',
  sendTestNotification: 'Testbenachrichtigung senden',
  english: 'Englisch',
  emailCannotBeChanged: 'E-Mail kann nicht geändert werden',
  phoneNumberWillBeVerified: 'Telefonnummer wird später verifiziert',
  editPicture: 'Foto bearbeiten',
  uploading: 'Hochladen...',
  saveChanges: 'Änderungen speichern',
  saving: 'Speichern...',
  
  // Translation
  translate: 'Übersetzen',
  translating: 'Übersetzen...',
  analyzingWithAI: 'Mit KI analysieren',
  translationFailed: 'Übersetzung fehlgeschlagen',
  clearTranslationCache: 'Übersetzungscache löschen',
  clearCacheConfirm: 'Dies löscht alle gecachten Übersetzungen und kulturellen Hinweise. Sie müssen möglicherweise einige Nachrichten neu übersetzen.',
  clearCacheSuccess: 'Übersetzungscache gelöscht',
  clearCacheError: 'Fehler beim Löschen des Caches',
  cancel: 'Abbrechen',
  clear: 'Löschen',
  error: 'Fehler',
  
  // Voice Messages
  recordVoiceMessage: 'Sprachnachricht aufnehmen',
  playVoiceMessage: 'Sprachnachricht abspielen',
  pauseVoiceMessage: 'Sprachnachricht pausieren',
  viewTranscription: 'Transkription anzeigen',
  hideTranscription: 'Transkription ausblenden',
  transcription: 'Transkription',
  voiceTranscription: 'Sprachtranskription',
  noTranscriptionAvailable: 'Keine Transkription verfügbar',
  voiceMessagePreview: 'Sprachnachricht-Vorschau',
  reRecord: 'Neu aufnehmen',
  sending: 'Senden...',
  
  // Notifications
  newMessage: 'Neue Nachricht',
  newGroupMessage: 'Neue Gruppennachricht',
  messageFrom: 'Nachricht von',
  
  // Common
  loading: 'Laden...',
  retry: 'Wiederholen',
  next: 'Weiter',
  save: 'Speichern',
  delete: 'Löschen',
  edit: 'Bearbeiten',
  success: 'Erfolg',
  updateSettingError: 'Fehler beim Aktualisieren der Einstellung. Bitte versuchen Sie es erneut.',
  searchByEmail: 'Nach E-Mail suchen...',
  close: 'Schließen',
  yes: 'Ja',
  no: 'Nein',
  ok: 'OK',
  
  // Additional UI strings
  unknownUser: 'Unbekannter Benutzer',
  addMessage: 'Nachricht hinzufügen...',
  groupChat: 'Gruppenchat',
  send: 'Senden',
  failedToSendMessage: 'Fehler beim Senden der Nachricht',
  failedToSendVoiceMessage: 'Fehler beim Senden der Sprachnachricht',
  failedToAddReaction: 'Fehler beim Hinzufügen der Reaktion',
  noMessagesYet: 'Noch keine Nachrichten',
  deletePicture: 'Foto löschen',
  deleteAccount: 'Konto löschen',
  enterFirstName: 'Geben Sie Ihren Vornamen ein',
  enterLastName: 'Geben Sie Ihren Nachnamen ein',
  enterPhoneNumber: 'Geben Sie Ihre Telefonnummer ein',
  welcomeBack: 'Willkommen zurück!',
  signInToAccount: 'Melden Sie sich in Ihrem Konto an',
  signingIn: 'Anmelden...',
  signInWithGoogle: 'Mit Google anmelden',
  dontHaveAccount: 'Haben Sie kein Konto? Registrieren',
  createAccount: 'Konto erstellen',
  signUpForAccount: 'Registrieren Sie sich für ein neues Konto',
  creatingAccount: 'Konto wird erstellt...',
  signUpWithGoogle: 'Mit Google registrieren',
  alreadyHaveAccount: 'Haben Sie bereits ein Konto? Anmelden',
  connectWithWorld: 'Mit der Welt verbinden',
  loadingProfile: 'Profil laden...',
  userNotFound: 'Benutzer nicht gefunden',
  goBack: 'Zurück',
  deletedUser: 'Gelöschter Benutzer',
  userDeletedAccount: 'Dieser Benutzer hat sein Konto gelöscht',
  // Language settings
  translationLanguage: 'Übersetzungssprache',
  messagesWillBeTranslatedTo: 'Nachrichten werden übersetzt in:',
  culturalHints: 'Kulturelle Hinweise',
  showCulturalContext: 'Kulturellen Kontext für Slang, Redewendungen und kulturelle Referenzen anzeigen',
  removeCachedTranslations: 'Gecachte Übersetzungen entfernen, um Speicherplatz freizugeben',
  selectLanguage: 'Sprache auswählen',
  // Smart Suggestions
  smartSuggestions: 'Intelligente Vorschläge',
  generatingSuggestions: 'Vorschläge generieren...',
  // Translation Display
  aiAnalysis: 'KI-Analyse',
  intent: 'Absicht',
  tone: 'Ton',
  topic: 'Thema',
  entities: 'Entitäten',
  literal: 'Wörtlich',
  
  // Translation Modes
  translationMode: 'Übersetzungsmodus',
  manualTranslate: 'Manuelle Übersetzung',
  autoTranslate: 'Automatische Übersetzung',
  advancedTranslate: 'Erweiterte Übersetzung',
  autoAdvancedTranslate: 'Automatische erweiterte Übersetzung',
  manualTranslateDescription: 'Klicken Sie auf die Übersetzen-Schaltfläche, um Nachrichten zu übersetzen',
  autoTranslateDescription: 'Nachrichten automatisch übersetzen, wenn sie empfangen werden',
  advancedTranslateDescription: 'Kulturelle Hinweise und KI-Analyse mit Übersetzungen anzeigen',
  autoAdvancedTranslateDescription: 'Automatisch mit kulturellen Hinweisen und KI-Analyse übersetzen',
  selectTranslationMode: 'Übersetzungsmodus auswählen',
  
  // Translation Cache
  translationCache: 'Übersetzungscache',
  translationCacheDescription: 'Übersetzungen speichern, um wiederholten Text zu beschleunigen',
  
  // Smart Suggestions
  useRAGContext: 'RAG-Kontext verwenden',
  useRAGContextDescription: 'Wählen Sie zwischen historischem Kontext oder aktuellen Nachrichten',
  useRAGContextDescriptionEnabled: 'Verwendet historischen Gesprächskontext (langsamer aber intelligenter)',
  useRAGContextDescriptionDisabled: 'Verwendet nur aktuelle Nachrichten (schneller aber weniger Kontext)',
  includeOtherLanguage: 'Andere Sprache einbeziehen',
  includeOtherLanguageDescription: 'Vorschläge in mehreren Sprachen anzeigen',
  includeOtherLanguageDescriptionEnabled: 'Zeigt Vorschläge in Ihrer Sprache und ihrer',
  includeOtherLanguageDescriptionDisabled: 'Zeigt Vorschläge nur in Ihrer Sprache',
  backToKeyboard: 'Zurück zur Tastatur',
  
  // Chat List
  noChatsYet: 'Noch keine Chats',
  startConversation: 'Starten Sie ein Gespräch!',
};

// Japanese
const ja: LocalizationStrings = {
  // Navigation
  messages: 'メッセージ',
  profile: 'プロフィール',
  
  // Authentication
  signIn: 'サインイン',
  signUp: 'サインアップ',
  signOut: 'サインアウト',
  email: 'メール',
  password: 'パスワード',
  confirmPassword: 'パスワード確認',
  firstName: '名',
  lastName: '姓',
  phoneNumber: '電話番号',
  
  // Chat
  sendMessage: 'メッセージを送信',
  typeMessage: 'メッセージを入力...',
  online: 'オンライン',
  offline: 'オフライン',
  lastSeen: '最終ログイン',
  typing: '入力中...',
  read: '既読',
  delivered: '配信済み',
  sent: '送信済み',
  
  // Groups
  createGroup: 'グループを作成',
  addMembers: 'メンバーを追加',
  groupName: 'グループ名',
  groupDescription: 'グループの説明',
  members: 'メンバー',
  leaveGroup: 'グループを退出',
  deleteGroup: 'グループを削除',
  adding: '追加中...',
  add: '追加',
  failedToAddMembers: 'グループへのメンバー追加に失敗しました',
  typeAtLeast3Characters: '検索するには少なくとも3文字入力してください',
  searching: '検索中...',
  noUsersFound: 'ユーザーが見つかりません',
  back: '戻る',
  description: '説明',
  enterGroupName: 'グループ名を入力',
  enterGroupDescriptionOptional: 'グループの説明を入力（任意）',
  searchAndAddMembers: '検索してメンバーを追加',
  selectedMembers: '選択されたメンバー',
  creating: '作成中...',
  groupMembersWillBeNotified: '注意：グループが作成されると、グループメンバーに通知されます。',
  addGroupMembers: 'グループメンバーを追加',
  pleaseEnterGroupName: 'グループ名を入力してください',
  mustBeLoggedInToCreateGroup: 'グループを作成するにはログインする必要があります',
  groupCreatedSuccessfully: 'グループが正常に作成されました！',
  failedToCreateGroup: 'グループの作成に失敗しました。再試行してください。',
  searchUsers: 'ユーザーを検索',
  groupMembers: 'グループメンバー',
  admin: '管理者',
  noMembersFound: 'メンバーが見つかりません',
  loadingMembers: 'メンバーを読み込み中...',
  you: 'あなた',
  
  // Profile
  editProfile: 'プロフィールを編集',
  changePhoto: '写真を変更',
  status: 'ステータス',
  about: 'について',
  settings: '設定',
  translationSettings: '翻訳設定',
  languageSettings: '言語設定',
  personalInformation: '個人情報',
  dangerZone: '危険ゾーン',
  logOut: 'ログアウト',
  testPushNotification: 'プッシュ通知をテスト',
  sendTestNotification: 'テスト通知を送信',
  english: '英語',
  emailCannotBeChanged: 'メールアドレスは変更できません',
  phoneNumberWillBeVerified: '電話番号は後で確認されます',
  editPicture: '写真を編集',
  uploading: 'アップロード中...',
  saveChanges: '変更を保存',
  saving: '保存中...',
  
  // Translation
  translate: '翻訳',
  translating: '翻訳中...',
  analyzingWithAI: 'AIで分析中',
  translationFailed: '翻訳に失敗しました',
  clearTranslationCache: '翻訳キャッシュをクリア',
  clearCacheConfirm: 'これにより、キャッシュされたすべての翻訳と文化的ヒントが削除されます。一部のメッセージを再翻訳する必要がある場合があります。',
  clearCacheSuccess: '翻訳キャッシュがクリアされました',
  clearCacheError: 'キャッシュのクリアに失敗しました',
  cancel: 'キャンセル',
  clear: 'クリア',
  error: 'エラー',
  
  // Voice Messages
  recordVoiceMessage: '音声メッセージを録音',
  playVoiceMessage: '音声メッセージを再生',
  pauseVoiceMessage: '音声メッセージを一時停止',
  viewTranscription: '転写を表示',
  hideTranscription: '転写を非表示',
  transcription: '転写',
  voiceTranscription: '音声転写',
  noTranscriptionAvailable: '転写が利用できません',
  voiceMessagePreview: '音声メッセージプレビュー',
  reRecord: '再録音',
  sending: '送信中...',
  
  // Notifications
  newMessage: '新しいメッセージ',
  newGroupMessage: '新しいグループメッセージ',
  messageFrom: 'からのメッセージ',
  
  // Common
  loading: '読み込み中...',
  retry: '再試行',
  next: '次へ',
  save: '保存',
  delete: '削除',
  edit: '編集',
  success: '成功',
  updateSettingError: '設定の更新に失敗しました。再試行してください。',
  searchByEmail: 'メールで検索...',
  close: '閉じる',
  yes: 'はい',
  no: 'いいえ',
  ok: 'OK',
  
  // Additional UI strings
  unknownUser: '不明なユーザー',
  addMessage: 'メッセージを追加...',
  groupChat: 'グループチャット',
  send: '送信',
  failedToSendMessage: 'メッセージの送信に失敗しました',
  failedToSendVoiceMessage: '音声メッセージの送信に失敗しました',
  failedToAddReaction: 'リアクションの追加に失敗しました',
  noMessagesYet: 'まだメッセージがありません',
  deletePicture: '写真を削除',
  deleteAccount: 'アカウントを削除',
  enterFirstName: '名を入力してください',
  enterLastName: '姓を入力してください',
  enterPhoneNumber: '電話番号を入力してください',
  welcomeBack: 'おかえりなさい！',
  signInToAccount: 'アカウントにサインイン',
  signingIn: 'サインイン中...',
  signInWithGoogle: 'Googleでサインイン',
  dontHaveAccount: 'アカウントをお持ちでない場合は、サインアップ',
  createAccount: 'アカウントを作成',
  signUpForAccount: '新しいアカウントにサインアップ',
  creatingAccount: 'アカウント作成中...',
  signUpWithGoogle: 'Googleでサインアップ',
  alreadyHaveAccount: 'すでにアカウントをお持ちの場合は、サインイン',
  connectWithWorld: '世界とつながる',
  loadingProfile: 'プロフィールを読み込み中...',
  userNotFound: 'ユーザーが見つかりません',
  goBack: '戻る',
  deletedUser: '削除されたユーザー',
  userDeletedAccount: 'このユーザーはアカウントを削除しました',
  // Language settings
  translationLanguage: '翻訳言語',
  messagesWillBeTranslatedTo: 'メッセージは以下に翻訳されます：',
  culturalHints: '文化的ヒント',
  showCulturalContext: 'スラング、イディオム、文化的参照の文化的文脈を表示',
  removeCachedTranslations: 'ストレージスペースを解放するためにキャッシュされた翻訳を削除',
  selectLanguage: '言語を選択',
  // Smart Suggestions
  smartSuggestions: 'スマート提案',
  generatingSuggestions: '提案を生成中...',
  // Translation Display
  aiAnalysis: 'AI分析',
  intent: '意図',
  tone: 'トーン',
  topic: 'トピック',
  entities: 'エンティティ',
  literal: '文字通り',
  
  // Translation Modes
  translationMode: '翻訳モード',
  manualTranslate: '手動翻訳',
  autoTranslate: '自動翻訳',
  advancedTranslate: '高度な翻訳',
  autoAdvancedTranslate: '自動高度な翻訳',
  manualTranslateDescription: '翻訳ボタンをクリックしてメッセージを翻訳',
  autoTranslateDescription: 'メッセージを受信時に自動翻訳',
  advancedTranslateDescription: '翻訳とともに文化的ヒントとAI分析を表示',
  autoAdvancedTranslateDescription: '文化的ヒントとAI分析で自動翻訳',
  selectTranslationMode: '翻訳モードを選択',
  
  // Translation Cache
  translationCache: '翻訳キャッシュ',
  translationCacheDescription: '繰り返しテキストを高速化するために翻訳を保存',
  
  // Smart Suggestions
  useRAGContext: 'RAGコンテキストを使用',
  useRAGContextDescription: '履歴コンテキストまたは最近のメッセージを選択',
  useRAGContextDescriptionEnabled: '履歴会話コンテキストを使用（遅いがよりスマート）',
  useRAGContextDescriptionDisabled: '最近のメッセージのみを使用（速いがコンテキストが少ない）',
  includeOtherLanguage: '他の言語を含める',
  includeOtherLanguageDescription: '複数の言語で提案を表示',
  includeOtherLanguageDescriptionEnabled: 'あなたの言語と相手の言語で提案を表示',
  includeOtherLanguageDescriptionDisabled: 'あなたの言語のみで提案を表示',
  backToKeyboard: 'キーボードに戻る',
  
  // Chat List
  noChatsYet: 'まだチャットがありません',
  startConversation: '会話を始めましょう！',
};

// Korean
const ko: LocalizationStrings = {
  // Navigation
  messages: '메시지',
  profile: '프로필',
  
  // Authentication
  signIn: '로그인',
  signUp: '회원가입',
  signOut: '로그아웃',
  email: '이메일',
  password: '비밀번호',
  confirmPassword: '비밀번호 확인',
  firstName: '이름',
  lastName: '성',
  phoneNumber: '전화번호',
  
  // Chat
  sendMessage: '메시지 보내기',
  typeMessage: '메시지 입력...',
  online: '온라인',
  offline: '오프라인',
  lastSeen: '마지막 접속',
  typing: '입력 중...',
  read: '읽음',
  delivered: '전달됨',
  sent: '전송됨',
  
  // Groups
  createGroup: '그룹 만들기',
  addMembers: '멤버 추가',
  groupName: '그룹 이름',
  groupDescription: '그룹 설명',
  members: '멤버',
  leaveGroup: '그룹 나가기',
  deleteGroup: '그룹 삭제',
  adding: '추가 중...',
  add: '추가',
  failedToAddMembers: '그룹에 멤버 추가 실패',
  typeAtLeast3Characters: '검색하려면 최소 3자 이상 입력하세요',
  searching: '검색 중...',
  noUsersFound: '사용자를 찾을 수 없습니다',
  back: '뒤로',
  description: '설명',
  enterGroupName: '그룹 이름 입력',
  enterGroupDescriptionOptional: '그룹 설명 입력 (선택사항)',
  searchAndAddMembers: '검색하여 멤버 추가',
  selectedMembers: '선택된 멤버',
  creating: '만들기 중...',
  groupMembersWillBeNotified: '참고: 그룹이 생성되면 그룹 멤버들에게 알림이 전송됩니다.',
  addGroupMembers: '그룹 멤버 추가',
  pleaseEnterGroupName: '그룹 이름을 입력해주세요',
  mustBeLoggedInToCreateGroup: '그룹을 만들려면 로그인해야 합니다',
  groupCreatedSuccessfully: '그룹이 성공적으로 생성되었습니다!',
  failedToCreateGroup: '그룹 생성에 실패했습니다. 다시 시도해주세요.',
  searchUsers: '사용자 검색',
  groupMembers: '그룹 멤버',
  admin: '관리자',
  noMembersFound: '멤버를 찾을 수 없습니다',
  loadingMembers: '멤버 로딩 중...',
  you: '당신',
  
  // Profile
  editProfile: '프로필 편집',
  changePhoto: '사진 변경',
  status: '상태',
  about: '소개',
  settings: '설정',
  translationSettings: '번역 설정',
  languageSettings: '언어 설정',
  personalInformation: '개인 정보',
  dangerZone: '위험 구역',
  logOut: '로그아웃',
  testPushNotification: '푸시 알림 테스트',
  sendTestNotification: '테스트 알림 보내기',
  english: '영어',
  emailCannotBeChanged: '이메일은 변경할 수 없습니다',
  phoneNumberWillBeVerified: '전화번호는 나중에 확인됩니다',
  editPicture: '사진 편집',
  uploading: '업로드 중...',
  saveChanges: '변경사항 저장',
  saving: '저장 중...',
  
  // Translation
  translate: '번역',
  translating: '번역 중...',
  analyzingWithAI: 'AI로 분석 중',
  translationFailed: '번역 실패',
  clearTranslationCache: '번역 캐시 지우기',
  clearCacheConfirm: '이렇게 하면 캐시된 모든 번역과 문화적 힌트가 삭제됩니다. 일부 메시지를 다시 번역해야 할 수 있습니다.',
  clearCacheSuccess: '번역 캐시가 지워졌습니다',
  clearCacheError: '캐시 지우기 실패',
  cancel: '취소',
  clear: '지우기',
  error: '오류',
  
  // Voice Messages
  recordVoiceMessage: '음성 메시지 녹음',
  playVoiceMessage: '음성 메시지 재생',
  pauseVoiceMessage: '음성 메시지 일시정지',
  viewTranscription: '전사 보기',
  hideTranscription: '전사 숨기기',
  transcription: '전사',
  voiceTranscription: '음성 전사',
  noTranscriptionAvailable: '전사를 사용할 수 없습니다',
  voiceMessagePreview: '음성 메시지 미리보기',
  reRecord: '다시 녹음',
  sending: '전송 중...',
  
  // Notifications
  newMessage: '새 메시지',
  newGroupMessage: '새 그룹 메시지',
  messageFrom: '메시지 발신자',
  
  // Common
  loading: '로딩 중...',
  retry: '다시 시도',
  next: '다음',
  save: '저장',
  delete: '삭제',
  edit: '편집',
  success: '성공',
  updateSettingError: '설정 업데이트 실패. 다시 시도해주세요.',
  searchByEmail: '이메일로 검색...',
  close: '닫기',
  yes: '예',
  no: '아니오',
  ok: '확인',
  
  // Additional UI strings
  unknownUser: '알 수 없는 사용자',
  addMessage: '메시지 추가...',
  groupChat: '그룹 채팅',
  send: '전송',
  failedToSendMessage: '메시지 전송 실패',
  failedToSendVoiceMessage: '음성 메시지 전송 실패',
  failedToAddReaction: '반응 추가 실패',
  noMessagesYet: '아직 메시지가 없습니다',
  deletePicture: '사진 삭제',
  deleteAccount: '계정 삭제',
  enterFirstName: '이름을 입력하세요',
  enterLastName: '성을 입력하세요',
  enterPhoneNumber: '전화번호를 입력하세요',
  welcomeBack: '다시 오신 것을 환영합니다!',
  signInToAccount: '계정에 로그인',
  signingIn: '로그인 중...',
  signInWithGoogle: 'Google로 로그인',
  dontHaveAccount: '계정이 없으신가요? 회원가입',
  createAccount: '계정 만들기',
  signUpForAccount: '새 계정에 회원가입',
  creatingAccount: '계정 생성 중...',
  signUpWithGoogle: 'Google로 회원가입',
  alreadyHaveAccount: '이미 계정이 있으신가요? 로그인',
  connectWithWorld: '세계와 연결하세요',
  loadingProfile: '프로필 로딩 중...',
  userNotFound: '사용자를 찾을 수 없습니다',
  goBack: '뒤로',
  deletedUser: '삭제된 사용자',
  userDeletedAccount: '이 사용자는 계정을 삭제했습니다',
  // Language settings
  translationLanguage: '번역 언어',
  messagesWillBeTranslatedTo: '메시지가 다음으로 번역됩니다:',
  culturalHints: '문화적 힌트',
  showCulturalContext: '속어, 관용구, 문화적 참조의 문화적 맥락 표시',
  removeCachedTranslations: '저장 공간을 확보하기 위해 캐시된 번역 제거',
  selectLanguage: '언어 선택',
  // Smart Suggestions
  smartSuggestions: '스마트 제안',
  generatingSuggestions: '제안 생성 중...',
  // Translation Display
  aiAnalysis: 'AI 분석',
  intent: '의도',
  tone: '톤',
  topic: '주제',
  entities: '엔티티',
  literal: '직역',
  
  // Translation Modes
  translationMode: '번역 모드',
  manualTranslate: '수동 번역',
  autoTranslate: '자동 번역',
  advancedTranslate: '고급 번역',
  autoAdvancedTranslate: '자동 고급 번역',
  manualTranslateDescription: '번역 버튼을 클릭하여 메시지 번역',
  autoTranslateDescription: '메시지 수신 시 자동 번역',
  advancedTranslateDescription: '번역과 함께 문화적 힌트와 AI 분석 표시',
  autoAdvancedTranslateDescription: '문화적 힌트와 AI 분석으로 자동 번역',
  selectTranslationMode: '번역 모드 선택',
  
  // Translation Cache
  translationCache: '번역 캐시',
  translationCacheDescription: '반복 텍스트를 빠르게 하기 위해 번역 저장',
  
  // Smart Suggestions
  useRAGContext: 'RAG 컨텍스트 사용',
  useRAGContextDescription: '과거 컨텍스트 또는 최근 메시지 선택',
  useRAGContextDescriptionEnabled: '과거 대화 컨텍스트 사용 (느리지만 더 스마트)',
  useRAGContextDescriptionDisabled: '최근 메시지만 사용 (빠르지만 컨텍스트가 적음)',
  includeOtherLanguage: '다른 언어 포함',
  includeOtherLanguageDescription: '여러 언어로 제안 표시',
  includeOtherLanguageDescriptionEnabled: '당신의 언어와 상대방의 언어로 제안 표시',
  includeOtherLanguageDescriptionDisabled: '당신의 언어로만 제안 표시',
  backToKeyboard: '키보드로 돌아가기',
  
  // Chat List
  noChatsYet: '아직 채팅이 없습니다',
  startConversation: '대화를 시작하세요!',
};

// Portuguese
const pt: LocalizationStrings = {
  // Navigation
  messages: 'Mensagens',
  profile: 'Perfil',
  
  // Authentication
  signIn: 'Entrar',
  signUp: 'Cadastrar',
  signOut: 'Sair',
  email: 'E-mail',
  password: 'Senha',
  confirmPassword: 'Confirmar Senha',
  firstName: 'Nome',
  lastName: 'Sobrenome',
  phoneNumber: 'Número de Telefone',
  
  // Chat
  sendMessage: 'Enviar Mensagem',
  typeMessage: 'Digite uma mensagem...',
  online: 'Online',
  offline: 'Offline',
  lastSeen: 'Última vez visto',
  typing: 'digitando...',
  read: 'Lido',
  delivered: 'Entregue',
  sent: 'Enviado',
  
  // Groups
  createGroup: 'Criar Grupo',
  addMembers: 'Adicionar Membros',
  groupName: 'Nome do Grupo',
  groupDescription: 'Descrição do Grupo',
  members: 'Membros',
  leaveGroup: 'Sair do Grupo',
  deleteGroup: 'Excluir Grupo',
  adding: 'Adicionando...',
  add: 'Adicionar',
  failedToAddMembers: 'Falha ao adicionar membros ao grupo',
  typeAtLeast3Characters: 'Digite pelo menos 3 caracteres para pesquisar',
  searching: 'Pesquisando...',
  noUsersFound: 'Nenhum usuário encontrado',
  back: 'Voltar',
  description: 'Descrição',
  enterGroupName: 'Digite o nome do grupo',
  enterGroupDescriptionOptional: 'Digite a descrição do grupo (opcional)',
  searchAndAddMembers: 'Pesquisar e Adicionar Membros',
  selectedMembers: 'Membros Selecionados',
  creating: 'Criando...',
  groupMembersWillBeNotified: 'Nota: Os membros do grupo serão notificados quando o grupo for criado.',
  addGroupMembers: 'Adicionar Membros do Grupo',
  pleaseEnterGroupName: 'Por favor, digite um nome para o grupo',
  mustBeLoggedInToCreateGroup: 'Você deve estar logado para criar um grupo',
  groupCreatedSuccessfully: 'Grupo criado com sucesso!',
  failedToCreateGroup: 'Falha ao criar grupo. Tente novamente.',
  searchUsers: 'Pesquisar Usuários',
  groupMembers: 'Membros do Grupo',
  admin: 'Administrador',
  noMembersFound: 'Nenhum membro encontrado',
  loadingMembers: 'Carregando membros...',
  you: 'Você',
  
  // Profile
  editProfile: 'Editar Perfil',
  changePhoto: 'Alterar Foto',
  status: 'Status',
  about: 'Sobre',
  settings: 'Configurações',
  translationSettings: 'Configurações de Tradução',
  languageSettings: 'Configurações de Idioma',
  personalInformation: 'Informações Pessoais',
  dangerZone: 'Zona de Perigo',
  logOut: 'Sair',
  testPushNotification: 'Testar Notificação Push',
  sendTestNotification: 'Enviar notificação de teste',
  english: 'Inglês',
  emailCannotBeChanged: 'E-mail não pode ser alterado',
  phoneNumberWillBeVerified: 'Número de telefone será verificado mais tarde',
  editPicture: 'Editar Foto',
  uploading: 'Enviando...',
  saveChanges: 'Salvar Alterações',
  saving: 'Salvando...',
  
  // Translation
  translate: 'Traduzir',
  translating: 'Traduzindo...',
  analyzingWithAI: 'Analisando com IA',
  translationFailed: 'Falha na tradução',
  clearTranslationCache: 'Limpar Cache de Tradução',
  clearCacheConfirm: 'Isso removerá todas as traduções e dicas culturais em cache. Você pode precisar re-traduzir algumas mensagens.',
  clearCacheSuccess: 'Cache de tradução limpo',
  clearCacheError: 'Falha ao limpar cache',
  cancel: 'Cancelar',
  clear: 'Limpar',
  error: 'Erro',
  
  // Voice Messages
  recordVoiceMessage: 'Gravar Mensagem de Voz',
  playVoiceMessage: 'Reproduzir Mensagem de Voz',
  pauseVoiceMessage: 'Pausar Mensagem de Voz',
  viewTranscription: 'Ver Transcrição',
  hideTranscription: 'Ocultar Transcrição',
  transcription: 'Transcrição',
  voiceTranscription: 'Transcrição de Voz',
  noTranscriptionAvailable: 'Nenhuma transcrição disponível',
  voiceMessagePreview: 'Visualização da Mensagem de Voz',
  reRecord: 'Regravar',
  sending: 'Enviando...',
  
  // Notifications
  newMessage: 'Nova Mensagem',
  newGroupMessage: 'Nova Mensagem de Grupo',
  messageFrom: 'Mensagem de',
  
  // Common
  loading: 'Carregando...',
  retry: 'Tentar Novamente',
  next: 'Próximo',
  save: 'Salvar',
  delete: 'Excluir',
  edit: 'Editar',
  success: 'Sucesso',
  updateSettingError: 'Falha ao atualizar configuração. Tente novamente.',
  searchByEmail: 'Pesquisar por e-mail...',
  close: 'Fechar',
  yes: 'Sim',
  no: 'Não',
  ok: 'OK',
  
  // Additional UI strings
  unknownUser: 'Usuário Desconhecido',
  addMessage: 'Adicionar mensagem...',
  groupChat: 'Chat de Grupo',
  send: 'Enviar',
  failedToSendMessage: 'Falha ao enviar mensagem',
  failedToSendVoiceMessage: 'Falha ao enviar mensagem de voz',
  failedToAddReaction: 'Falha ao adicionar reação',
  noMessagesYet: 'Ainda não há mensagens',
  deletePicture: 'Excluir Foto',
  deleteAccount: 'Excluir Conta',
  enterFirstName: 'Digite seu nome',
  enterLastName: 'Digite seu sobrenome',
  enterPhoneNumber: 'Digite seu número de telefone',
  welcomeBack: 'Bem-vindo de volta!',
  signInToAccount: 'Entre na sua conta',
  signingIn: 'Entrando...',
  signInWithGoogle: 'Entrar com Google',
  dontHaveAccount: 'Não tem uma conta? Cadastre-se',
  createAccount: 'Criar Conta',
  signUpForAccount: 'Cadastre-se para uma nova conta',
  creatingAccount: 'Criando conta...',
  signUpWithGoogle: 'Cadastrar com Google',
  alreadyHaveAccount: 'Já tem uma conta? Entre',
  connectWithWorld: 'Conecte-se com o mundo',
  loadingProfile: 'Carregando perfil...',
  userNotFound: 'Usuário não encontrado',
  goBack: 'Voltar',
  deletedUser: 'Usuário Excluído',
  userDeletedAccount: 'Este usuário excluiu sua conta',
  // Language settings
  translationLanguage: 'Idioma de Tradução',
  messagesWillBeTranslatedTo: 'Mensagens serão traduzidas para:',
  culturalHints: 'Dicas Culturais',
  showCulturalContext: 'Mostrar contexto cultural para gírias, expressões e referências culturais',
  removeCachedTranslations: 'Remover traduções em cache para liberar espaço de armazenamento',
  selectLanguage: 'Selecionar Idioma',
  // Smart Suggestions
  smartSuggestions: 'Sugestões Inteligentes',
  generatingSuggestions: 'Gerando sugestões...',
  // Translation Display
  aiAnalysis: 'Análise de IA',
  intent: 'Intenção',
  tone: 'Tom',
  topic: 'Tópico',
  entities: 'Entidades',
  literal: 'Literal',
  
  // Translation Modes
  translationMode: 'Modo de Tradução',
  manualTranslate: 'Tradução Manual',
  autoTranslate: 'Tradução Automática',
  advancedTranslate: 'Tradução Avançada',
  autoAdvancedTranslate: 'Tradução Automática Avançada',
  manualTranslateDescription: 'Clique no botão traduzir para traduzir mensagens',
  autoTranslateDescription: 'Traduzir automaticamente mensagens quando recebidas',
  advancedTranslateDescription: 'Mostrar dicas culturais e análise de IA com traduções',
  autoAdvancedTranslateDescription: 'Traduzir automaticamente com dicas culturais e análise de IA',
  selectTranslationMode: 'Selecionar Modo de Tradução',
  
  // Translation Cache
  translationCache: 'Cache de Tradução',
  translationCacheDescription: 'Armazenar traduções para acelerar texto repetitivo',
  
  // Smart Suggestions
  useRAGContext: 'Usar Contexto RAG',
  useRAGContextDescription: 'Escolher entre contexto histórico ou mensagens recentes',
  useRAGContextDescriptionEnabled: 'Usa contexto histórico de conversa (mais lento mas mais inteligente)',
  useRAGContextDescriptionDisabled: 'Usa apenas mensagens recentes (mais rápido mas menos contexto)',
  includeOtherLanguage: 'Incluir Outro Idioma',
  includeOtherLanguageDescription: 'Mostrar sugestões em múltiplos idiomas',
  includeOtherLanguageDescriptionEnabled: 'Mostra sugestões no seu idioma e no deles',
  includeOtherLanguageDescriptionDisabled: 'Mostra sugestões apenas no seu idioma',
  backToKeyboard: 'Voltar ao Teclado',
  
  // Chat List
  noChatsYet: 'Ainda não há chats',
  startConversation: 'Inicie uma conversa!',
};

// Arabic
const ar: LocalizationStrings = {
  // Navigation
  messages: 'الرسائل',
  profile: 'الملف الشخصي',
  
  // Authentication
  signIn: 'تسجيل الدخول',
  signUp: 'إنشاء حساب',
  signOut: 'تسجيل الخروج',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  confirmPassword: 'تأكيد كلمة المرور',
  firstName: 'الاسم الأول',
  lastName: 'اسم العائلة',
  phoneNumber: 'رقم الهاتف',
  
  // Chat
  sendMessage: 'إرسال رسالة',
  typeMessage: 'اكتب رسالة...',
  online: 'متصل',
  offline: 'غير متصل',
  lastSeen: 'آخر ظهور',
  typing: 'يكتب...',
  read: 'مقروء',
  delivered: 'تم التسليم',
  sent: 'مرسل',
  
  // Groups
  createGroup: 'إنشاء مجموعة',
  addMembers: 'إضافة أعضاء',
  groupName: 'اسم المجموعة',
  groupDescription: 'وصف المجموعة',
  members: 'الأعضاء',
  leaveGroup: 'مغادرة المجموعة',
  deleteGroup: 'حذف المجموعة',
  adding: 'جاري الإضافة...',
  add: 'إضافة',
  failedToAddMembers: 'فشل في إضافة أعضاء للمجموعة',
  typeAtLeast3Characters: 'اكتب 3 أحرف على الأقل للبحث',
  searching: 'جاري البحث...',
  noUsersFound: 'لم يتم العثور على مستخدمين',
  back: 'رجوع',
  description: 'الوصف',
  enterGroupName: 'أدخل اسم المجموعة',
  enterGroupDescriptionOptional: 'أدخل وصف المجموعة (اختياري)',
  searchAndAddMembers: 'البحث وإضافة الأعضاء',
  selectedMembers: 'الأعضاء المحددون',
  creating: 'جاري الإنشاء...',
  groupMembersWillBeNotified: 'ملاحظة: سيتم إشعار أعضاء المجموعة عند إنشاء المجموعة.',
  addGroupMembers: 'إضافة أعضاء المجموعة',
  pleaseEnterGroupName: 'يرجى إدخال اسم المجموعة',
  mustBeLoggedInToCreateGroup: 'يجب أن تكون مسجلاً للدخول لإنشاء مجموعة',
  groupCreatedSuccessfully: 'تم إنشاء المجموعة بنجاح!',
  failedToCreateGroup: 'فشل في إنشاء المجموعة. يرجى المحاولة مرة أخرى.',
  searchUsers: 'البحث عن المستخدمين',
  groupMembers: 'أعضاء المجموعة',
  admin: 'مدير',
  noMembersFound: 'لم يتم العثور على أعضاء',
  loadingMembers: 'جاري تحميل الأعضاء...',
  you: 'أنت',
  
  // Profile
  editProfile: 'تعديل الملف الشخصي',
  changePhoto: 'تغيير الصورة',
  status: 'الحالة',
  about: 'حول',
  settings: 'الإعدادات',
  translationSettings: 'إعدادات الترجمة',
  languageSettings: 'إعدادات اللغة',
  personalInformation: 'المعلومات الشخصية',
  dangerZone: 'منطقة الخطر',
  logOut: 'تسجيل الخروج',
  testPushNotification: 'اختبار الإشعارات',
  sendTestNotification: 'إرسال إشعار تجريبي',
  english: 'الإنجليزية',
  emailCannotBeChanged: 'لا يمكن تغيير البريد الإلكتروني',
  phoneNumberWillBeVerified: 'سيتم التحقق من رقم الهاتف لاحقاً',
  editPicture: 'تعديل الصورة',
  uploading: 'جاري الرفع...',
  saveChanges: 'حفظ التغييرات',
  saving: 'جاري الحفظ...',
  
  // Translation
  translate: 'ترجمة',
  translating: 'جاري الترجمة...',
  analyzingWithAI: 'التحليل بالذكاء الاصطناعي',
  translationFailed: 'فشل في الترجمة',
  clearTranslationCache: 'مسح ذاكرة الترجمة',
  clearCacheConfirm: 'سيؤدي هذا إلى مسح جميع الترجمات والتلميحات الثقافية المحفوظة. قد تحتاج إلى إعادة ترجمة بعض الرسائل.',
  clearCacheSuccess: 'تم مسح ذاكرة الترجمة',
  clearCacheError: 'فشل في مسح الذاكرة',
  cancel: 'إلغاء',
  clear: 'مسح',
  error: 'خطأ',
  
  // Voice Messages
  recordVoiceMessage: 'تسجيل رسالة صوتية',
  playVoiceMessage: 'تشغيل الرسالة الصوتية',
  pauseVoiceMessage: 'إيقاف الرسالة الصوتية مؤقتاً',
  viewTranscription: 'عرض النص',
  hideTranscription: 'إخفاء النص',
  transcription: 'النص',
  voiceTranscription: 'النص الصوتي',
  noTranscriptionAvailable: 'لا يوجد نص متاح',
  voiceMessagePreview: 'معاينة الرسالة الصوتية',
  reRecord: 'إعادة التسجيل',
  sending: 'جاري الإرسال...',
  
  // Notifications
  newMessage: 'رسالة جديدة',
  newGroupMessage: 'رسالة مجموعة جديدة',
  messageFrom: 'رسالة من',
  
  // Common
  loading: 'جاري التحميل...',
  retry: 'إعادة المحاولة',
  next: 'التالي',
  save: 'حفظ',
  delete: 'حذف',
  edit: 'تعديل',
  success: 'نجح',
  updateSettingError: 'فشل في تحديث الإعداد. يرجى المحاولة مرة أخرى.',
  searchByEmail: 'البحث بالبريد الإلكتروني...',
  close: 'إغلاق',
  yes: 'نعم',
  no: 'لا',
  ok: 'موافق',
  
  // Additional UI strings
  unknownUser: 'مستخدم غير معروف',
  addMessage: 'إضافة رسالة...',
  groupChat: 'دردشة المجموعة',
  send: 'إرسال',
  failedToSendMessage: 'فشل في إرسال الرسالة',
  failedToSendVoiceMessage: 'فشل في إرسال الرسالة الصوتية',
  failedToAddReaction: 'فشل في إضافة التفاعل',
  noMessagesYet: 'لا توجد رسائل بعد',
  deletePicture: 'حذف الصورة',
  deleteAccount: 'حذف الحساب',
  enterFirstName: 'أدخل اسمك الأول',
  enterLastName: 'أدخل اسم العائلة',
  enterPhoneNumber: 'أدخل رقم هاتفك',
  welcomeBack: 'مرحباً بعودتك!',
  signInToAccount: 'تسجيل الدخول إلى حسابك',
  signingIn: 'جاري تسجيل الدخول...',
  signInWithGoogle: 'تسجيل الدخول بـ Google',
  dontHaveAccount: 'ليس لديك حساب؟ سجل الآن',
  createAccount: 'إنشاء حساب',
  signUpForAccount: 'سجل للحصول على حساب جديد',
  creatingAccount: 'جاري إنشاء الحساب...',
  signUpWithGoogle: 'التسجيل بـ Google',
  alreadyHaveAccount: 'لديك حساب بالفعل؟ سجل الدخول',
  connectWithWorld: 'تواصل مع العالم',
  loadingProfile: 'جاري تحميل الملف الشخصي...',
  userNotFound: 'المستخدم غير موجود',
  goBack: 'رجوع',
  deletedUser: 'مستخدم محذوف',
  userDeletedAccount: 'هذا المستخدم حذف حسابه',
  // Language settings
  translationLanguage: 'لغة الترجمة',
  messagesWillBeTranslatedTo: 'ستتم ترجمة الرسائل إلى:',
  culturalHints: 'التلميحات الثقافية',
  showCulturalContext: 'إظهار السياق الثقافي للعامية والتعابير والمراجع الثقافية',
  removeCachedTranslations: 'إزالة الترجمات المحفوظة لتحرير مساحة التخزين',
  selectLanguage: 'اختيار اللغة',
  // Smart Suggestions
  smartSuggestions: 'الاقتراحات الذكية',
  generatingSuggestions: 'جاري إنشاء الاقتراحات...',
  // Translation Display
  aiAnalysis: 'تحليل الذكاء الاصطناعي',
  intent: 'النية',
  tone: 'النبرة',
  topic: 'الموضوع',
  entities: 'الكيانات',
  literal: 'حرفي',
  
  // Translation Modes
  translationMode: 'وضع الترجمة',
  manualTranslate: 'ترجمة يدوية',
  autoTranslate: 'ترجمة تلقائية',
  advancedTranslate: 'ترجمة متقدمة',
  autoAdvancedTranslate: 'ترجمة تلقائية متقدمة',
  manualTranslateDescription: 'انقر على زر الترجمة لترجمة الرسائل',
  autoTranslateDescription: 'ترجمة الرسائل تلقائياً عند الاستلام',
  advancedTranslateDescription: 'إظهار التلميحات الثقافية وتحليل الذكاء الاصطناعي مع الترجمات',
  autoAdvancedTranslateDescription: 'ترجمة تلقائية مع التلميحات الثقافية وتحليل الذكاء الاصطناعي',
  selectTranslationMode: 'اختيار وضع الترجمة',
  
  // Translation Cache
  translationCache: 'ذاكرة الترجمة',
  translationCacheDescription: 'تخزين الترجمات لتسريع النص المتكرر',
  
  // Smart Suggestions
  useRAGContext: 'استخدام سياق RAG',
  useRAGContextDescription: 'اختيار بين السياق التاريخي أو الرسائل الحديثة',
  useRAGContextDescriptionEnabled: 'يستخدم سياق المحادثة التاريخي (أبطأ لكن أذكى)',
  useRAGContextDescriptionDisabled: 'يستخدم الرسائل الحديثة فقط (أسرع لكن أقل سياقاً)',
  includeOtherLanguage: 'تضمين لغة أخرى',
  includeOtherLanguageDescription: 'إظهار الاقتراحات بلغات متعددة',
  includeOtherLanguageDescriptionEnabled: 'يظهر الاقتراحات بلغتك ولغتهم',
  includeOtherLanguageDescriptionDisabled: 'يظهر الاقتراحات بلغتك فقط',
  backToKeyboard: 'العودة إلى لوحة المفاتيح',
  
  // Chat List
  noChatsYet: 'لا توجد محادثات بعد',
  startConversation: 'ابدأ محادثة!',
};

// Hindi
const hi: LocalizationStrings = {
  // Navigation
  messages: 'संदेश',
  profile: 'प्रोफ़ाइल',
  
  // Authentication
  signIn: 'साइन इन',
  signUp: 'साइन अप',
  signOut: 'साइन आउट',
  email: 'ईमेल',
  password: 'पासवर्ड',
  confirmPassword: 'पासवर्ड की पुष्टि करें',
  firstName: 'पहला नाम',
  lastName: 'अंतिम नाम',
  phoneNumber: 'फोन नंबर',
  
  // Chat
  sendMessage: 'संदेश भेजें',
  typeMessage: 'संदेश टाइप करें...',
  online: 'ऑनलाइन',
  offline: 'ऑफलाइन',
  lastSeen: 'अंतिम बार देखा गया',
  typing: 'टाइप कर रहे हैं...',
  read: 'पढ़ा गया',
  delivered: 'डिलीवर',
  sent: 'भेजा गया',
  
  // Groups
  createGroup: 'ग्रुप बनाएं',
  addMembers: 'सदस्य जोड़ें',
  groupName: 'ग्रुप का नाम',
  groupDescription: 'ग्रुप का विवरण',
  members: 'सदस्य',
  leaveGroup: 'ग्रुप छोड़ें',
  deleteGroup: 'ग्रुप हटाएं',
  adding: 'जोड़ रहे हैं...',
  add: 'जोड़ें',
  failedToAddMembers: 'ग्रुप में सदस्य जोड़ने में विफल',
  typeAtLeast3Characters: 'खोजने के लिए कम से कम 3 अक्षर टाइप करें',
  searching: 'खोज रहे हैं...',
  noUsersFound: 'कोई उपयोगकर्ता नहीं मिला',
  back: 'वापस',
  description: 'विवरण',
  enterGroupName: 'ग्रुप का नाम दर्ज करें',
  enterGroupDescriptionOptional: 'ग्रुप का विवरण दर्ज करें (वैकल्पिक)',
  searchAndAddMembers: 'खोजें और सदस्य जोड़ें',
  selectedMembers: 'चयनित सदस्य',
  creating: 'बना रहे हैं...',
  groupMembersWillBeNotified: 'नोट: ग्रुप बनने पर ग्रुप सदस्यों को सूचित किया जाएगा।',
  addGroupMembers: 'ग्रुप सदस्य जोड़ें',
  pleaseEnterGroupName: 'कृपया ग्रुप का नाम दर्ज करें',
  mustBeLoggedInToCreateGroup: 'ग्रुप बनाने के लिए आपको लॉग इन होना होगा',
  groupCreatedSuccessfully: 'ग्रुप सफलतापूर्वक बनाया गया!',
  failedToCreateGroup: 'ग्रुप बनाने में विफल। कृपया पुनः प्रयास करें।',
  searchUsers: 'उपयोगकर्ता खोजें',
  groupMembers: 'ग्रुप सदस्य',
  admin: 'प्रशासक',
  noMembersFound: 'कोई सदस्य नहीं मिला',
  loadingMembers: 'सदस्य लोड हो रहे हैं...',
  you: 'आप',
  
  // Profile
  editProfile: 'प्रोफ़ाइल संपादित करें',
  changePhoto: 'फोटो बदलें',
  status: 'स्थिति',
  about: 'के बारे में',
  settings: 'सेटिंग्स',
  translationSettings: 'अनुवाद सेटिंग्स',
  languageSettings: 'भाषा सेटिंग्स',
  personalInformation: 'व्यक्तिगत जानकारी',
  dangerZone: 'खतरा क्षेत्र',
  logOut: 'लॉग आउट',
  testPushNotification: 'पुश नोटिफिकेशन टेस्ट करें',
  sendTestNotification: 'टेस्ट नोटिफिकेशन भेजें',
  english: 'अंग्रेजी',
  emailCannotBeChanged: 'ईमेल नहीं बदला जा सकता',
  phoneNumberWillBeVerified: 'फोन नंबर बाद में सत्यापित किया जाएगा',
  editPicture: 'फोटो संपादित करें',
  uploading: 'अपलोड हो रहा है...',
  saveChanges: 'परिवर्तन सहेजें',
  saving: 'सहेज रहे हैं...',
  
  // Translation
  translate: 'अनुवाद',
  translating: 'अनुवाद हो रहा है...',
  analyzingWithAI: 'AI के साथ विश्लेषण',
  translationFailed: 'अनुवाद विफल',
  clearTranslationCache: 'अनुवाद कैश साफ़ करें',
  clearCacheConfirm: 'यह सभी कैश्ड अनुवाद और सांस्कृतिक संकेतों को हटा देगा। आपको कुछ संदेशों का पुनः अनुवाद करना पड़ सकता है।',
  clearCacheSuccess: 'अनुवाद कैश साफ़ हो गया',
  clearCacheError: 'कैश साफ़ करने में विफल',
  cancel: 'रद्द करें',
  clear: 'साफ़ करें',
  error: 'त्रुटि',
  
  // Voice Messages
  recordVoiceMessage: 'वॉइस मैसेज रिकॉर्ड करें',
  playVoiceMessage: 'वॉइस मैसेज चलाएं',
  pauseVoiceMessage: 'वॉइस मैसेज रोकें',
  viewTranscription: 'ट्रांसक्रिप्शन देखें',
  hideTranscription: 'ट्रांसक्रिप्शन छुपाएं',
  transcription: 'ट्रांसक्रिप्शन',
  voiceTranscription: 'वॉइस ट्रांसक्रिप्शन',
  noTranscriptionAvailable: 'कोई ट्रांसक्रिप्शन उपलब्ध नहीं',
  voiceMessagePreview: 'वॉइस मैसेज पूर्वावलोकन',
  reRecord: 'पुनः रिकॉर्ड',
  sending: 'भेज रहे हैं...',
  
  // Notifications
  newMessage: 'नया संदेश',
  newGroupMessage: 'नया ग्रुप संदेश',
  messageFrom: 'से संदेश',
  
  // Common
  loading: 'लोड हो रहा है...',
  retry: 'पुनः प्रयास',
  next: 'अगला',
  save: 'सहेजें',
  delete: 'हटाएं',
  edit: 'संपादित करें',
  success: 'सफल',
  updateSettingError: 'सेटिंग अपडेट करने में विफल। कृपया पुनः प्रयास करें।',
  searchByEmail: 'ईमेल से खोजें...',
  close: 'बंद करें',
  yes: 'हाँ',
  no: 'नहीं',
  ok: 'ठीक है',
  
  // Additional UI strings
  unknownUser: 'अज्ञात उपयोगकर्ता',
  addMessage: 'संदेश जोड़ें...',
  groupChat: 'ग्रुप चैट',
  send: 'भेजें',
  failedToSendMessage: 'संदेश भेजने में विफल',
  failedToSendVoiceMessage: 'वॉइस मैसेज भेजने में विफल',
  failedToAddReaction: 'रिएक्शन जोड़ने में विफल',
  noMessagesYet: 'अभी तक कोई संदेश नहीं',
  deletePicture: 'फोटो हटाएं',
  deleteAccount: 'खाता हटाएं',
  enterFirstName: 'अपना पहला नाम दर्ज करें',
  enterLastName: 'अपना अंतिम नाम दर्ज करें',
  enterPhoneNumber: 'अपना फोन नंबर दर्ज करें',
  welcomeBack: 'वापस स्वागत है!',
  signInToAccount: 'अपने खाते में साइन इन करें',
  signingIn: 'साइन इन हो रहे हैं...',
  signInWithGoogle: 'Google के साथ साइन इन करें',
  dontHaveAccount: 'खाता नहीं है? साइन अप करें',
  createAccount: 'खाता बनाएं',
  signUpForAccount: 'नए खाते के लिए साइन अप करें',
  creatingAccount: 'खाता बना रहे हैं...',
  signUpWithGoogle: 'Google के साथ साइन अप करें',
  alreadyHaveAccount: 'पहले से खाता है? साइन इन करें',
  connectWithWorld: 'दुनिया से जुड़ें',
  loadingProfile: 'प्रोफ़ाइल लोड हो रहा है...',
  userNotFound: 'उपयोगकर्ता नहीं मिला',
  goBack: 'वापस जाएं',
  deletedUser: 'हटाया गया उपयोगकर्ता',
  userDeletedAccount: 'इस उपयोगकर्ता ने अपना खाता हटा दिया है',
  // Language settings
  translationLanguage: 'अनुवाद भाषा',
  messagesWillBeTranslatedTo: 'संदेशों का अनुवाद होगा:',
  culturalHints: 'सांस्कृतिक संकेत',
  showCulturalContext: 'बोलचाल, मुहावरों और सांस्कृतिक संदर्भों के लिए सांस्कृतिक संदर्भ दिखाएं',
  removeCachedTranslations: 'स्टोरेज स्थान मुक्त करने के लिए कैश्ड अनुवाद हटाएं',
  selectLanguage: 'भाषा चुनें',
  // Smart Suggestions
  smartSuggestions: 'स्मार्ट सुझाव',
  generatingSuggestions: 'सुझाव जेनरेट हो रहे हैं...',
  // Translation Display
  aiAnalysis: 'AI विश्लेषण',
  intent: 'इरादा',
  tone: 'टोन',
  topic: 'विषय',
  entities: 'इकाइयां',
  literal: 'शाब्दिक',
  
  // Translation Modes
  translationMode: 'अनुवाद मोड',
  manualTranslate: 'मैनुअल अनुवाद',
  autoTranslate: 'ऑटो अनुवाद',
  advancedTranslate: 'उन्नत अनुवाद',
  autoAdvancedTranslate: 'ऑटो उन्नत अनुवाद',
  manualTranslateDescription: 'संदेशों का अनुवाद करने के लिए अनुवाद बटन पर क्लिक करें',
  autoTranslateDescription: 'संदेश प्राप्त होने पर स्वचालित रूप से अनुवाद करें',
  advancedTranslateDescription: 'अनुवाद के साथ सांस्कृतिक संकेत और AI विश्लेषण दिखाएं',
  autoAdvancedTranslateDescription: 'सांस्कृतिक संकेत और AI विश्लेषण के साथ स्वचालित अनुवाद',
  selectTranslationMode: 'अनुवाद मोड चुनें',
  
  // Translation Cache
  translationCache: 'अनुवाद कैश',
  translationCacheDescription: 'दोहराए गए टेक्स्ट को तेज़ करने के लिए अनुवाद स्टोर करें',
  
  // Smart Suggestions
  useRAGContext: 'RAG संदर्भ का उपयोग करें',
  useRAGContextDescription: 'ऐतिहासिक संदर्भ या हाल के संदेशों के बीच चुनें',
  useRAGContextDescriptionEnabled: 'ऐतिहासिक बातचीत संदर्भ का उपयोग करता है (धीमा लेकिन अधिक स्मार्ट)',
  useRAGContextDescriptionDisabled: 'केवल हाल के संदेशों का उपयोग करता है (तेज़ लेकिन कम संदर्भ)',
  includeOtherLanguage: 'अन्य भाषा शामिल करें',
  includeOtherLanguageDescription: 'कई भाषाओं में सुझाव दिखाएं',
  includeOtherLanguageDescriptionEnabled: 'आपकी भाषा और उनकी भाषा में सुझाव दिखाता है',
  includeOtherLanguageDescriptionDisabled: 'केवल आपकी भाषा में सुझाव दिखाता है',
  backToKeyboard: 'कीबोर्ड पर वापस जाएं',
  
  // Chat List
  noChatsYet: 'अभी तक कोई चैट नहीं',
  startConversation: 'बातचीत शुरू करें!',
};

// Available languages
export const availableLanguages = [
  { code: 'EN', name: 'English', nativeName: 'English' },
  { code: 'ES', name: 'Spanish', nativeName: 'Español' },
  { code: 'ZH', name: 'Chinese', nativeName: '中文' },
  { code: 'FR', name: 'French', nativeName: 'Français' },
  { code: 'DE', name: 'German', nativeName: 'Deutsch' },
  { code: 'JA', name: 'Japanese', nativeName: '日本語' },
  { code: 'KO', name: 'Korean', nativeName: '한국어' },
  { code: 'PT', name: 'Portuguese', nativeName: 'Português' },
  { code: 'AR', name: 'Arabic', nativeName: 'العربية' },
  { code: 'HI', name: 'Hindi', nativeName: 'हिन्दी' },
];

// Language mappings
const translations: Record<string, LocalizationStrings> = {
  EN: en,
  ES: es,
  ZH: zh,
  FR: fr,
  DE: de,
  JA: ja,
  KO: ko,
  PT: pt,
  AR: ar,
  HI: hi,
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
      this.setLanguage(user.defaultLanguage);
    } else {
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
