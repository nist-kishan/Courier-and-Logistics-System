import React, { useState, useEffect } from 'react';
import { Warehouse as WarehouseIcon, Plus, Phone, MapPin, Trash2, Edit2, Archive, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function Warehouses({ showToast }) {
  const [warehouses, setWarehouses] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newWarehouse, setNewWarehouse] = useState({
    warehouseName: '',
    location: '',
    capacity: '',
    warehouseContactNumber: ''
  });

  // Modal states
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [warehouseData, shipmentData] = await Promise.all([
        api.request('/warehouse'),
        api.request('/shipments')
      ]);
      setWarehouses(warehouseData || []);
      setShipments(shipmentData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('api-mode-changed', loadData);
    return () => window.removeEventListener('api-mode-changed', loadData);
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newWarehouse.warehouseName || !newWarehouse.location || !newWarehouse.capacity || !newWarehouse.warehouseContactNumber) {
      showToast('Please fill all fields', 'error');
      return;
    }

    if (newWarehouse.warehouseContactNumber.length !== 10) {
      showToast('Contact number must be exactly 10 digits', 'error');
      return;
    }

    try {
      await api.request('/warehouse', {
        method: 'POST',
        body: {
          ...newWarehouse,
          capacity: parseFloat(newWarehouse.capacity)
        }
      });
      showToast('Warehouse registered successfully!', 'success');
      setNewWarehouse({ warehouseName: '', location: '', capacity: '', warehouseContactNumber: '' });
      loadData();
      window.dispatchEvent(new Event('shipment-updated'));
    } catch (err) {
      showToast(err.message || 'Failed to register warehouse', 'error');
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.request(`/warehouse/edit/${editingWarehouse.warehouseId}`, {
        method: 'PATCH',
        body: {
          warehouseName: editingWarehouse.warehouseName,
          location: editingWarehouse.location,
          capacity: parseFloat(editingWarehouse.capacity),
          warehouseContactNumber: editingWarehouse.warehouseContactNumber
        }
      });
      showToast('Warehouse details updated', 'success');
      setEditingWarehouse(null);
      loadData();
      window.dispatchEvent(new Event('shipment-updated'));
    } catch (err) {
      showToast(err.message || 'Failed to update warehouse', 'error');
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const executeDelete = async (id) => {
    try {
      await api.request(`/warehouse/delete/${id}`, {
        method: 'DELETE'
      });
      showToast('Warehouse record deleted', 'success');
      loadData();
      window.dispatchEvent(new Event('shipment-updated'));
    } catch (err) {
      showToast(err.message || 'Failed to delete warehouse', 'error');
    }
  };

  // Helper to calculate total weight stored in a warehouse
  const getWarehouseUsage = (warehouseId) => {
    const assignedShipments = shipments.filter(s => s.warehouse?.warehouseId === warehouseId && s.deliveryStatus !== 'DELIVERED');
    const totalWeight = assignedShipments.reduce((sum, s) => sum + (s.weight || 0), 0);
    return {
      count: assignedShipments.length,
      weight: totalWeight
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="text-slate-400 mt-4 text-sm">Loading warehouses...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fadeIn">
      {/* Creation form */}
      <div className="xl:col-span-1 glass-panel rounded-2xl p-6 border border-slate-800 h-fit space-y-4 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <WarehouseIcon size={18} className="text-indigo-400" />
            Establish Cargo Depot
          </h2>
          <p className="text-xs text-slate-400 mt-1">Register storage hubs to receive and dispatch parcel freight.</p>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Depot/Warehouse Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Northeast Terminal"
              value={newWarehouse.warehouseName}
              onChange={(e) => setNewWarehouse({ ...newWarehouse, warehouseName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">City Location *</label>
            <input
              type="text"
              required
              placeholder="e.g. Seattle"
              value={newWarehouse.location}
              onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Max Storage Capacity (metric tons) *</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="1000.0"
              value={newWarehouse.capacity}
              onChange={(e) => setNewWarehouse({ ...newWarehouse, capacity: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Depot Office Phone (10 digits) *</label>
            <input
              type="text"
              required
              maxLength={10}
              placeholder="e.g. 2065550133"
              value={newWarehouse.warehouseContactNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setNewWarehouse({ ...newWarehouse, warehouseContactNumber: val });
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs transition duration-200"
          >
            Create Depot Profile
          </button>
        </form>
      </div>

      {/* Warehouses list cards */}
      <div className="xl:col-span-2 space-y-6">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <h3 className="text-lg font-bold text-slate-200">Depot Storage Monitor</h3>
          <p className="text-xs text-slate-400 mt-1">Real-time tracking of warehouse storage thresholds and contact offices.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {warehouses.length === 0 ? (
            <div className="md:col-span-2 glass-panel rounded-2xl p-12 text-center text-slate-500 border border-slate-850">
              No warehouse depots registered.
            </div>
          ) : (
            warehouses.map((wh) => {
              const usage = getWarehouseUsage(wh.warehouseId);
              // Calculate percent capacity based on current stored weight (in kg) vs capacity (in metric tons * 1000)
              const maxCapacityKg = wh.capacity * 1000;
              const usagePercent = Math.min((usage.weight / maxCapacityKg) * 100, 100);
              
              // Determine status indicator color
              let barColor = 'bg-indigo-500';
              if (usagePercent > 80) barColor = 'bg-rose-500';
              else if (usagePercent > 50) barColor = 'bg-amber-500';

              return (
                <div key={wh.warehouseId} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 hover:border-slate-700 transition duration-300 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-200 text-base">{wh.warehouseName}</h4>
                        <span className="text-[10px] text-slate-500 block">ID: WH-{wh.warehouseId}</span>
                      </div>
                      
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setEditingWarehouse(wh)}
                          className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                          title="Edit Hub"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(wh.warehouseId)}
                          className="p-1 rounded bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300"
                          title="Delete Hub"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-500" />
                        {wh.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-500" />
                        {wh.warehouseContactNumber}
                      </span>
                    </div>
                  </div>

                  {/* Usage bar */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Archive size={10} />
                        Storage Load ({usage.count} units)
                      </span>
                      <span className={usagePercent > 80 ? "text-rose-400" : "text-slate-300"}>
                        {usagePercent.toFixed(2)}% Used
                      </span>
                    </div>
                    
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`${barColor} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${usagePercent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{usage.weight.toFixed(1)} kg stored</span>
                      <span>Max {wh.capacity} MT</span>
                    </div>

                    {usagePercent > 85 && (
                      <p className="text-[10px] text-rose-400 flex items-center gap-1">
                        <AlertTriangle size={10} />
                        Depot exceeds threshold safety level.
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* EDIT HUB MODAL */}
      {editingWarehouse && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Edit2 size={18} className="text-indigo-400" />
              Modify Depot Configuration
            </h3>
            
            <form onSubmit={handleUpdateSubmit} className="space-y-3 py-2 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Depot/Warehouse Name</label>
                <input
                  type="text"
                  required
                  value={editingWarehouse.warehouseName}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, warehouseName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">City Location</label>
                <input
                  type="text"
                  required
                  value={editingWarehouse.location}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Max Capacity (metric tons)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={editingWarehouse.capacity}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, capacity: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Depot Phone Number</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={editingWarehouse.warehouseContactNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setEditingWarehouse({ ...editingWarehouse, warehouseContactNumber: val });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingWarehouse(null)}
                  className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg"
                >
                  Save Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION POPUP */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn text-xs">
          <div className="glass-panel w-full max-w-sm rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-400" />
              Confirm Deletion
            </h3>
            <p className="text-xs text-slate-400">Are you sure you want to remove this warehouse record? This action could isolate assigned packages and cannot be undone.</p>
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
