export interface CustomerProfileDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  province: string;
  district: string;
  city: string;
  area: string;
  wardNumber: string;
  landmark: string;
  address: string;
  postalCode: string;
  profileImage?: string;
}

const CUSTOMER_PROFILES_STORAGE_KEY = "customerProfiles";

function getStoredProfiles(): Record<string, CustomerProfileDetails> {
  if (typeof window === "undefined") return {};

  const savedProfiles = localStorage.getItem(CUSTOMER_PROFILES_STORAGE_KEY);
  if (!savedProfiles) return {};

  try {
    const parsed = JSON.parse(savedProfiles);
    if (!parsed || typeof parsed !== "object") return {};

    return parsed;
  } catch {
    return {};
  }
}

export function getCustomerProfile(userId: string) {
  return getStoredProfiles()[userId] ?? null;
}

export function getCustomerProfileByEmail(email?: string) {
  if (!email || typeof email !== "string") return null;

  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  return (
    Object.values(getStoredProfiles()).find(
      (p) =>
        p?.email &&
        p.email.trim().toLowerCase() === normalized
    ) ?? null
  );
}

export function saveCustomerProfile(
  userId: string,
  profile: CustomerProfileDetails
) {
  if (typeof window === "undefined") return;

  const profiles = getStoredProfiles();
  profiles[userId] = profile;

  localStorage.setItem(
    CUSTOMER_PROFILES_STORAGE_KEY,
    JSON.stringify(profiles)
  );

  window.dispatchEvent(new Event("customerProfileUpdated"));
}