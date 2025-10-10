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
