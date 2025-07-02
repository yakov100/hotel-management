export function getPermissionsByRole(role) {
  switch (role) {
    case 'owner':
      return ['read', 'write', 'delete', 'manage_users', 'manage_settings'];
    case 'manager':
      return ['read', 'write', 'delete'];
    case 'member':
      return ['read', 'write'];
    default:
      return ['read'];
  }
}

export const ROLE_NAMES = {
  owner: 'בעלים',
  manager: 'מנהל',
  member: 'חבר'
};

export const PERMISSION_NAMES = {
  read: 'קריאה',
  write: 'כתיבה',
  delete: 'מחיקה',
  manage_users: 'ניהול משתמשים',
  manage_settings: 'ניהול הגדרות'
}; 