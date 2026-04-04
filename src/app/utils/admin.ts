import { supabase } from "../../lib/supabase";

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  branch: string;
}

export interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: string;
  branch: string;
  lastLoginAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  branch: string;
  action: string;
  entityType: string;
  entityName: string;
  details?: string;
  createdAt: string;
}

export interface RecycleBinItem {
  id: string;
  entityType: "product" | "promoCode";
  entityId: string;
  entityName: string;
  payload: unknown;
  deletedAt: string;
  deletedByName: string;
  deletedByEmail: string;
  branch: string;
}

const ADMIN_ACCOUNTS_KEY = "adminAccounts";
const ADMIN_SESSION_KEY = "adminSession";
const ADMIN_AUDIT_LOGS_KEY = "adminAuditLogs";
const ADMIN_RECYCLE_BIN_KEY = "adminRecycleBin";

const defaultAdminAccounts: AdminAccount[] = [
  {
    id: "admin-hq-1",
    name: "CLO Super Admin",
    email: "admin@clo.demo",
    password: "admin123",
    role: "Platform Administrator",
    branch: "Head Office",
  },
  {
    id: "admin-bagmati-1",
    name: "Bagmati Branch Manager",
    email: "bagmati@clo.demo",
    password: "bagmati123",
    role: "Branch Manager",
    branch: "Bagmati Branch",
  },
  {
    id: "admin-gandaki-1",
    name: "Gandaki Branch Manager",
    email: "gandaki@clo.demo",
    password: "gandaki123",
    role: "Branch Manager",
    branch: "Gandaki Branch",
  },
];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = localStorage.getItem(key);
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

export function getAdminAccounts() {
  const savedAccounts = readJson<AdminAccount[]>(ADMIN_ACCOUNTS_KEY, []);
  if (savedAccounts.length > 0) {
    return savedAccounts;
  }

  writeJson(ADMIN_ACCOUNTS_KEY, defaultAdminAccounts);
  return defaultAdminAccounts;
}

export function authenticateAdmin(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return getAdminAccounts().find(
    (account) =>
      account.email.toLowerCase() === normalizedEmail &&
      account.password === password
  ) ?? null;
}

export function createAdminSession(account: AdminAccount): AdminSession {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    branch: account.branch,
    lastLoginAt: new Date().toISOString(),
  };
}

export function getAdminSession() {
  return readJson<AdminSession | null>(ADMIN_SESSION_KEY, null);
}

export function saveAdminSession(session: AdminSession) {
  writeJson(ADMIN_SESSION_KEY, session);
  if (typeof window !== "undefined") {
    localStorage.setItem("adminAuthenticated", "true");
  }
}

export function clearAdminSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem("adminAuthenticated");
}

export async function getAdminAuditLogs() {
  const { data, error } = await supabase
    .from("admin_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}

export async function appendAdminAuditLog(
  entry: Omit<AdminAuditLog, "id" | "createdAt">
) {
  const { error } = await supabase.from("admin_logs").insert([
    {
      admin_id: entry.adminId,
      admin_name: entry.adminName,
      admin_email: entry.adminEmail,
      branch: entry.branch,
      action: entry.action,
      entity_type: entry.entityType,
      entity_name: entry.entityName,
      details: entry.details,
    },
  ]);

  if (error) {
    console.error("Failed to save admin log:", error);
  }
}

export function getRecycleBinItems() {
  return readJson<RecycleBinItem[]>(ADMIN_RECYCLE_BIN_KEY, []);
}

export function addRecycleBinItem(
  item: Omit<RecycleBinItem, "id" | "deletedAt">
) {
  const nextItem: RecycleBinItem = {
    ...item,
    id: `recycle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    deletedAt: new Date().toISOString(),
  };

  const recycleBin = getRecycleBinItems();
  writeJson(ADMIN_RECYCLE_BIN_KEY, [nextItem, ...recycleBin]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("adminRecycleBinUpdated"));
  }
}

export function removeRecycleBinItem(itemId: string) {
  const recycleBin = getRecycleBinItems().filter((item) => item.id !== itemId);
  writeJson(ADMIN_RECYCLE_BIN_KEY, recycleBin);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("adminRecycleBinUpdated"));
  }
}
