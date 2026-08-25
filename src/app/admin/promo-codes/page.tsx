"use client";

import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getApiBase } from "@/lib/apiBase";
import { useCallback, useEffect, useState } from "react";

const API = getApiBase();

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface PromoCode {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  description: string;
  createdAt: string;
}

const EMPTY_FORM = {
  code: "",
  type: "percentage" as "percentage" | "fixed",
  value: "",
  minOrderAmount: "",
  maxUses: "",
  expiresAt: "",
  description: "",
};

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function PromoCodesPage() {
  return (
    <AdminAuthGuard>
      <PromoCodesContent />
    </AdminAuthGuard>
  );
}

function PromoCodesContent() {
  const { token } = useAdminAuth();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<PromoCode | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/promo-codes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCodes(data.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setMsg(null);
    setShowForm(true);
  };

  const openEdit = (c: PromoCode) => {
    setEditTarget(c);
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      minOrderAmount: String(c.minOrderAmount || ""),
      maxUses: c.maxUses !== null ? String(c.maxUses) : "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      description: c.description,
    });
    setMsg(null);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      const body = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt
          ? new Date(form.expiresAt).toISOString()
          : null,
        description: form.description.trim(),
      };

      const url = editTarget
        ? `${API}/api/promo-codes/${editTarget._id}`
        : `${API}/api/promo-codes`;
      const method = editTarget ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save promo code");
      }

      setMsg({
        type: "success",
        text: editTarget ? "Promo code updated!" : "Promo code created!",
      });
      fetchCodes();
      setTimeout(() => setShowForm(false), 1200);
    } catch (err: unknown) {
      const text =
        err instanceof Error ? err.message : "Error saving promo code";
      setMsg({ type: "error", text });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (c: PromoCode) => {
    try {
      await fetch(`${API}/api/promo-codes/${c._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      fetchCodes();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    try {
      await fetch(`${API}/api/promo-codes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCodes();
    } catch {
      // ignore
    }
  };

  const activeCount = codes.filter((c) => c.isActive && !isExpired(c.expiresAt)).length;
  const expiredCount = codes.filter((c) => isExpired(c.expiresAt)).length;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Promo Codes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {codes.length} total codes ({activeCount} active, {expiredCount} expired)
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 flex-shrink-0"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Create Code
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            onClick={() => setShowForm(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300"
          />

          <div
            className="rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-6 relative z-10 animate-in zoom-in-95 duration-200 border border-white/10"
            style={{
              background: "rgba(15,15,25,0.98)",
            }}
          >
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white flex items-center justify-between border-b border-white/10">
              <h3 className="text-base font-bold text-slate-100">
                {editTarget
                  ? `Edit Code — ${editTarget.code}`
                  : "New Promo Code"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-5">
              {msg && (
                <div
                  className={`px-4 py-3 rounded-xl text-xs font-semibold border ${
                    msg.type === "success"
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-950/40 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {msg.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editTarget}
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. SAVE20"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-slate-100 text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-violet-500 bg-slate-950/80 disabled:opacity-50"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-slate-100 text-xs focus:outline-none focus:border-violet-500 bg-slate-950/80"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Value * {form.type === "percentage" ? "(1–100%)" : "(৳)"}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={form.type === "percentage" ? 100 : undefined}
                    step="0.01"
                    value={form.value}
                    onChange={(e) =>
                      setForm({ ...form, value: e.target.value })
                    }
                    placeholder={
                      form.type === "percentage" ? "e.g. 20" : "e.g. 150"
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 bg-slate-950/80"
                  />
                </div>

                {/* Min order */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Min Order Amount (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.minOrderAmount}
                    onChange={(e) =>
                      setForm({ ...form, minOrderAmount: e.target.value })
                    }
                    placeholder="0 = no minimum"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 bg-slate-950/80"
                  />
                </div>

                {/* Max uses */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Max Uses
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxUses}
                    onChange={(e) =>
                      setForm({ ...form, maxUses: e.target.value })
                    }
                    placeholder="Blank = unlimited"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 bg-slate-950/80"
                  />
                </div>

                {/* Expires at */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Expires At
                  </label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) =>
                      setForm({ ...form, expiresAt: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-slate-100 text-xs focus:outline-none focus:border-violet-500 bg-slate-950/80"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="e.g. Save 20% on your entire order"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-violet-500 bg-slate-950/80"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 font-semibold text-xs hover:bg-white/[0.05] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                >
                  {saving && (
                    <svg
                      className="w-3.5 h-3.5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  )}
                  {editTarget ? "Save Changes" : "Create Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promo Codes Table Container */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              All Promo Codes ({codes.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customers can enter active, unexpired promo codes during checkout.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/10 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : codes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-violet-900/30 text-violet-400 flex items-center justify-center text-2xl">
              🎟️
            </div>
            <p className="text-slate-200 font-bold text-sm">
              No promo codes yet
            </p>
            <p className="text-xs text-slate-400">
              Click &quot;Create Code&quot; above to add your first discount promo code.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-white/[0.02] border-b border-white/8 text-slate-400 uppercase font-bold tracking-wider text-[11px]">
                <tr>
                  {[
                    "Code",
                    "Type & Value",
                    "Min Order",
                    "Uses",
                    "Expires",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3.5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {codes.map((c) => {
                  const expired = isExpired(c.expiresAt);
                  return (
                    <tr
                      key={c._id}
                      className={`hover:bg-white/[0.02] transition-colors h-16 ${expired ? "opacity-75" : ""}`}
                    >
                      {/* Code */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-semibold text-violet-300 bg-violet-950/40 border border-violet-500/30 px-2.5 py-1 rounded-lg text-xs inline-block">
                          {c.code}
                        </span>
                        {c.description && (
                          <p className="text-slate-400 text-xs mt-1 truncate max-w-xs">
                            {c.description}
                          </p>
                        )}
                      </td>

                      {/* Type & Value */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase border ${
                              c.type === "percentage"
                                ? "bg-amber-950/40 text-amber-400 border-amber-500/30"
                                : "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                            }`}
                          >
                            {c.type === "percentage" ? "%" : "৳"}
                          </span>
                          <span className="text-slate-100 font-semibold text-xs">
                            {c.type === "percentage"
                              ? `${c.value}% OFF`
                              : `৳${c.value} OFF`}
                          </span>
                        </div>
                      </td>

                      {/* Min Order */}
                      <td className="px-4 py-3.5 font-medium text-slate-300 whitespace-nowrap">
                        {c.minOrderAmount > 0 ? (
                          `৳${c.minOrderAmount}`
                        ) : (
                          <span className="text-slate-500">None</span>
                        )}
                      </td>

                      {/* Uses */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-100">
                          {c.usedCount}
                        </span>
                        <span className="text-slate-400">
                          /{c.maxUses ?? "∞"}
                        </span>
                      </td>

                      {/* Expires */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {c.expiresAt ? (
                          <span
                            className={
                              expired
                                ? "text-rose-400 font-semibold text-xs"
                                : "text-slate-300 text-xs"
                            }
                          >
                            {new Date(c.expiresAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                            {expired && " (expired)"}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">
                            No expiry
                          </span>
                        )}
                      </td>

                      {/* Status toggle */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={c.isActive && !expired}
                          onClick={() => handleToggle(c)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            c.isActive && !expired
                              ? "bg-emerald-500"
                              : "bg-slate-700"
                          }`}
                          title={c.isActive ? "Click to deactivate code" : "Click to activate code"}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              c.isActive && !expired
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="px-3 py-1.5 font-semibold text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl text-xs transition-all border border-white/10"
                            title="Edit code"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c._id)}
                            className="px-3 py-1.5 font-semibold text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/20 rounded-xl text-xs transition-all"
                            title="Delete code"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
