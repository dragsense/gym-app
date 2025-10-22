export enum EUserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TRAINER = 'TRAINER',
  CLIENT = 'CLIENT',
  USER = 'USER',
}

export const EUserLevels = {
  [EUserRole.SUPER_ADMIN]: 0,
  [EUserRole.ADMIN]: 1,
  [EUserRole.TRAINER]: 2,
  [EUserRole.CLIENT]: 3,
  [EUserRole.USER]: 4,
};

export enum EUserGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum EUserSkill {
  JAVASCRIPT = 'JavaScript',
  TYPESCRIPT = 'TypeScript',
  PYTHON = 'Python',
  JAVA = 'Java',
  REACT = 'React',
  ANGULAR = 'Angular',
  VUE = 'Vue',
  NODE = 'Node.js',
  DOCKER = 'Docker',
  KUBERNETES = 'Kubernetes',
}
