export enum ESessionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum ESessionType {
  PERSONAL = 'PERSONAL',
  GROUP = 'GROUP',
  CLASS = 'CLASS',
  WORKSHOP = 'WORKSHOP',
}

export enum ESessionRecurrence {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}
