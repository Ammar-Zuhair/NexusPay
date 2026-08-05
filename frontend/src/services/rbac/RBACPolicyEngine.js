/**
 * RBACPolicyEngine.js - Role-Based Access Control & Policy Engine
 * Roles: Super Admin, Finance Manager, Support Agent, Operations Manager, Developer, Analyst
 */

class RBACPolicyEngineImpl {
  constructor() {
    this.roles = {
      SUPER_ADMIN: { name: 'Super Admin', permissions: ['*'] },
      FINANCE_MANAGER: { name: 'Finance Manager', permissions: ['wallet:read', 'wallet:write', 'ledger:read', 'reports:read', 'refund:approve'] },
      SUPPORT_AGENT: { name: 'Support Agent', permissions: ['orders:read', 'orders:retry', 'dlq:read', 'customers:read'] },
      OPERATIONS_MANAGER: { name: 'Operations Manager', permissions: ['providers:manage', 'routing:manage', 'circuit:manage', 'inventory:manage'] },
      DEVELOPER: { name: 'Developer', permissions: ['logs:read', 'api:read', 'config:read', 'tracing:read'] },
      ANALYST: { name: 'Analyst', permissions: ['analytics:read', 'reports:read'] }
    };
  }

  hasPermission(roleCode, requiredPermission) {
    const role = this.roles[roleCode];
    if (!role) return false;
    if (role.permissions.includes('*')) return true;
    return role.permissions.includes(requiredPermission);
  }

  getRoleMatrix() {
    return this.roles;
  }
}

export const RBACPolicyEngine = new RBACPolicyEngineImpl();
