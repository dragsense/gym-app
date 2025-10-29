export enum EUserLevels {
  SUPER_ADMIN = 0,
  ADMIN = 1,
  TRAINER = 2,
  CLIENT = 3,
  USER = 4,
}

export enum EUserGender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
  PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

export enum SignupUserLevel {
  TRAINER = EUserLevels.TRAINER,
  ADMIN = EUserLevels.ADMIN,
}
