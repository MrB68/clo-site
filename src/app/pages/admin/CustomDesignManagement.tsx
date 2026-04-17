import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Eye, FileImage, Mail, MessageSquare, Phone, Palette } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export function CustomDesignManagement() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  useEffect(() => {
    const fetchDesigns = async () => {
      const { data, error } = await supabase
        .from("custom_designs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) {
        setSubmissions(data || []);
      }
    };

    fetchDesigns();
  }, []);

  const updateSubmissionStatus = async (submissionId: string, status: string) => {
    const { error } = await supabase
      .from("custom_designs")
      .update({ status })
      .eq("id", submissionId);

    if (!error) {
      const { data } = await supabase
        .from("custom_designs")
        .select("*")
        .order("created_at", { ascending: false });

      setSubmissions(data || []);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700";
      case "reviewed":
        return "bg-amber-100 text-amber-700";
      case "contacted":
        return "bg-purple-100 text-purple-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-widest uppercase">
            Custom Design Requests
          </h2>
          <p className="text-sm text-gray-600">
            Review customer-submitted custom design files and contact details.
          </p>
        </div>
        <div className="text-sm tracking-wider text-gray-600">
          {submissions.length} submission{submissions.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <Palette size={20} className="text-blue-700" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-600">Total</p>
              <p className="text-2xl font-bold">{submissions.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-amber-100 p-3">
              <MessageSquare size={20} className="text-amber-700" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-600">New</p>
              <p className="text-2xl font-bold">
                {submissions.filter((submission) => submission.status === "new").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3">
              <Mail size={20} className="text-purple-700" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-600">Contacted</p>
              <p className="text-2xl font-bold">
                {submissions.filter((submission) => submission.status === "contacted").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-100 p-3">
              <CheckCircle2 size={20} className="text-green-700" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-600">Completed</p>
              <p className="text-2xl font-bold">
                {submissions.filter((submission) => submission.status === "completed").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow-sm overflow-hidden">
        {submissions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex flex-col gap-4 px-6 py-5 xl:flex-row xl:items-center xl:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold tracking-wider">{submission.id}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider ${getStatusColor(
                        submission.status
                      )}`}
                    >
                      {submission.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{submission.name}</p>
                  <p className="text-sm text-gray-600">
                    {submission.product_type} x {submission.quantity}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(submission.created_at)}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <select
                    value={submission.status}
                    onChange={(event) =>
                      updateSubmissionStatus(
                        submission.id,
                        event.target.value
                      )
                    }
                    className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                  >
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="contacted">Contacted</option>
                    <option value="completed">Completed</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setSelectedSubmission(submission)}
                    className="inline-flex items-center gap-2 border border-black px-4 py-2 text-sm font-medium uppercase tracking-wider transition hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
                  >
                    <Eye size={16} />
                    View Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-lg font-medium">No custom design requests yet</p>
            <p className="mt-2 text-sm text-gray-600">
              New submissions from the custom design page will appear here.
            </p>
          </div>
        )}
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div>
                <h3 className="text-xl font-semibold tracking-widest uppercase">
                  {selectedSubmission.id}
                </h3>
                <p className="text-sm text-gray-600">{formatDate(selectedSubmission.created_at)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="text-sm uppercase tracking-wider text-gray-500 hover:text-black"
              >
                Close
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider">
                    Customer
                  </h4>
                  <p>{selectedSubmission.name}</p>
                  <p className="text-sm text-gray-600">{selectedSubmission.email}</p>
                  <p className="text-sm text-gray-600">{selectedSubmission.phone || "No phone provided"}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider">
                    Request
                  </h4>
                  <p className="text-sm text-gray-700">
                    Product: {selectedSubmission.product_type}
                  </p>
                  <p className="text-sm text-gray-700">
                    Quantity: {selectedSubmission.quantity}
                  </p>
                  <p className="text-sm text-gray-700">
                    Status: {selectedSubmission.status}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider">
                  Additional Details
                </h4>
                <p className="rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  {selectedSubmission.message || "No additional details provided."}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider">
                  Admin Actions
                </h4>

                {selectedSubmission.status !== "approved" ? (
                  <input
                    type="number"
                    placeholder="Enter price (NPR)"
                    className="w-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-black"
                    onChange={(e) =>
                      setSelectedSubmission({
                        ...selectedSubmission,
                        price: Number(e.target.value || 0),
                      })
                    }
                  />
                ) : (
                  <div className="w-full border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-700">
                    This request is already approved.
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    disabled={selectedSubmission.status === "approved"}
                    onClick={async () => {
                      if (selectedSubmission.status === "approved") return;
                      if (!selectedSubmission.price || Number(selectedSubmission.price) <= 0) {
                        alert("Please enter a valid price before approving.");
                        return;
                      }
                      // 1. Update custom design with approved price
                      const { error: updateError } = await supabase
                        .from("custom_designs")
                        .update({
                          status: "approved",
                          approved_price: Number(selectedSubmission.price)
                        })
                        .eq("id", selectedSubmission.id);

                      if (updateError) {
                        console.error("Update error:", updateError);
                        return;
                      }

                      // 2. Check if order already exists (catch mismatched old orders)
                      const { data: existingOrder } = await supabase
                        .from("orders")
                        .select("*")
                        .or(`custom_design_id.eq.${selectedSubmission.id},id.eq.${selectedSubmission.id}`)
                        .maybeSingle();

                      // 🔥 remove any old mismatched duplicate orders
                      await supabase
                        .from("orders")
                        .delete()
                        .or(`custom_design_id.eq.${selectedSubmission.id},id.eq.${selectedSubmission.id}`)
                        .neq("id", selectedSubmission.id);

                      const { error: orderError } = await supabase
                        .from("orders")
                        .upsert(
                          {
                            // 🔥 SAME ID across system
                            id: selectedSubmission.id,

                            user_id: selectedSubmission.user_id || null,
                            customeremail: (selectedSubmission.email || "").toLowerCase().trim(),

                            // 🔥 store reference to design (important)
                            custom_design_id: selectedSubmission.id,

                            // 🔥 include design images directly for consistency
                            design_images:
                              selectedSubmission.image_urls ||
                              (selectedSubmission.image_url ? [selectedSubmission.image_url] : []),

                            items: [
                              {
                                name: selectedSubmission.product_type,
                                quantity: selectedSubmission.quantity,
                                type: "custom",
                              },
                            ],

                            total: Number(selectedSubmission.price),
                            approved_price: Number(selectedSubmission.price),

                            // 🔥 unified lifecycle
                            status: "pending",
                            payment_status: "unpaid",
                            payment_method: "esewa",

                            is_custom: true,

                            created_at: existingOrder?.created_at || new Date().toISOString(),
                          },
                          {
                            onConflict: "id",
                          }
                        );

                      if (orderError) {
                        console.error("Order creation/update error:", orderError);
                      }

                      // 🔔 notify other tabs/pages (Orders) to refresh
                      window.dispatchEvent(new Event("ordersUpdated"));
                      window.dispatchEvent(new Event("customOrderApproved"));

                      // 3. Update UI without reload
                      setSelectedSubmission(null);

                      // 🔥 force immediate UI sync
                      setSubmissions((prev) =>
                        prev.map((s) =>
                          s.id === selectedSubmission.id
                            ? { ...s, status: "approved", approved_price: selectedSubmission.price }
                            : s
                        )
                      );
                    }}
                    className={`flex-1 py-2 uppercase text-sm tracking-wider transition ${
                      selectedSubmission.status === "approved"
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {selectedSubmission.status === "approved" ? "Approved" : "Approve & Set Price"}
                  </button>

                  <button
                    onClick={async () => {
                      await supabase
                        .from("custom_designs")
                        .update({
                          status: "rejected",
                        })
                        .eq("id", selectedSubmission.id);

                      setSelectedSubmission(null);

                      const { data } = await supabase
                        .from("custom_designs")
                        .select("*")
                        .order("created_at", { ascending: false });

                      setSubmissions(data || []);
                    }}
                    className="flex-1 bg-red-600 text-white py-2 uppercase text-sm tracking-wider hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">
                  Uploaded Designs
                </h4>

                {selectedSubmission.image_urls && selectedSubmission.image_urls.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedSubmission.image_urls.map((url: string, index: number) => (
                      <img
                        key={index}
                        src={url}
                        alt="Design"
                        className="h-48 w-full rounded border border-gray-200 object-cover hover:scale-105 transition"
                      />
                    ))}
                  </div>
                ) : selectedSubmission.image_url ? (
                  <img
                    src={selectedSubmission.image_url}
                    alt="Design"
                    className="max-h-[28rem] w-full rounded border border-gray-200 object-contain"
                  />
                ) : (
                  <p className="text-sm text-gray-600">No file attached.</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
