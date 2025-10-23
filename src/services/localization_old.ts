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
  noTranscriptionAvailable: 'No transcription available',
  
  // Additional UI strings
  unknownUser: 'Unknown User',
  addMessage: 'Add a message...',
  groupChat: 'Group Chat',
  send: 'Send',
  failedToSendMessage: 'Failed to send message',
  failedToSendVoiceMessage: 'Failed to send voice message',
  failedToAddReaction: 'Failed to add reaction',
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
  noTranscriptionAvailable: 'No hay transcripción disponible',
  
  // Additional UI strings
  unknownUser: 'Usuario Desconocido',
  addMessage: 'Agregar mensaje...',
  groupChat: 'Chat Grupal',
  send: 'Enviar',
  failedToSendMessage: 'Error al enviar mensaje',
  failedToSendVoiceMessage: 'Error al enviar mensaje de voz',
  failedToAddReaction: 'Error al agregar reacción',
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
  
  // Profile
  editProfile: 'プロフィールを編集',
  changePhoto: '写真を変更',
  status: 'ステータス',
  about: 'について',
  settings: '設定',
  translationSettings: '翻訳設定',
  languageSettings: '言語設定',
  
  // Translation
  translate: '翻訳',
  translating: '翻訳中...',
  translationFailed: '翻訳に失敗しました',
  clearTranslationCache: '翻訳キャッシュをクリア',
  clearCacheConfirm: 'これにより、キャッシュされたすべての翻訳と文化的ヒントがクリアされます。一部のメッセージを再翻訳する必要がある場合があります。',
  clearCacheSuccess: '翻訳キャッシュがクリアされました',
  clearCacheError: 'キャッシュのクリアに失敗しました',
  cancel: 'キャンセル',
  clear: 'クリア',
  success: '成功',
  error: 'エラー',
  
  // Voice Messages
  recordVoiceMessage: '音声メッセージを録音',
  playVoiceMessage: '音声メッセージを再生',
  pauseVoiceMessage: '音声メッセージを一時停止',
  viewTranscription: '転写を表示',
  voiceTranscription: '音声転写',
  
  // Notifications
  newMessage: '新しいメッセージ',
  newGroupMessage: '新しいグループメッセージ',
  messageFrom: 'からのメッセージ',
  
  // Common
  loading: '読み込み中...',
  retry: '再試行',
  done: '完了',
  back: '戻る',
  next: '次へ',
  save: '保存',
  delete: '削除',
  edit: '編集',
  close: '閉じる',
  yes: 'はい',
  no: 'いいえ',
  ok: 'OK',
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
  
  // Profile
  editProfile: 'Profil bearbeiten',
  changePhoto: 'Foto ändern',
  status: 'Status',
  about: 'Über',
  settings: 'Einstellungen',
  translationSettings: 'Übersetzungseinstellungen',
  languageSettings: 'Spracheinstellungen',
  
  // Translation
  translate: 'Übersetzen',
  translating: 'Übersetze...',
  translationFailed: 'Übersetzung fehlgeschlagen',
  clearTranslationCache: 'Übersetzungscache löschen',
  clearCacheConfirm: 'Dies löscht alle zwischengespeicherten Übersetzungen und kulturellen Hinweise. Sie müssen möglicherweise einige Nachrichten neu übersetzen.',
  clearCacheSuccess: 'Übersetzungscache gelöscht',
  clearCacheError: 'Cache konnte nicht gelöscht werden',
  cancel: 'Abbrechen',
  clear: 'Löschen',
  success: 'Erfolg',
  error: 'Fehler',
  
  // Voice Messages
  recordVoiceMessage: 'Sprachnachricht aufnehmen',
  playVoiceMessage: 'Sprachnachricht abspielen',
  pauseVoiceMessage: 'Sprachnachricht pausieren',
  viewTranscription: 'Transkription anzeigen',
  voiceTranscription: 'Sprachtranskription',
  
  // Notifications
  newMessage: 'Neue Nachricht',
  newGroupMessage: 'Neue Gruppennachricht',
  messageFrom: 'Nachricht von',
  
  // Common
  loading: 'Laden...',
  retry: 'Wiederholen',
  done: 'Fertig',
  back: 'Zurück',
  next: 'Weiter',
  save: 'Speichern',
  delete: 'Löschen',
  edit: 'Bearbeiten',
  close: 'Schließen',
  yes: 'Ja',
  no: 'Nein',
  ok: 'OK',
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
  lastSeen: 'Visto por último',
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
  
  // Profile
  editProfile: 'Editar Perfil',
  changePhoto: 'Alterar Foto',
  status: 'Status',
  about: 'Sobre',
  settings: 'Configurações',
  translationSettings: 'Configurações de Tradução',
  languageSettings: 'Configurações de Idioma',
  
  // Translation
  translate: 'Traduzir',
  translating: 'Traduzindo...',
  translationFailed: 'Falha na tradução',
  clearTranslationCache: 'Limpar Cache de Tradução',
  clearCacheConfirm: 'Isso limpará todas as traduções e dicas culturais em cache. Você pode precisar re-traduzir algumas mensagens.',
  clearCacheSuccess: 'Cache de tradução limpo',
  clearCacheError: 'Falha ao limpar cache',
  cancel: 'Cancelar',
  clear: 'Limpar',
  success: 'Sucesso',
  error: 'Erro',
  
  // Voice Messages
  recordVoiceMessage: 'Gravar Mensagem de Voz',
  playVoiceMessage: 'Reproduzir Mensagem de Voz',
  pauseVoiceMessage: 'Pausar Mensagem de Voz',
  viewTranscription: 'Ver Transcrição',
  voiceTranscription: 'Transcrição de Voz',
  
  // Notifications
  newMessage: 'Nova Mensagem',
  newGroupMessage: 'Nova Mensagem de Grupo',
  messageFrom: 'Mensagem de',
  
  // Common
  loading: 'Carregando...',
  retry: 'Tentar Novamente',
  done: 'Concluído',
  back: 'Voltar',
  next: 'Próximo',
  save: 'Salvar',
  delete: 'Excluir',
  edit: 'Editar',
  close: 'Fechar',
  yes: 'Sim',
  no: 'Não',
  ok: 'OK',
};

// Italian
const it: LocalizationStrings = {
  // Navigation
  messages: 'Messaggi',
  profile: 'Profilo',
  
  // Authentication
  signIn: 'Accedi',
  signUp: 'Registrati',
  signOut: 'Esci',
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Conferma Password',
  firstName: 'Nome',
  lastName: 'Cognome',
  phoneNumber: 'Numero di Telefono',
  
  // Chat
  sendMessage: 'Invia Messaggio',
  typeMessage: 'Scrivi un messaggio...',
  online: 'Online',
  offline: 'Offline',
  lastSeen: 'Ultimo accesso',
  typing: 'sta scrivendo...',
  read: 'Letto',
  delivered: 'Consegnato',
  sent: 'Inviato',
  
  // Groups
  createGroup: 'Crea Gruppo',
  addMembers: 'Aggiungi Membri',
  groupName: 'Nome del Gruppo',
  groupDescription: 'Descrizione del Gruppo',
  members: 'Membri',
  leaveGroup: 'Abbandona Gruppo',
  deleteGroup: 'Elimina Gruppo',
  
  // Profile
  editProfile: 'Modifica Profilo',
  changePhoto: 'Cambia Foto',
  status: 'Stato',
  about: 'Informazioni',
  settings: 'Impostazioni',
  translationSettings: 'Impostazioni Traduzione',
  languageSettings: 'Impostazioni Lingua',
  
  // Translation
  translate: 'Traduci',
  translating: 'Traducendo...',
  translationFailed: 'Traduzione fallita',
  clearTranslationCache: 'Cancella Cache Traduzione',
  clearCacheConfirm: 'Questo cancellerà tutte le traduzioni e suggerimenti culturali in cache. Potresti dover ri-traducere alcuni messaggi.',
  clearCacheSuccess: 'Cache traduzione cancellata',
  clearCacheError: 'Errore nel cancellare cache',
  cancel: 'Annulla',
  clear: 'Cancella',
  success: 'Successo',
  error: 'Errore',
  
  // Voice Messages
  recordVoiceMessage: 'Registra Messaggio Vocale',
  playVoiceMessage: 'Riproduci Messaggio Vocale',
  pauseVoiceMessage: 'Pausa Messaggio Vocale',
  viewTranscription: 'Visualizza Trascrizione',
  voiceTranscription: 'Trascrizione Vocale',
  
  // Notifications
  newMessage: 'Nuovo Messaggio',
  newGroupMessage: 'Nuovo Messaggio di Gruppo',
  messageFrom: 'Messaggio da',
  
  // Common
  loading: 'Caricamento...',
  retry: 'Riprova',
  done: 'Fatto',
  back: 'Indietro',
  next: 'Avanti',
  save: 'Salva',
  delete: 'Elimina',
  edit: 'Modifica',
  close: 'Chiudi',
  yes: 'Sì',
  no: 'No',
  ok: 'OK',
  noTranscriptionAvailable: 'No transcription available',
};

// Russian
const ru: LocalizationStrings = {
  // Navigation
  messages: 'Сообщения',
  profile: 'Профиль',
  
  // Authentication
  signIn: 'Войти',
  signUp: 'Зарегистрироваться',
  signOut: 'Выйти',
  email: 'Электронная почта',
  password: 'Пароль',
  confirmPassword: 'Подтвердить пароль',
  firstName: 'Имя',
  lastName: 'Фамилия',
  phoneNumber: 'Номер телефона',
  
  // Chat
  sendMessage: 'Отправить сообщение',
  typeMessage: 'Введите сообщение...',
  online: 'В сети',
  offline: 'Не в сети',
  lastSeen: 'Был в сети',
  typing: 'печатает...',
  read: 'Прочитано',
  delivered: 'Доставлено',
  sent: 'Отправлено',
  
  // Groups
  createGroup: 'Создать группу',
  addMembers: 'Добавить участников',
  groupName: 'Название группы',
  groupDescription: 'Описание группы',
  members: 'Участники',
  leaveGroup: 'Покинуть группу',
  deleteGroup: 'Удалить группу',
  
  // Profile
  editProfile: 'Редактировать профиль',
  changePhoto: 'Изменить фото',
  status: 'Статус',
  about: 'О себе',
  settings: 'Настройки',
  translationSettings: 'Настройки перевода',
  languageSettings: 'Настройки языка',
  
  // Translation
  translate: 'Перевести',
  translating: 'Переводится...',
  translationFailed: 'Ошибка перевода',
  clearTranslationCache: 'Очистить кэш переводов',
  clearCacheConfirm: 'Это удалит все кэшированные переводы и культурные подсказки. Возможно, потребуется перевести некоторые сообщения заново.',
  clearCacheSuccess: 'Кэш переводов очищен',
  clearCacheError: 'Ошибка очистки кэша',
  cancel: 'Отмена',
  clear: 'Очистить',
  success: 'Успешно',
  error: 'Ошибка',
  
  // Voice Messages
  recordVoiceMessage: 'Записать голосовое сообщение',
  playVoiceMessage: 'Воспроизвести голосовое сообщение',
  pauseVoiceMessage: 'Приостановить голосовое сообщение',
  viewTranscription: 'Показать транскрипцию',
  voiceTranscription: 'Транскрипция голоса',
  
  // Notifications
  newMessage: 'Новое сообщение',
  newGroupMessage: 'Новое сообщение группы',
  messageFrom: 'Сообщение от',
  
  // Common
  loading: 'Загрузка...',
  retry: 'Повторить',
  done: 'Готово',
  back: 'Назад',
  next: 'Далее',
  save: 'Сохранить',
  delete: 'Удалить',
  edit: 'Редактировать',
  close: 'Закрыть',
  yes: 'Да',
  no: 'Нет',
  ok: 'ОК',
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
  typeMessage: '메시지를 입력하세요...',
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
  
  // Profile
  editProfile: '프로필 편집',
  changePhoto: '사진 변경',
  status: '상태',
  about: '소개',
  settings: '설정',
  translationSettings: '번역 설정',
  languageSettings: '언어 설정',
  
  // Translation
  translate: '번역',
  translating: '번역 중...',
  translationFailed: '번역 실패',
  clearTranslationCache: '번역 캐시 지우기',
  clearCacheConfirm: '모든 캐시된 번역과 문화적 힌트가 삭제됩니다. 일부 메시지를 다시 번역해야 할 수 있습니다.',
  clearCacheSuccess: '번역 캐시가 지워졌습니다',
  clearCacheError: '캐시 지우기 실패',
  cancel: '취소',
  clear: '지우기',
  success: '성공',
  error: '오류',
  
  // Voice Messages
  recordVoiceMessage: '음성 메시지 녹음',
  playVoiceMessage: '음성 메시지 재생',
  pauseVoiceMessage: '음성 메시지 일시정지',
  viewTranscription: '전사 보기',
  voiceTranscription: '음성 전사',
  
  // Notifications
  newMessage: '새 메시지',
  newGroupMessage: '새 그룹 메시지',
  messageFrom: '메시지 발신자',
  
  // Common
  loading: '로딩 중...',
  retry: '다시 시도',
  done: '완료',
  back: '뒤로',
  next: '다음',
  save: '저장',
  delete: '삭제',
  edit: '편집',
  close: '닫기',
  yes: '예',
  no: '아니오',
  ok: '확인',
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
  read: 'مقروءة',
  delivered: 'تم التسليم',
  sent: 'تم الإرسال',
  
  // Groups
  createGroup: 'إنشاء مجموعة',
  addMembers: 'إضافة أعضاء',
  groupName: 'اسم المجموعة',
  groupDescription: 'وصف المجموعة',
  members: 'الأعضاء',
  leaveGroup: 'مغادرة المجموعة',
  deleteGroup: 'حذف المجموعة',
  
  // Profile
  editProfile: 'تعديل الملف الشخصي',
  changePhoto: 'تغيير الصورة',
  status: 'الحالة',
  about: 'حول',
  settings: 'الإعدادات',
  translationSettings: 'إعدادات الترجمة',
  languageSettings: 'إعدادات اللغة',
  
  // Translation
  translate: 'ترجمة',
  translating: 'جاري الترجمة...',
  translationFailed: 'فشل في الترجمة',
  clearTranslationCache: 'مسح ذاكرة الترجمة',
  clearCacheConfirm: 'سيتم حذف جميع الترجمات والملاحظات الثقافية المحفوظة. قد تحتاج إلى إعادة ترجمة بعض الرسائل.',
  clearCacheSuccess: 'تم مسح ذاكرة الترجمة',
  clearCacheError: 'فشل في مسح الذاكرة',
  cancel: 'إلغاء',
  clear: 'مسح',
  success: 'نجح',
  error: 'خطأ',
  
  // Voice Messages
  recordVoiceMessage: 'تسجيل رسالة صوتية',
  playVoiceMessage: 'تشغيل رسالة صوتية',
  pauseVoiceMessage: 'إيقاف رسالة صوتية مؤقتاً',
  viewTranscription: 'عرض النص',
  voiceTranscription: 'نص صوتي',
  
  // Notifications
  newMessage: 'رسالة جديدة',
  newGroupMessage: 'رسالة مجموعة جديدة',
  messageFrom: 'رسالة من',
  
  // Common
  loading: 'جاري التحميل...',
  retry: 'إعادة المحاولة',
  done: 'تم',
  back: 'رجوع',
  next: 'التالي',
  save: 'حفظ',
  delete: 'حذف',
  edit: 'تعديل',
  close: 'إغلاق',
  yes: 'نعم',
  no: 'لا',
  ok: 'موافق',
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
      this.setLanguage(user.defaultLanguage);
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
