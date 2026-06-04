export type UserRole = "customer" | "owner" | "manager" | "inventory" | "employee";

export type Permission =
  | "products.read"
  | "products.write"
  | "inventory.read"
  | "inventory.write"
  | "orders.read"
  | "orders.write"
  | "pickups.read"
  | "pickups.write"
  | "customers.read"
  | "reviews.moderate"
  | "clover.read"
  | "clover.sync"
  | "settings.write";

export const customerRoles: UserRole[] = ["customer"];
export const employeeRoles: UserRole[] = ["owner", "manager", "inventory", "employee"];

export const rolePermissions: Record<UserRole, Permission[]> = {
  customer: [],
  owner: [
    "products.read",
    "products.write",
    "inventory.read",
    "inventory.write",
    "orders.read",
    "orders.write",
    "pickups.read",
    "pickups.write",
    "customers.read",
    "reviews.moderate",
    "clover.read",
    "clover.sync",
    "settings.write",
  ],
  manager: [
    "products.read",
    "products.write",
    "inventory.read",
    "inventory.write",
    "orders.read",
    "orders.write",
    "pickups.read",
    "pickups.write",
    "customers.read",
    "reviews.moderate",
    "clover.read",
    "clover.sync",
  ],
  inventory: [
    "products.read",
    "inventory.read",
    "inventory.write",
    "orders.read",
    "pickups.read",
  ],
  employee: [
    "products.read",
    "inventory.read",
    "orders.read",
    "orders.write",
    "pickups.read",
    "pickups.write",
    "customers.read",
  ],
};

export function isEmployeeRole(role: string | undefined): role is Exclude<UserRole, "customer"> {
  return Boolean(role && employeeRoles.includes(role as UserRole));
}

export function isCustomerRole(role: string | undefined): role is "customer" {
  return role === "customer";
}

export function roleHasPermission(role: UserRole, permission: Permission) {
  return rolePermissions[role].includes(permission);
}
