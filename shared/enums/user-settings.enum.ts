export enum ECurrency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CAD = 'CAD',
  AUD = 'AUD',
  JPY = 'JPY',
  CHF = 'CHF',
  CNY = 'CNY',
  INR = 'INR',
  BRL = 'BRL',
}

export enum EDateFormat {
  MM_DD_YYYY = 'MM/DD/YYYY',
  DD_MM_YYYY = 'DD/MM/YYYY',
  YYYY_MM_DD = 'YYYY-MM-DD',
  DD_MMM_YYYY = 'DD MMM YYYY',
  MMM_DD_YYYY = 'MMM DD, YYYY',
}

export enum ETimeFormat {
  TWELVE_HOUR = '12h',
  TWENTY_FOUR_HOUR = '24h',
}

export enum ETimezone {
  UTC = 'UTC',
  EST = 'America/New_York',
  PST = 'America/Los_Angeles',
  CST = 'America/Chicago',
  MST = 'America/Denver',
  GMT = 'Europe/London',
  CET = 'Europe/Paris',
  JST = 'Asia/Tokyo',
  IST = 'Asia/Kolkata',
  AEST = 'Australia/Sydney',
}

export enum ENotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum ENotificationFrequency {
  IMMEDIATE = 'immediate',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  NEVER = 'never',
}

export enum ENotificationType {
  SESSION_REMINDER = 'session_reminder',
  BILLING_DUE = 'billing_due',
  PAYMENT_RECEIVED = 'payment_received',
  CLIENT_BOOKING = 'client_booking',
  TRAINER_AVAILABILITY = 'trainer_availability',
  SYSTEM_UPDATE = 'system_update',
  SECURITY_ALERT = 'security_alert',
  MARKETING = 'marketing',
}
