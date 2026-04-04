import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Eye, FileImage, Mail, MessageSquare, Phone, Palette } from "lucide-react";
import {
  getCustomDesignSubmissions,
  saveCustomDesignSubmissions,
  type CustomDesignSubmission,
} from "../../utils/customDesigns";

export function CustomDesignManagement() {
  const [submissions, setSubmissions] = useState<CustomDesignSubmission[]>(() =>
    getCustomDesignSubmissions()
  );
  const [selectedSubmission, setSelectedSubmission] =
    useState<CustomDesignSubmission | null>(null);

  useEffect(() => {
    const syncSubmissions = () => {
      setSubmissions(getCustomDesignSubmissions());
    };

    window.addEventListener("customDesignSubmissionsUpdated", syncSubmissions);
    window.addEventListener("storage", syncSubmissions);

    return () => {
      window.removeEventListener("customDesignSubmissionsUpdated", syncSubmissions);
      window.removeEventListener("storage", syncSubmissions);
    };
  }, []);

  const updateSubmissionStatus = (
    submissionId: string,
    status: CustomDesignSubmission["status"]
  ) => {
    const updatedSubmissions = submissions.map((submission) =>
      submission.id === submissionId ? { ...submission, status } : submission
    );
    setSubmissions(updatedSubmissions);
    saveCustomDesignSubmissions(updatedSubmissions);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const getStatusColor = (status: CustomDesignSubmission["status"]) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700";
      case "reviewed":
        return "bg-amber-100 text-amber-700";
      case "contacted":
        return "bg-purple-100 text-purple-700";
      case "completed":
        return "bg-green-100 text-green-700";
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
                    {submission.productType} x {submission.quantity}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(submission.createdAt)}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <select
                    value={submission.status}
                    onChange={(event) =>
                      updateSubmissionStatus(
                        submission.id,
                        event.target.value as CustomDesignSubmission["status"]
                      )
                    }
                    className="border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                  >
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="contacted">Contacted</option>
                    <option value="completed">Completed</option>
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
                <p className="text-sm text-gray-600">{formatDate(selectedSubmission.createdAt)}</p>
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
                    Product: {selectedSubmission.productType}
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

              <div>
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">
                  Uploaded Design
                </h4>
                {selectedSubmission.file ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <FileImage size={18} />
                      <span>{selectedSubmission.file.name}</span>
                    </div>
                    {selectedSubmission.file.type.startsWith("image/") ? (
                      <img
                        src={selectedSubmission.file.dataUrl}
                        alt={selectedSubmission.file.name}
                        className="max-h-[28rem] w-full rounded border border-gray-200 object-contain"
                      />
                    ) : (
                      <a
                        href={selectedSubmission.file.dataUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 border border-black px-4 py-2 text-sm font-medium uppercase tracking-wider transition hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
                      >
                        <Eye size={16} />
                        Open File
                      </a>
                    )}
                  </div>
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
