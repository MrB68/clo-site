import { useEffect, useState } from "react";
import { BadgePercent, Plus, TicketPercent, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  defaultPromoCodes,
  getPromoCodes,
  savePromoCodes,
  type DiscountOption,
} from "../../utils/promoCodes";
import { addRecycleBinItem, appendAdminAuditLog, getAdminSession } from "../../utils/admin";

interface PromoCodeForm {
  code: string;
  label: string;
  description: string;
  type: DiscountOption["type"];
  value: string;
  showInCheckout: "yes" | "no";
}

const initialForm: PromoCodeForm = {
  code: "",
  label: "",
  description: "",
  type: "percent",
  value: "",
  showInCheckout: "yes",
};

export function PromoCodeManagement() {
  const adminSession = getAdminSession();
  const [promoCodes, setPromoCodes] = useState<DiscountOption[]>(() => getPromoCodes());
  const [form, setForm] = useState<PromoCodeForm>(initialForm);

  useEffect(() => {
    const syncPromoCodes = () => {
      setPromoCodes(getPromoCodes());
    };

    window.addEventListener("promoCodesUpdated", syncPromoCodes);
    window.addEventListener("storage", syncPromoCodes);

    return () => {
      window.removeEventListener("promoCodesUpdated", syncPromoCodes);
      window.removeEventListener("storage", syncPromoCodes);
    };
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAddPromoCode = (event: React.FormEvent) => {
    event.preventDefault();

    const code = form.code.trim().toUpperCase();
    const label = form.label.trim();
    const description = form.description.trim();
    const parsedValue = Number(form.value);

    if (!code || !label || !description) {
      toast.error("Fill in all promo code fields");
      return;
    }

    if (form.type !== "shipping" && (!Number.isFinite(parsedValue) || parsedValue <= 0)) {
      toast.error("Enter a valid discount value");
      return;
    }

    if (promoCodes.some((promoCode) => promoCode.code === code)) {
      toast.error("Promo code already exists");
      return;
    }

    const nextPromoCodes = [
      {
        code,
        label,
        description,
        type: form.type,
        value: form.type === "shipping" ? 0 : parsedValue,
        showInCheckout: form.showInCheckout === "yes",
      },
      ...promoCodes,
    ];

    setPromoCodes(nextPromoCodes);
    savePromoCodes(nextPromoCodes);
    setForm({ ...initialForm });
    if (adminSession) {
      appendAdminAuditLog({
        adminId: adminSession.id,
        adminName: adminSession.name,
        adminEmail: adminSession.email,
        branch: adminSession.branch,
        action: "added",
        entityType: "promo-code",
        entityName: code,
        details: `Created ${form.type} promo code.`,
      });
    }
    toast.success("Promo code added");
  };

  const handleRemovePromoCode = (code: string) => {
    const removedPromoCode = promoCodes.find((promoCode) => promoCode.code === code);
    const nextPromoCodes = promoCodes.filter((promoCode) => promoCode.code !== code);
    setPromoCodes(nextPromoCodes);
    savePromoCodes(nextPromoCodes);
    if (removedPromoCode && adminSession) {
      addRecycleBinItem({
        entityType: "promoCode",
        entityId: removedPromoCode.code,
        entityName: removedPromoCode.code,
        payload: removedPromoCode,
        deletedByName: adminSession.name,
        deletedByEmail: adminSession.email,
        branch: adminSession.branch,
      });
      appendAdminAuditLog({
        adminId: adminSession.id,
        adminName: adminSession.name,
        adminEmail: adminSession.email,
        branch: adminSession.branch,
        action: "deleted",
        entityType: "promo-code",
        entityName: removedPromoCode.code,
        details: `Moved promo code to recycle bin.`,
      });
    }
    toast.success("Promo code removed");
  };

  const handleToggleVisibility = (code: string) => {
    const nextPromoCodes = promoCodes.map((promoCode) =>
      promoCode.code === code
        ? { ...promoCode, showInCheckout: !promoCode.showInCheckout }
        : promoCode
    );
    setPromoCodes(nextPromoCodes);
    savePromoCodes(nextPromoCodes);
    const updatedPromoCode = nextPromoCodes.find((promoCode) => promoCode.code === code);
    if (updatedPromoCode && adminSession) {
      appendAdminAuditLog({
        adminId: adminSession.id,
        adminName: adminSession.name,
        adminEmail: adminSession.email,
        branch: adminSession.branch,
        action: updatedPromoCode.showInCheckout ? "showed" : "hid",
        entityType: "promo-code",
        entityName: updatedPromoCode.code,
        details: `Updated checkout visibility.`,
      });
    }
    toast.success("Promo code visibility updated");
  };

  const handleResetDefaults = () => {
    setPromoCodes(defaultPromoCodes);
    savePromoCodes(defaultPromoCodes);
    toast.success("Default promo codes restored");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-widest uppercase">
            Promo Code Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Review available promo codes, add new ones, or remove old offers.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetDefaults}
          className="border border-black px-4 py-2 text-sm font-medium uppercase tracking-wider transition hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
        >
          Restore Defaults
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-100 p-3">
                  <TicketPercent size={22} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wider text-gray-600">
                    Available Codes
                  </p>
                  <p className="text-2xl font-bold">{promoCodes.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-100 p-3">
                  <BadgePercent size={22} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wider text-gray-600">
                    Percentage Deals
                  </p>
                  <p className="text-2xl font-bold">
                    {promoCodes.filter((promoCode) => promoCode.showInCheckout).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-purple-100 p-3">
                  <Plus size={22} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wider text-gray-600">
                    Hidden Codes
                  </p>
                  <p className="text-2xl font-bold">
                    {promoCodes.filter((promoCode) => !promoCode.showInCheckout).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold">Available Promo Codes</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {promoCodes.map((promoCode) => (
                <div
                  key={promoCode.code}
                  className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                >
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-semibold tracking-wider">{promoCode.code}</p>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs uppercase tracking-wider text-gray-700">
                          {promoCode.type}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs uppercase tracking-wider ${
                            promoCode.showInCheckout
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {promoCode.showInCheckout ? "Visible In Checkout" : "Hidden Manual Only"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-gray-900">{promoCode.label}</p>
                      <p className="text-sm text-gray-600">{promoCode.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-medium text-gray-700">
                      {promoCode.type === "percent"
                        ? `${promoCode.value}% off`
                        : promoCode.type === "flat"
                          ? `Rs. ${promoCode.value} off`
                          : "Free shipping"}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(promoCode.code)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
                    >
                      {promoCode.showInCheckout ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemovePromoCode(promoCode.code)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm h-fit">
          <h3 className="text-lg font-semibold">Add Promo Code</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Create a new checkout discount for customers.
          </p>

          <form onSubmit={handleAddPromoCode} className="mt-6 space-y-4">
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="Code"
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            <input
              type="text"
              name="label"
              value={form.label}
              onChange={handleChange}
              placeholder="Label"
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
            >
              <option value="percent">Percentage Discount</option>
              <option value="flat">Flat Discount</option>
              <option value="shipping">Free Shipping</option>
            </select>
            <input
              type="number"
              min="0"
              name="value"
              value={form.value}
              onChange={handleChange}
              placeholder={form.type === "percent" ? "Percentage value" : "Discount value"}
              disabled={form.type === "shipping"}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black disabled:bg-gray-100"
            />
            <select
              name="showInCheckout"
              value={form.showInCheckout}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black bg-white"
            >
              <option value="yes">Show in checkout suggestions</option>
              <option value="no">Keep hidden for manual entry only</option>
            </select>
            <button
              type="submit"
              className="w-full bg-black py-3 text-sm font-medium uppercase tracking-wider text-white hover:bg-gray-900 transition"
            >
              Add Promo Code
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
