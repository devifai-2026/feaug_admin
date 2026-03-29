import React, { useState, useEffect, useCallback } from "react";
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XCircleIcon,
  EyeIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import supportApi from "../../api/support.api";

const STATUS_OPTIONS = [
  { value: "open", label: "Open", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "resolved", label: "Resolved", color: "bg-green-100 text-green-700 border-green-200" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-600 border-gray-200" },
];

const getStatusBadge = (status) => {
  const opt = STATUS_OPTIONS.find((o) => o.value === status) || STATUS_OPTIONS[0];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${opt.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === "open" ? "bg-blue-500" :
        status === "in_progress" ? "bg-yellow-500" :
        status === "resolved" ? "bg-green-500" : "bg-gray-400"
      }`}></span>
      {opt.label}
    </span>
  );
};

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const response = await supportApi.getAllTickets(params);
      setTickets(response.data.tickets);
      setTotalPages(response.totalPages || 1);
      setTotal(response.total || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError(err.response?.data?.message || "Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const openTicketModal = async (ticket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setEditNotes(ticket.adminNotes || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTicket(null);
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;
    setUpdating(true);
    try {
      await supportApi.updateTicket(selectedTicket._id, {
        status: editStatus,
        adminNotes: editNotes,
      });
      showToast("Ticket updated successfully");
      closeModal();
      fetchTickets();
    } catch (err) {
      console.error("Error updating ticket:", err);
      showToast(err.response?.data?.message || "Failed to update ticket", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-right duration-300 ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? (
            <CheckCircleIcon className="h-4 w-4" />
          ) : (
            <XCircleIcon className="h-4 w-4" />
          )}
          {toast.message}
        </div>
      )}

      <div>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-600" />
                Support Tickets
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage help center form submissions. {total > 0 && `(${total} total)`}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or subject..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
              />
            </div>
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-white border border-red-100 rounded-xl p-8 text-center shadow-sm">
              <XCircleIcon className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-gray-900 font-bold text-sm mb-1">Error Loading Tickets</h3>
              <p className="text-gray-500 text-xs mb-4">{error}</p>
              <button
                onClick={fetchTickets}
                className="px-4 py-2 bg-gray-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-100 rounded-2xl p-12 text-center shadow-sm">
              <div className="bg-gray-50/50 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold text-sm mb-1">No Support Tickets</h3>
              <p className="text-gray-500 text-xs max-w-xs mx-auto">
                {search || statusFilter
                  ? "No tickets match your current filters."
                  : "No support tickets have been submitted yet."}
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {tickets.map((ticket) => (
                        <tr key={ticket._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{ticket.name}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{ticket.email}</td>
                          <td className="px-4 py-3 text-xs text-gray-700 max-w-[200px] truncate">{ticket.subject}</td>
                          <td className="px-4 py-3">{getStatusBadge(ticket.status)}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openTicketModal(ticket)}
                              className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-md transition-colors"
                              title="View & Edit"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-gray-500">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeftIcon className="h-3 w-3" />
                      Prev
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRightIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {modalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-[2px] transition-all animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Support Ticket</h2>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Submitted {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 rounded-md text-gray-400 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Ticket Info */}
              <div className="space-y-3 mb-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Name</p>
                    <p className="text-sm font-medium text-gray-900">{selectedTicket.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-sm text-gray-700">{selectedTicket.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Subject</p>
                  <p className="text-sm font-medium text-gray-900">{selectedTicket.subject}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Message</p>
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                    <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedTicket.message}</p>
                  </div>
                </div>
              </div>

              {/* Admin Controls */}
              <div className="border-t border-gray-100 pt-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Admin Notes
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add internal notes about this ticket..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50/50 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateTicket}
                    disabled={updating}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportTickets;
