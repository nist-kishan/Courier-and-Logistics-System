import React, { useState, useEffect } from 'react';
import { Truck, UserPlus, Phone, Star, Trash2, Edit3, Eye, AlertCircle, ToggleLeft, ToggleRight, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../services/api';

export default function Agents({ showToast }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newAgent, setNewAgent] = useState({
    deliveryAgentName: '',
    deliveryAgentContactNumber: '',
    vehicleNumber: '',
    availability: true,
    rating: 5
  });

  // Modals
  const [editingAgent, setEditingAgent] = useState(null);
  const [viewingShipmentsAgent, setViewingShipmentsAgent] = useState(null);
  const [agentShipments, setAgentShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await api.request('/delivery-agents');
      setAgents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    window.addEventListener('api-mode-changed', fetchAgents);
    return () => window.removeEventListener('api-mode-changed', fetchAgents);
  }, []);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!newAgent.deliveryAgentName || !newAgent.deliveryAgentContactNumber || !newAgent.vehicleNumber) {
      showToast('Please fill all mandatory fields', 'error');
      return;
    }

    if (newAgent.deliveryAgentContactNumber.length !== 10) {
      showToast('Contact number must be exactly 10 digits', 'error');
      return;
    }

    try {
      await api.request('/delivery-agents', {
        method: 'POST',
        body: {
          ...newAgent,
          rating: parseInt(newAgent.rating)
        }
      });
      showToast('Delivery Agent registered successfully!', 'success');
      setNewAgent({ deliveryAgentName: '', deliveryAgentContactNumber: '', vehicleNumber: '', availability: true, rating: 5 });
      fetchAgents();
    } catch (err) {
      showToast(err.message || 'Failed to register agent', 'error');
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.request(`/delivery-agents/${editingAgent.deliveryAgentId}`, {
        method: 'PATCH',
        body: {
          deliveryAgentName: editingAgent.deliveryAgentName,
          deliveryAgentContactNumber: editingAgent.deliveryAgentContactNumber,
          vehicleNumber: editingAgent.vehicleNumber,
          rating: parseInt(editingAgent.rating)
        }
      });
      showToast('Agent details updated', 'success');
      setEditingAgent(null);
      fetchAgents();
    } catch (err) {
      showToast(err.message || 'Failed to update agent', 'error');
    }
  };

  const handleToggleAvailability = async (agent) => {
    const nextVal = !agent.availability;
    try {
      await api.request(`/delivery-agents/${agent.deliveryAgentId}/availability`, {
        method: 'PATCH',
        body: { availability: nextVal }
      });
      showToast(`Agent availability set to ${nextVal ? 'Available' : 'Unavailable'}`, 'success');
      fetchAgents();
      // Trigger update on other pages (Dashboard needs to reflect active count)
      window.dispatchEvent(new Event('shipment-updated'));
    } catch (err) {
      showToast(err.message || 'Failed to update availability', 'error');
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async (id) => {
    try {
      await api.request(`/delivery-agents/${id}`, {
        method: 'DELETE'
      });
      showToast('Agent records purged', 'success');
      fetchAgents();
    } catch (err) {
      showToast(err.message || 'Failed to delete agent', 'error');
    }
  };

  const handleViewShipments = async (agent) => {
    setViewingShipmentsAgent(agent);
    setLoadingShipments(true);
    setAgentShipments([]);
    try {
      const data = await api.request(`/shipments/delivery-agent/${agent.deliveryAgentId}`);
      setAgentShipments(data || []);
    } catch (err) {
      console.warn('Could not load shipments for agent:', err.message);
      setAgentShipments([]);
    } finally {
      setLoadingShipments(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="text-slate-400 mt-4 text-sm">Loading fleet data...</p>
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
            Enlist Dispatch Courier
          </h2>
          <p className="text-xs text-slate-400 mt-1">Register new agents and assign logistics transport vehicles.</p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Agent Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Robert Carter"
              value={newAgent.deliveryAgentName}
              onChange={(e) => setNewAgent({ ...newAgent, deliveryAgentName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Contact Number (10 digits) *</label>
            <input
              type="text"
              required
              maxLength={10}
              placeholder="e.g. 9988776655"
              value={newAgent.deliveryAgentContactNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setNewAgent({ ...newAgent, deliveryAgentContactNumber: val });
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Vehicle License plate *</label>
            <input
              type="text"
              required
              placeholder="e.g. NY-88-A9"
              value={newAgent.vehicleNumber}
              onChange={(e) => setNewAgent({ ...newAgent, vehicleNumber: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Performance Rating</label>
              <select
                value={newAgent.rating}
                onChange={(e) => setNewAgent({ ...newAgent, rating: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="5">5 Stars ★</option>
                <option value="4">4 Stars ★</option>
                <option value="3">3 Stars ★</option>
                <option value="2">2 Stars ★</option>
                <option value="1">1 Star ★</option>
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-slate-400 block mb-1">Operational State</label>
              <select
                value={newAgent.availability ? "true" : "false"}
                onChange={(e) => setNewAgent({ ...newAgent, availability: e.target.value === "true" })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="true">Available</option>
                <option value="false">Offline / Out</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs transition duration-200"
          >
            Enlist Driver Profile
          </button>
        </form>
      </div>

      {/* Directory Grid */}
      <div className="xl:col-span-2 glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-slate-850">
          <h3 className="text-lg font-bold text-slate-200">Active Delivery Fleet</h3>
          <p className="text-xs text-slate-400">Manage dispatch couriers, track customer feedback, and verify work states.</p>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="p-4">Courier Agent</th>
                <th className="p-4">Vehicle license</th>
                <th className="p-4">Work State</th>
                <th className="p-4 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {agents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    No courier agents registered in fleet database.
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.deliveryAgentId} className="hover:bg-slate-900/20 transition-colors">
                    <td className="p-4">
                      <span className="font-extrabold text-sm text-slate-200 block">{agent.deliveryAgentName}</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-slate-500 mr-2">ID: AGY-{agent.deliveryAgentId}</span>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={10} className={i < agent.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"} />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 space-y-1">
                      <span className="font-semibold text-slate-300 block">{agent.vehicleNumber}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Phone size={10} />
                        {agent.deliveryAgentContactNumber}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleAvailability(agent)}
                        className="flex items-center gap-2 hover:opacity-85 text-[11px] font-medium"
                      >
                        {agent.availability ? (
                          <>
                            <ToggleRight size={22} className="text-emerald-500" />
                            <span className="text-emerald-400">Available</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={22} className="text-slate-600" />
                            <span className="text-slate-500">Offline</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewShipments(agent)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-400"
                          title="View Assigned Shipments"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setEditingAgent(agent)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
                          title="Edit Details"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(agent.deliveryAgentId)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-900/50 text-rose-400 hover:text-rose-300"
                          title="De-list Agent"
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
      </div>

      {/* EDIT COURIER MODAL */}
      {editingAgent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Edit3 size={18} className="text-indigo-400" />
              Update Courier Profile
            </h3>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-3 py-2 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Agent Full Name</label>
                <input
                  type="text"
                  required
                  value={editingAgent.deliveryAgentName}
                  onChange={(e) => setEditingAgent({ ...editingAgent, deliveryAgentName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Contact Number</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={editingAgent.deliveryAgentContactNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setEditingAgent({ ...editingAgent, deliveryAgentContactNumber: val });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Vehicle License plate</label>
                <input
                  type="text"
                  required
                  value={editingAgent.vehicleNumber}
                  onChange={(e) => setEditingAgent({ ...editingAgent, vehicleNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Performance Rating</label>
                <select
                  value={editingAgent.rating}
                  onChange={(e) => setEditingAgent({ ...editingAgent, rating: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="5">5 Stars ★</option>
                  <option value="4">4 Stars ★</option>
                  <option value="3">3 Stars ★</option>
                  <option value="2">2 Stars ★</option>
                  <option value="1">1 Star ★</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingAgent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SHIPMENTS MODAL */}
      {viewingShipmentsAgent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-850 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Truck size={18} className="text-indigo-400" />
                Manifest Cargo: {viewingShipmentsAgent.deliveryAgentName}
              </h3>
              <button onClick={() => setViewingShipmentsAgent(null)} className="text-slate-500 hover:text-slate-300 text-lg">×</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {loadingShipments ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : agentShipments.length === 0 ? (
                <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center gap-2">
                  <AlertCircle size={28} className="text-slate-700" />
                  <p>No routes or cargo currently assigned to this driver.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/50">
                  {agentShipments.map((s) => (
                    <div key={s.shipmentId} className="py-3 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-200">#{s.trackingNumber}</span>
                        <p className="text-slate-400 mt-0.5">{s.source} → {s.destination}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Contact: {s.customer?.customerName || 'N/A'}</p>
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
                onClick={() => setViewingShipmentsAgent(null)}
                className="px-5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
              >
                Close Manifest
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
            <p className="text-xs text-slate-400">Are you sure you want to remove this delivery agent from fleet registries? This action cannot be undone.</p>
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
