export enum EUserRole {
  ADMIN = 'ADMIN',
  TRAINER = 'TRAINER',
  CLIENT = 'CLIENT',
  USER = 'USER',
}

export const EUserLevels = {
  [EUserRole.ADMIN]: 0,
  [EUserRole.TRAINER]: 1,
  [EUserRole.CLIENT]: 2,
  [EUserRole.USER]: 3,
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
