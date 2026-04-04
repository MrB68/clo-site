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
  if (typeof window === "undefined") {
    return {};
  }

  const savedProfiles = localStorage.getItem(CUSTOMER_PROFILES_STORAGE_KEY);
  if (!savedProfiles) {
    return {};
  }

  try {
    const parsedProfiles = JSON.parse(savedProfiles);
    if (!parsedProfiles || typeof parsedProfiles !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedProfiles).map(([userId, profile]) => [
        userId,
        {
          ...(profile as CustomerProfileDetails),
          profileImage:
            typeof (profile as CustomerProfileDetails)?.profileImage === "string"
              ? (profile as CustomerProfileDetails).profileImage
              : "",
        },
      ])
    );
  } catch {
    return {};
  }
}

export function getCustomerProfile(userId: string) {
  return getStoredProfiles()[userId] ?? null;
}

export function getCustomerProfileByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  return (
    Object.values(getStoredProfiles()).find(
      (profile) => profile.email.trim().toLowerCase() === normalizedEmail
    ) ?? null
  );
}

export function saveCustomerProfile(userId: string, profile: CustomerProfileDetails) {
  if (typeof window === "undefined") {
    return;
  }

  const profiles = getStoredProfiles();
  profiles[userId] = profile;
  localStorage.setItem(CUSTOMER_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  window.dispatchEvent(new Event("customerProfileUpdated"));
}
