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
  success: string;
  done: string;
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
  success: string;
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
  success: 'Success',
  done: 'Done',
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
  success: 'Success',
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
  success: 'Éxito',
  done: 'Listo',
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
  success: 'Éxito',
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
  success: '成功',
  done: '完成',
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
  success: '成功',
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
