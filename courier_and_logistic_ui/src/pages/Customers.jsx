import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Phone, MapPin, Search, Trash2, Edit2, Package, Eye, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function Customers({ showToast }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Registration form
  const [newCustomer, setNewCustomer] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: ''
  });

  // Edit / Details modal states
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerShipments, setCustomerShipments] = useState([]);
  const [viewingShipmentsCust, setViewingShipmentsCust] = useState(null);
  const [loadingShipments, setLoadingShipments] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Pagination states
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [sortBy, setSortBy] = useState('customerId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.request(`/customer/pagination/${pageIndex}/${pageSize}/sortby/${sortBy}/${sortDirection}`);
      if (data && data.content) {
        setCustomers(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [pageIndex, pageSize, sortBy, sortDirection]);

  useEffect(() => {
    const handleReset = () => {
      setPageIndex(0);
      fetchCustomers();
    };
    window.addEventListener('api-mode-changed', handleReset);
    return () => window.removeEventListener('api-mode-changed', handleReset);
  }, []);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!newCustomer.customerName || !newCustomer.customerEmail || !newCustomer.customerPhone || !newCustomer.customerAddress) {
      showToast('Please fill all fields', 'error');
      return;
    }

    if (newCustomer.customerPhone.length !== 10) {
      showToast('Phone number must be exactly 10 digits', 'error');
      return;
    }

    try {
      await api.request('/customer', {
        method: 'POST',
        body: newCustomer
      });
      showToast('Customer registered successfully!', 'success');
      setNewCustomer({ customerName: '', customerEmail: '', customerPhone: '', customerAddress: '' });
      fetchCustomers();
    } catch (err) {
      showToast(err.message || 'Failed to register customer', 'error');
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.request(`/customer/${editingCustomer.customerId}`, {
        method: 'PATCH',
        body: {
          customerName: editingCustomer.customerName,
          customerEmail: editingCustomer.customerEmail,
          customerPhone: editingCustomer.customerPhone,
          customerAddress: editingCustomer.customerAddress
        }
      });
      showToast('Customer information updated', 'success');
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err) {
      showToast(err.message || 'Failed to update customer', 'error');
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async (id) => {
    try {
      await api.request(`/customer/${id}`, {
        method: 'DELETE'
      });
      showToast('Customer record deleted', 'success');
      fetchCustomers();
    } catch (err) {
      showToast(err.message || 'Failed to delete customer', 'error');
    }
  };

  const handleViewShipments = async (customer) => {
    setViewingShipmentsCust(customer);
    setLoadingShipments(true);
    setCustomerShipments([]);
    try {
      const data = await api.request(`/shipments/customer/${customer.customerId}`);
      setCustomerShipments(data || []);
    } catch (err) {
      console.warn('Could not load shipments for customer:', err.message);
      setCustomerShipments([]);
    } finally {
      setLoadingShipments(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="text-slate-400 mt-4 text-sm">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fadeIn">
      {/* Registration Card */}
      <div className="xl:col-span-1 glass-panel rounded-2xl p-6 border border-slate-800 h-fit space-y-4 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <UserPlus size={18} className="text-indigo-400" />
            Add Customer Record
          </h2>
          <p className="text-xs text-slate-400 mt-1">Register new client details for shipping invoicing.</p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={newCustomer.customerName}
              onChange={(e) => setNewCustomer({ ...newCustomer, customerName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Email Address</label>
            <input
              type="email"
              placeholder="e.g. john@example.com"
              value={newCustomer.customerEmail}
              onChange={(e) => setNewCustomer({ ...newCustomer, customerEmail: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Phone Number (10 digits)</label>
            <input
              type="text"
              maxLength={10}
              placeholder="e.g. 9876543210"
              value={newCustomer.customerPhone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setNewCustomer({ ...newCustomer, customerPhone: val });
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Billing Address</label>
            <textarea
              placeholder="e.g. 123 Main St, New York, NY"
              value={newCustomer.customerAddress}
              onChange={(e) => setNewCustomer({ ...newCustomer, customerAddress: e.target.value })}
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs transition duration-200"
          >
            Create Customer Profile
          </button>
        </form>
      </div>

      {/* Directory Grid */}
      <div className="xl:col-span-2 glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-slate-850">
          <h3 className="text-lg font-bold text-slate-200">Customer Directory</h3>
          <p className="text-xs text-slate-400">Database list of clients registered within your logistics grid.</p>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th 
                  className="p-4 cursor-pointer hover:bg-slate-850 transition"
                  onClick={() => {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    setSortBy('customerName');
                  }}
                >
                  Customer Details {sortBy === 'customerName' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th 
                  className="p-4 cursor-pointer hover:bg-slate-850 transition"
                  onClick={() => {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    setSortBy('customerEmail');
                  }}
                >
                  Contact Info {sortBy === 'customerEmail' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="p-4">Billing Address</th>
                <th className="p-4 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    No customer accounts on file.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.customerId} className="hover:bg-slate-900/20 transition-colors">
                    <td className="p-4">
                      <span className="font-extrabold text-sm text-slate-200 block">{c.customerName}</span>
                      <span className="text-[10px] text-slate-500">ID: CUST-{c.customerId}</span>
                    </td>
                    <td className="p-4 space-y-1">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Mail size={12} className="text-indigo-400/80" />
                        {c.customerEmail}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Phone size={12} className="text-indigo-400/80" />
                        {c.customerPhone}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-500 flex-shrink-0" />
                        {c.customerAddress}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewShipments(c)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-400"
                          title="View Invoices"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setEditingCustomer(c)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
                          title="Edit Info"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.customerId)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-900/50 text-rose-400 hover:text-rose-300"
                          title="Delete Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination control footer */}
        <div className="p-4 border-t border-slate-850 bg-slate-900/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setPageIndex(0);
              }}
              className="bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
            <span>records (Total: {totalElements})</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={pageIndex === 0}
              onClick={() => setPageIndex(p => Math.max(0, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-700 text-xs font-semibold text-slate-300 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 text-xs">
              Page {pageIndex + 1} of {totalPages}
            </span>
            <button
              disabled={pageIndex >= totalPages - 1}
              onClick={() => setPageIndex(p => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-700 text-xs font-semibold text-slate-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* EDIT CUSTOMER MODAL */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Edit2 size={18} className="text-indigo-400" />
              Modify Profile Details
            </h3>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-3 py-2 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingCustomer.customerName}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, customerName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingCustomer.customerEmail}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, customerEmail: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={editingCustomer.customerPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setEditingCustomer({ ...editingCustomer, customerPhone: val });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Billing Address</label>
                <textarea
                  required
                  value={editingCustomer.customerAddress}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, customerAddress: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SHIPMENTS MODAL */}
      {viewingShipmentsCust && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-850 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Package size={18} className="text-indigo-400" />
                Routed Packages: {viewingShipmentsCust.customerName}
              </h3>
              <button onClick={() => setViewingShipmentsCust(null)} className="text-slate-500 hover:text-slate-300 text-lg">×</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {loadingShipments ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : customerShipments.length === 0 ? (
                <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center gap-2">
                  <AlertCircle size={28} className="text-slate-700" />
                  <p>No shipments recorded for this customer profile yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/50">
                  {customerShipments.map((s) => (
                    <div key={s.shipmentId} className="py-3 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-200">#{s.trackingNumber}</span>
                        <p className="text-slate-400 mt-0.5">{s.source} → {s.destination}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Booked: {new Date(s.shipmentTime).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-300 font-bold block">${s.payment?.amount?.toFixed(2)}</span>
                        <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/10 mt-1 inline-block">
                          {s.deliveryStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex justify-end">
              <button
                onClick={() => setViewingShipmentsCust(null)}
                className="px-5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
              >
                Close List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION POPUP */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn text-xs">
          <div className="glass-panel w-full max-w-sm rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-400" />
              Confirm Deletion
            </h3>
            <p className="text-xs text-slate-400">Are you sure you want to remove this customer record? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  executeDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
