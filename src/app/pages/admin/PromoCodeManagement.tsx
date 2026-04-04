import { useEffect, useState } from "react";
import { BadgePercent, Plus, TicketPercent, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAdminSession } from "../../utils/admin";
import { supabase } from "../../../lib/supabase";

type DiscountOption = {
  code: string;
  label: string;
  description: string;
  type: "percent" | "flat" | "shipping";
  value: number;
  showInCheckout: boolean;
  expiryDate?: string;
  usageLimit?: number | null;
  usedCount?: number | null;
};

interface PromoCodeForm {
  code: string;
  label: string;
  description: string;
  type: DiscountOption["type"];
  value: string;
  showInCheckout: "yes" | "no";
  expiryDate: string;
  usageLimit: string;
}

const initialForm: PromoCodeForm = {
  code: "",
  label: "",
  description: "",
  type: "percent",
  value: "",
  showInCheckout: "yes",
  expiryDate: "",
  usageLimit: "",
};

export function PromoCodeManagement() {
  const adminSession = getAdminSession();
  const [promoCodes, setPromoCodes] = useState<DiscountOption[]>([]);
  const [form, setForm] = useState<PromoCodeForm>(initialForm);

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);

    setPromoCodes((data || []).map((p: any) => ({
      code: p.code,
      label: p.label,
      description: p.description,
      type: p.type,
      value: p.value,
      showInCheckout: p.show_in_checkout,
      expiryDate: p.expiry_date,
      usageLimit: p.usage_limit,
      usedCount: p.used_count,
    })));
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAddPromoCode = async (event: React.FormEvent) => {
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

    const { error } = await supabase.from("promo_codes").insert([
      {
        code,
        label,
        description,
        type: form.type,
        value: form.type === "shipping" ? 0 : parsedValue,
        show_in_checkout: form.showInCheckout === "yes",
        expiry_date: form.expiryDate || null,
        usage_limit: form.usageLimit ? Number(form.usageLimit) : null,
        used_count: 0,
      },
    ]);

    if (error) {
      toast.error("Failed to add promo code");
      return;
    }

    await fetchPromoCodes();
    setForm({ ...initialForm });
  };

  const handleRemovePromoCode = async (promo: DiscountOption) => {
    try {
      // 1. insert into recycle_bin
      await supabase.from("recycle_bin").insert([
        {
          entity_type: "promoCode",
          entity_name: promo.code,
          payload: promo,
          deleted_by: adminSession?.email || "admin",
        },
      ]);

      // 2. delete from promo_codes
      await supabase.from("promo_codes").delete().eq("code", promo.code);

      // 3. update UI
      setPromoCodes((prev) => prev.filter((p) => p.code !== promo.code));

      toast.success("Promo moved to recycle bin");
    } catch (error) {
      console.error(error);
      toast.error("Delete failed");
    }
  };

  const handleToggleVisibility = async (code: string) => {
    const current = promoCodes.find((p) => p.code === code);
    if (!current) return;

    const { error } = await supabase
      .from("promo_codes")
      .update({ show_in_checkout: !current.showInCheckout })
      .eq("code", code);

    if (!error) {
      await fetchPromoCodes();
    }
  };

  const handleResetDefaults = async () => {
    await supabase.from("promo_codes").delete().neq("code", "");
    await fetchPromoCodes();
    toast.success("Promo codes cleared");
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
                      <p className="text-xs text-gray-500">
                        Used: {promoCode.usedCount || 0} / {promoCode.usageLimit || "∞"}
                      </p>
                      {promoCode.expiryDate && (
                        <p className="text-xs text-gray-500">
                          Expires: {new Date(promoCode.expiryDate).toLocaleDateString()}
                        </p>
                      )}
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
                      onClick={() => handleRemovePromoCode(promoCode)}
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
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
            <input
              type="number"
              name="usageLimit"
              value={form.usageLimit}
              onChange={handleChange}
              placeholder="Usage Limit"
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
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
