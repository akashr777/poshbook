import type { UserRole } from '../types/app';

export const Permission = {
  USERS_LIST: 'users.list',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_READ_SELF: 'users.read.self',

  VEHICLES_LIST: 'vehicles.list',
  VEHICLES_READ: 'vehicles.read',
  VEHICLES_CREATE: 'vehicles.create',
  VEHICLES_UPDATE: 'vehicles.update',
  VEHICLES_DELETE: 'vehicles.delete',

  DAYBOOK_LIST: 'daybook.list',
  DAYBOOK_READ: 'daybook.read',
  DAYBOOK_CREATE: 'daybook.create',
  DAYBOOK_UPDATE: 'daybook.update',
  DAYBOOK_DELETE: 'daybook.delete',
  DAYBOOK_REPORTS: 'daybook.reports',

  VENDORS_LIST: 'vendors.list',
  VENDORS_VIEW: 'vendors.view',
  VENDORS_READ: 'vendors.read',
  VENDORS_CREATE: 'vendors.create',
  VENDORS_UPDATE: 'vendors.update',
  VENDORS_DELETE: 'vendors.delete',

  FUNDERS_VIEW: 'funders.view',
  FUNDERS_CREATE: 'funders.create',
  FUNDERS_UPDATE: 'funders.update',
  FUNDERS_DELETE: 'funders.delete',

  EXPENSES_VIEW: 'expenses.view',
  EXPENSES_CREATE: 'expenses.create',

  SALARIES_VIEW: 'salaries.view',
  SALARIES_CREATE: 'salaries.create',

  PAYMENTS_CREATE: 'payments.create',

  REPORTS_VIEW: 'reports.view',
  DASHBOARD_VIEW: 'dashboard.view',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  admin: [
    Permission.USERS_LIST,
    Permission.USERS_CREATE,
    Permission.USERS_UPDATE,
    Permission.USERS_DELETE,
    Permission.USERS_READ_SELF,

    Permission.VEHICLES_LIST,
    Permission.VEHICLES_READ,
    Permission.VEHICLES_CREATE,
    Permission.VEHICLES_UPDATE,
    Permission.VEHICLES_DELETE,

    Permission.DAYBOOK_LIST,
    Permission.DAYBOOK_READ,
    Permission.DAYBOOK_CREATE,
    Permission.DAYBOOK_UPDATE,
    Permission.DAYBOOK_DELETE,
    Permission.DAYBOOK_REPORTS,

    Permission.VENDORS_LIST,
    Permission.VENDORS_VIEW,
    Permission.VENDORS_READ,
    Permission.VENDORS_CREATE,
    Permission.VENDORS_UPDATE,
    Permission.VENDORS_DELETE,

    Permission.FUNDERS_VIEW,
    Permission.FUNDERS_CREATE,
    Permission.FUNDERS_UPDATE,
    Permission.FUNDERS_DELETE,

    Permission.EXPENSES_VIEW,
    Permission.EXPENSES_CREATE,

    Permission.SALARIES_VIEW,
    Permission.SALARIES_CREATE,

    Permission.PAYMENTS_CREATE,

    Permission.REPORTS_VIEW,
    Permission.DASHBOARD_VIEW,
  ],
  user: [Permission.USERS_READ_SELF, Permission.DASHBOARD_VIEW],
  staff: [
    Permission.USERS_READ_SELF,
    Permission.VEHICLES_LIST,
    Permission.VEHICLES_READ,
    Permission.VENDORS_LIST,
    Permission.VENDORS_VIEW,
    Permission.FUNDERS_VIEW,
    Permission.EXPENSES_VIEW,
    Permission.SALARIES_VIEW,
    Permission.DASHBOARD_VIEW,
  ],

  partner: [Permission.VENDORS_LIST, Permission.VENDORS_VIEW, Permission.VENDORS_READ],
  funder: [Permission.FUNDERS_VIEW, Permission.DASHBOARD_VIEW]
};

export function getPermissionsForRole(role: UserRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission);
}
