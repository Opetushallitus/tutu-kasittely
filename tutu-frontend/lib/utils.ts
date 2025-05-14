export const hasTutuRole = (userRoles?: Array<string>) => {
  return userRoles?.includes('ROLE_APP_TUTU_ESITTELIJA');
};
