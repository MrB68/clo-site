export interface DiscountOption {
  code: string;
  label: string;
  description: string;
  type: "percent" | "flat" | "shipping";
  value: number;
  showInCheckout: boolean;
}

interface StoredDiscountOption {
  code?: string;
  label?: string;
  description?: string;
  type?: string;
  value?: number;
  showInCheckout?: boolean;
}

const PROMO_CODES_STORAGE_KEY = "adminPromoCodes";

export const defaultPromoCodes: DiscountOption[] = [
  {
    code: "WELCOME10",
    label: "Welcome 10%",
    description: "10% off your order",
    type: "percent",
    value: 10,
    showInCheckout: true,
  },
  {
    code: "SAVE500",
    label: "Save Rs. 500",
    description: "Flat Rs. 500 off",
    type: "flat",
    value: 500,
    showInCheckout: true,
  },
  {
    code: "FREESHIP",
    label: "Free Shipping",
    description: "Shipping charge removed",
    type: "shipping",
    value: 0,
    showInCheckout: true,
  },
];

export function getPromoCodes(): DiscountOption[] {
  if (typeof window === "undefined") {
    return defaultPromoCodes;
  }

  const savedPromoCodes = localStorage.getItem(PROMO_CODES_STORAGE_KEY);
  if (!savedPromoCodes) {
    return defaultPromoCodes;
  }

  try {
    const parsedPromoCodes = JSON.parse(savedPromoCodes);
    if (!Array.isArray(parsedPromoCodes)) {
      return defaultPromoCodes;
    }

    const normalizedPromoCodes = parsedPromoCodes
      .map((promoCode: StoredDiscountOption) => {
        if (
          !promoCode ||
          typeof promoCode.code !== "string" ||
          typeof promoCode.label !== "string" ||
          typeof promoCode.description !== "string" ||
          (promoCode.type !== "percent" &&
            promoCode.type !== "flat" &&
            promoCode.type !== "shipping") ||
          typeof promoCode.value !== "number"
        ) {
          return null;
        }

        return {
          code: promoCode.code,
          label: promoCode.label,
          description: promoCode.description,
          type: promoCode.type,
          value: promoCode.value,
          showInCheckout:
            typeof promoCode.showInCheckout === "boolean"
              ? promoCode.showInCheckout
              : true,
        };
      })
      .filter((promoCode): promoCode is DiscountOption => promoCode !== null);

    return normalizedPromoCodes.length > 0 ? normalizedPromoCodes : defaultPromoCodes;
  } catch {
    return defaultPromoCodes;
  }
}

export function savePromoCodes(promoCodes: DiscountOption[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(PROMO_CODES_STORAGE_KEY, JSON.stringify(promoCodes));
  window.dispatchEvent(new Event("promoCodesUpdated"));
}
