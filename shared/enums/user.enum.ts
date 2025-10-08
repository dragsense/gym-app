export enum EUserRole {
  USER = 'USER',
}

export const EUserLevels = {
  [EUserRole.USER]: 0,
};

export enum EUserGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}
