export interface CustomDesignAttachment {
  name: string;
  type: string;
  dataUrl: string;
}

export interface CustomDesignSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  productType: string;
  quantity: number;
  message: string;
  file: CustomDesignAttachment | null;
  status: "new" | "reviewed" | "contacted" | "completed";
  createdAt: string;
}

const CUSTOM_DESIGNS_STORAGE_KEY = "customDesignSubmissions";

export function getCustomDesignSubmissions(): CustomDesignSubmission[] {
  if (typeof window === "undefined") {
    return [];
  }

  const savedSubmissions = localStorage.getItem(CUSTOM_DESIGNS_STORAGE_KEY);
  if (!savedSubmissions) {
    return [];
  }

  try {
    const parsedSubmissions = JSON.parse(savedSubmissions);
    return Array.isArray(parsedSubmissions) ? parsedSubmissions : [];
  } catch {
    return [];
  }
}

export function saveCustomDesignSubmissions(
  submissions: CustomDesignSubmission[]
) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    CUSTOM_DESIGNS_STORAGE_KEY,
    JSON.stringify(submissions)
  );
  window.dispatchEvent(new Event("customDesignSubmissionsUpdated"));
}

export function appendCustomDesignSubmission(
  submission: CustomDesignSubmission
) {
  const existingSubmissions = getCustomDesignSubmissions();
  saveCustomDesignSubmissions([submission, ...existingSubmissions]);
}

// Future API integration:
// Replace these localStorage operations with backend calls when custom design requests move to a server.
