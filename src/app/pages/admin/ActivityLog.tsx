import { useEffect, useState } from "react";
import { Clock3, ShieldCheck } from "lucide-react";
import { getAdminAuditLogs, type AdminAuditLog } from "../../utils/admin";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityLog() {
  const [logs, setLogs] = useState<AdminAuditLog[]>(() => getAdminAuditLogs());

  useEffect(() => {
    const syncLogs = () => {
      setLogs(getAdminAuditLogs());
    };

    window.addEventListener("adminAuditLogUpdated", syncLogs);
    window.addEventListener("storage", syncLogs);

    return () => {
      window.removeEventListener("adminAuditLogUpdated", syncLogs);
      window.removeEventListener("storage", syncLogs);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-widest uppercase">
            Admin Activity Log
          </h2>
          <p className="text-sm text-gray-600">
            Review which admin made each change across products, promos, and orders.
          </p>
        </div>
        <div className="text-sm tracking-wider text-gray-600">
          {logs.length} logged action{logs.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        {logs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ShieldCheck size={40} className="mx-auto text-gray-400" />
            <p className="mt-4 text-lg font-medium">No admin actions yet</p>
            <p className="mt-2 text-sm text-gray-600">
              Login, updates, deletions, and restores will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col gap-3 px-6 py-5 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold tracking-wider">{log.adminName}</p>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs uppercase tracking-wider text-gray-700">
                      {log.branch}
                    </span>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs uppercase tracking-wider text-blue-700">
                      {log.entityType}
                    </span>
                  </div>
                  <p className="text-sm tracking-wider">
                    <span className="font-medium">{log.action}</span> on {log.entityName}
                  </p>
                  {log.details ? (
                    <p className="text-sm text-gray-600">{log.details}</p>
                  ) : null}
                  <p className="text-xs text-gray-500">{log.adminEmail}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock3 size={14} />
                  <span>{formatDate(log.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
