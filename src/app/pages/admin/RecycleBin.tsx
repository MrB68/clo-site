import { useEffect, useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { appendAdminAuditLog, getAdminSession } from "../../utils/admin";
import { supabase } from "../../../lib/supabase";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RecycleBin() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("recycle_bin")
        .select("*")
        .order("deleted_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch recycle bin:", error);
        return;
      }

      setItems(data || []);
    };

    fetchItems();
  }, []);

  const handleRestore = async (item: any) => {
    try {
      if (item.entity_type === "product") {
        await supabase.from("products").insert([item.payload]);
      }

      if (item.entity_type === "promoCode") {
        await supabase.from("promo_codes").insert([item.payload]);
      }

      await supabase.from("recycle_bin").delete().eq("id", item.id);

      const adminSession = getAdminSession();
      if (adminSession) {
        appendAdminAuditLog({
          adminId: adminSession.id,
          adminName: adminSession.name,
          adminEmail: adminSession.email,
          branch: adminSession.branch,
          action: "restored",
          entityType: item.entity_type,
          entityName: item.entity_name,
          details: "Recovered from recycle bin.",
        });
      }

      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(`${item.entity_name} restored`);
    } catch (err) {
      console.error(err);
      toast.error("Restore failed");
    }
  };

  const handlePermanentDelete = async (item: any) => {
    await supabase.from("recycle_bin").delete().eq("id", item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    toast.success(`${item.entity_name} removed permanently`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-widest uppercase">
            Recycle Bin
          </h2>
          <p className="text-sm text-gray-600">
            Restore deleted products and promo codes if something was removed by mistake.
          </p>
        </div>
        <div className="text-sm tracking-wider text-gray-600">
          {items.length} recoverable item{items.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        {items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Trash2 size={40} className="mx-auto text-gray-400" />
            <p className="mt-4 text-lg font-medium">Recycle bin is empty</p>
            <p className="mt-2 text-sm text-gray-600">
              Deleted products and promo codes will appear here for recovery.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold tracking-wider">{item.entity_name}</p>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs uppercase tracking-wider text-gray-700">
                      {item.entity_type}
                    </span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs uppercase tracking-wider text-amber-700">
                      {item.branch || "main"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Deleted by {item.deleted_by} ({item.deleted_by})
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(item.deleted_at)}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleRestore(item)}
                    className="inline-flex items-center gap-2 border border-black px-4 py-2 text-sm font-medium uppercase tracking-wider transition hover:bg-black hover:text-white"
                  >
                    <RotateCcw size={16} />
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePermanentDelete(item)}
                    className="inline-flex items-center gap-2 border border-red-300 px-4 py-2 text-sm font-medium uppercase tracking-wider text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
