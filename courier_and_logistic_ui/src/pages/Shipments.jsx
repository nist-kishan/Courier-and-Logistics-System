import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, MapPin, DollarSign, Edit3, Truck, Warehouse as WarehouseIcon, FileText, ChevronRight, Check, AlertCircle, ShoppingBag, Eye } from 'lucide-react';
import { api } from '../services/api';

export default function Shipments({ createModalOpen, setCreateModalOpen, showToast }) {
  const [shipments, setShipments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search/Filter states
  const [searchTracking, setSearchTracking] = useState('');
  const [trackedShipment, setTrackedShipment] = useState(null);
  const [trackingError, setTrackingError] = useState('');

  // Creation form states
  const [newShipment, setNewShipment] = useState({
    source: '',
    destination: '',
    weight: '',
    customer: { customerId: '' },
    warehouse: { warehouseId: '' },
    packageEntity: {
      packageType: 'PARCEL',
      fragile: false,
      dimension: { length: '', width: '', height: '' }
    },
    payment: {
      paymentMethod: 'UPI',
      paymentStatus: 'PENDING'
    }
  });

  // Action states
  const [activeShipment, setActiveShipment] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'status', 'agent', 'warehouse', 'detail'
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [statusUpdate, setStatusUpdate] = useState({ paymentStatus: '', deliveryStatus: '' });

  // Pagination states
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [sortBy, setSortBy] = useState('shipmentId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await api.request(`/shipments/pagination?currentPage=${pageIndex}&pageSize=${pageSize}&fieldName=${sortBy}&direction=${sortDirection}`);
      if (data && data.content) {
        setShipments(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else {
        setShipments([]);
      }
    } catch (err) {
      console.error('Error fetching shipments data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [customerData, warehouseData, agentData] = await Promise.all([
        api.request('/customer'),
        api.request('/warehouse'),
        api.request('/delivery-agents')
      ]);
      setCustomers(customerData || []);
      setWarehouses(warehouseData || []);
      setAgents(agentData || []);
    } catch (err) {
      console.error('Error fetching dependencies:', err);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [pageIndex, pageSize, sortBy, sortDirection]);

  useEffect(() => {
    const handleReset = () => {
      setPageIndex(0);
      loadDependencies();
      fetchShipments();
    };
    window.addEventListener('api-mode-changed', handleReset);
    window.addEventListener('shipment-updated', fetchShipments);
    return () => {
      window.removeEventListener('api-mode-changed', handleReset);
      window.removeEventListener('shipment-updated', fetchShipments);
    };
  }, [pageIndex, pageSize, sortBy, sortDirection]);

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    if (!searchTracking.trim()) return;
    setTrackingError('');
    setTrackedShipment(null);

    try {
      // Find matching tracking number in shipments
      const response = await api.request(`/shipments/tracking/${searchTracking}`);
      if (response) {
        setTrackedShipment(response);
      } else {
        setTrackingError('No shipment found with that tracking number');
      }
    } catch (err) {
      setTrackingError(err.message || 'Shipment search failed');
    }
  };

  // Dynamic cost estimation
  const calculateEstimate = () => {
    const w = parseFloat(newShipment.weight) || 0;
    const l = parseFloat(newShipment.packageEntity.dimension.length) || 0;
    const width = parseFloat(newShipment.packageEntity.dimension.width) || 0;
    const h = parseFloat(newShipment.packageEntity.dimension.height) || 0;
    const fragile = newShipment.packageEntity.fragile;

    const volumetricWeight = (l * width * h) / 5000.0;
    const chargeableWeight = Math.max(w, volumetricWeight);
    let shippingCharge = chargeableWeight * 50; 
    if (fragile) {
      shippingCharge += shippingCharge * 0.10;
    }
    return shippingCharge > 0 ? shippingCharge : 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!newShipment.source || !newShipment.destination || !newShipment.weight || !newShipment.customer.customerId || !newShipment.warehouse.warehouseId) {
      showToast('Please fill all mandatory fields', 'error');
      return;
    }

    if (newShipment.source.toLowerCase() === newShipment.destination.toLowerCase()) {
      showToast('Source and destination cannot be identical', 'error');
      return;
    }

    try {
      const payload = {
        ...newShipment,
        weight: parseFloat(newShipment.weight),
        customer: { customerId: parseInt(newShipment.customer.customerId) },
        warehouse: { warehouseId: parseInt(newShipment.warehouse.warehouseId) },
        packageEntity: {
          ...newShipment.packageEntity,
          fragile: !!newShipment.packageEntity.fragile,
          dimension: {
            length: parseFloat(newShipment.packageEntity.dimension.length || 10),
            width: parseFloat(newShipment.packageEntity.dimension.width || 10),
            height: parseFloat(newShipment.packageEntity.dimension.height || 10)
          }
        }
      };

      const result = await api.request('/shipments', {
        method: 'POST',
        body: payload
      });

      showToast(`Shipment created! Tracking: #${result.trackingNumber}`, 'success');
      setCreateModalOpen(false);
      
      // Reset form
      setNewShipment({
        source: '',
        destination: '',
        weight: '',
        customer: { customerId: '' },
        warehouse: { warehouseId: '' },
        packageEntity: {
          packageType: 'PARCEL',
          fragile: false,
          dimension: { length: '', width: '', height: '' }
        },
        payment: {
          paymentMethod: 'UPI',
          paymentStatus: 'PENDING'
        }
      });

      loadData();
      // Dispatch refresh event
      window.dispatchEvent(new Event('shipment-updated'));
    } catch (err) {
      showToast(err.message || 'Failed to create shipment', 'error');
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedAgentId) return;
    try {
      await api.request(`/shipments/${activeShipment.shipmentId}/assign-delivery-agent/${selectedAgentId}`, {
        method: 'PATCH'
      });
      showToast('Agent assigned successfully', 'success');
      setActionModal(null);
      loadData();
      window.dispatchEvent(new Event('shipment-updated'));
    } catch (err) {
      showToast(err.message || 'Failed to assign agent', 'error');
    }
  };

  const handleAssignWarehouse = async () => {
    if (!selectedWarehouseId) return;
    try {
      await api.request(`/shipments/${activeShipment.shipmentId}/assign-warehouse/${selectedWarehouseId}`, {
        method: 'PATCH'
      });
      showToast('Warehouse assigned successfully', 'success');
      setActionModal(null);
      loadData();
      window.dispatchEvent(new Event('shipment-updated'));
    } catch (err) {
      showToast(err.message || 'Failed to assign warehouse', 'error');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const payload = {};
      if (statusUpdate.paymentStatus) payload.paymentStatus = statusUpdate.paymentStatus;
      if (statusUpdate.deliveryStatus) payload.deliveryStatus = statusUpdate.deliveryStatus;

      await api.request(`/shipments/${activeShipment.shipmentId}/status`, {
        method: 'PATCH',
        body: payload
      });
      showToast('Statuses updated successfully', 'success');
      setActionModal(null);
      loadData();
      window.dispatchEvent(new Event('shipment-updated'));
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="text-slate-400 mt-4 text-sm">Loading shipments...</p>
      </div>
    );
  }

  // Delivery statuses in sequence for timeline
  const STATUS_STEPS = [
    { key: 'PENDING', label: 'Booked' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PREPARING', label: 'Packed' },
    { key: 'OUT_FOR_DELIVERY', label: 'Dispatched' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  const getTimelineStepIndex = (status) => {
    if (status === 'CANCELLED' || status === 'FAILED') return -1;
    // Map intermediate statuses
    if (status === 'PACKED') return 2;
    if (status === 'IN_TRANSIT') return 3;
    return STATUS_STEPS.findIndex(step => step.key === status);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Upper search / tracker */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Search Panel */}
        <div className="xl:col-span-1 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
              <Search size={18} className="text-indigo-400" />
              Live Package Tracker
            </h2>
            <p className="text-xs text-slate-400">Search packages by tracking number for immediate status mapping.</p>
            <form onSubmit={handleTrackSearch} className="flex gap-2 pt-2">
              <input
                type="number"
                placeholder="Enter Tracking Number"
                value={searchTracking}
                onChange={(e) => setSearchTracking(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 px-4 rounded-xl text-sm font-semibold transition"
              >
                Track
              </button>
            </form>
            {trackingError && (
              <p className="text-xs text-rose-400 flex items-center gap-1 mt-2">
                <AlertCircle size={12} />
                {trackingError}
              </p>
            )}
          </div>

          {!trackedShipment && (
            <div className="mt-8 py-8 border border-dashed border-slate-800/80 rounded-xl flex flex-col items-center text-slate-500 justify-center">
              <ShoppingBag size={32} className="mb-2 opacity-50" />
              <p className="text-xs">No active search tracker</p>
            </div>
          )}

          {trackedShipment && (
            <div className="mt-6 p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-300">#{trackedShipment.trackingNumber}</span>
                <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">
                  {trackedShipment.packageEntity?.packageType}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Route</span>
                  <p className="text-slate-300 font-medium">{trackedShipment.source} → {trackedShipment.destination}</p>
                </div>
                <div>
                  <span className="text-slate-500">Scheduled Date</span>
                  <p className="text-slate-300 font-medium">{trackedShipment.deliveryDate}</p>
                </div>
                <div>
                  <span className="text-slate-500">Chargeable Cost</span>
                  <p className="text-emerald-400 font-bold">${trackedShipment.payment?.amount?.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Billing Status</span>
                  <p className="text-slate-300 font-medium">{trackedShipment.payment?.paymentStatus}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timeline Visualization */}
        <div className="xl:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Visual Route Timeline</h3>
            <p className="text-xs text-slate-400 mt-1">Live tracking timeline updates for selected shipment</p>
          </div>

          {trackedShipment ? (
            <div className="my-8">
              {trackedShipment.deliveryStatus === 'CANCELLED' || trackedShipment.deliveryStatus === 'FAILED' ? (
                <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                  <AlertCircle size={20} />
                  <div>
                    <h4 className="font-bold text-sm">Shipment {trackedShipment.deliveryStatus}</h4>
                    <p className="text-xs text-rose-300/80">{trackedShipment.trackingHistory?.remark || 'No remark left.'}</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-800 -translate-y-1/2 z-0 hidden md:block"></div>
                  
                  {/* Responsive Timeline Steps */}
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2">
                    {STATUS_STEPS.map((step, idx) => {
                      const activeIdx = getTimelineStepIndex(trackedShipment.deliveryStatus);
                      const isCompleted = idx <= activeIdx;
                      const isCurrent = idx === activeIdx;

                      return (
                        <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-2 text-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs transition-all ${
                            isCompleted
                              ? isCurrent
                                ? 'bg-indigo-600 border-indigo-500 text-white scale-110 glow-indigo'
                                : 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}>
                            {isCompleted && !isCurrent ? <Check size={14} /> : idx + 1}
                          </div>
                          <div className="text-left md:text-center">
                            <span className={`text-xs font-semibold block ${isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                              {step.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] text-indigo-400 block font-medium mt-0.5 animate-pulse">
                                Current
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Remarks/Status update */}
              <div className="mt-8 p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Location / Log Remark</span>
                  <p className="text-xs text-slate-300 font-medium mt-1">
                    {trackedShipment.trackingHistory?.currentLocation || 'Unknown'} - {trackedShipment.trackingHistory?.remark || 'Processing dispatch details.'}
                  </p>
                </div>
                {trackedShipment.deliveryAgent && (
                  <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                    <Truck size={14} className="text-indigo-400" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">Agent</span>
                      <span className="text-xs text-slate-300 font-semibold">{trackedShipment.deliveryAgent.deliveryAgentName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="my-12 text-center text-slate-500 flex flex-col items-center justify-center">
              <MapPin size={40} className="mb-2 text-slate-700 animate-bounce" />
              <p className="text-sm">Search and track a shipment to display timeline nodes.</p>
            </div>
          )}

          <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-3">
            Note: Delivery milestones are synced directly with warehouse scanner receipts and courier agent GPS triggers.
          </div>
        </div>
      </div>

      {/* Shipments List & Details Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Shipment Registry</h3>
            <p className="text-xs text-slate-400">Database entries of all logistics packages routed globally.</p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
          >
            <Plus size={14} />
            Book Shipment
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th 
                  className="p-4 cursor-pointer hover:bg-slate-850 transition"
                  onClick={() => {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    setSortBy('shipmentId');
                  }}
                >
                  Tracking ID {sortBy === 'shipmentId' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th 
                  className="p-4 cursor-pointer hover:bg-slate-850 transition"
                  onClick={() => {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    setSortBy('customerName');
                  }}
                >
                  Customer {sortBy === 'customerName' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="p-4">Route</th>
                <th className="p-4">Agent</th>
                <th className="p-4">Warehouse</th>
                <th 
                  className="p-4 cursor-pointer hover:bg-slate-850 transition"
                  onClick={() => {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    setSortBy('deliveryStatus');
                  }}
                >
                  Delivery Status {sortBy === 'deliveryStatus' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    No shipments found in database.
                  </td>
                </tr>
              ) : (
                shipments.map((s) => {
                  let statusBadge = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                  if (s.deliveryStatus === 'DELIVERED') statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  if (['FAILED', 'CANCELLED'].includes(s.deliveryStatus)) statusBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  if (['OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(s.deliveryStatus)) statusBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                  let payBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  if (s.payment?.paymentStatus === 'SUCCESS') payBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  if (s.payment?.paymentStatus === 'PROCESSING') payBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                  return (
                    <tr key={s.shipmentId} className="hover:bg-slate-900/20 transition-colors">
                      <td className="p-4 font-bold text-slate-200">#{s.trackingNumber}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-300">{s.customer?.customerName || 'Unknown'}</div>
                        <div className="text-[10px] text-slate-500">{s.customer?.customerPhone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-300">{s.source}</div>
                        <div className="text-[10px] text-slate-500">to {s.destination} ({s.weight} kg)</div>
                      </td>
                      <td className="p-4 text-slate-400 font-medium">
                        {s.deliveryAgent ? (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Truck size={12} className="text-indigo-400" />
                            {s.deliveryAgent.deliveryAgentName}
                          </span>
                        ) : (
                          <button
                            onClick={() => { setActiveShipment(s); setActionModal('agent'); setSelectedAgentId(''); }}
                            className="text-indigo-400 hover:underline flex items-center gap-0.5 text-[11px]"
                          >
                            + Assign
                          </button>
                        )}
                      </td>
                      <td className="p-4 text-slate-400">
                        {s.warehouse ? (
                          <span className="flex items-center gap-1 text-slate-300">
                            <WarehouseIcon size={12} className="text-indigo-400" />
                            {s.warehouse.warehouseName}
                          </span>
                        ) : (
                          <button
                            onClick={() => { setActiveShipment(s); setActionModal('warehouse'); setSelectedWarehouseId(''); }}
                            className="text-indigo-400 hover:underline flex items-center gap-0.5 text-[11px]"
                          >
                            + Assign
                          </button>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                          {s.deliveryStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-300">${s.payment?.amount?.toFixed(2)}</div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${payBadge}`}>
                          {s.payment?.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setActiveShipment(s);
                              setActionModal('status');
                              setStatusUpdate({ paymentStatus: s.payment?.paymentStatus || 'PENDING', deliveryStatus: s.deliveryStatus || 'PENDING' });
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-400 hover:text-indigo-300"
                            title="Update Status"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setActiveShipment(s);
                              setActionModal('detail');
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300"
                            title="View Detail"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
            <span>shipments (Total: {totalElements})</span>
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

      {/* BOOK SHIPMENT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-850 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-200">Register New Shipment</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-500 hover:text-slate-300 text-lg">×</button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer selection */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Customer *</label>
                  <select
                    value={newShipment.customer.customerId}
                    onChange={(e) => setNewShipment({ ...newShipment, customer: { customerId: e.target.value } })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                      <option key={c.customerId} value={c.customerId}>{c.customerName} ({c.customerPhone})</option>
                    ))}
                  </select>
                </div>

                {/* Warehouse selection */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Source Warehouse *</label>
                  <select
                    value={newShipment.warehouse.warehouseId}
                    onChange={(e) => setNewShipment({ ...newShipment, warehouse: { warehouseId: e.target.value } })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Dispatch Warehouse</option>
                    {warehouses.map(w => (
                      <option key={w.warehouseId} value={w.warehouseId}>{w.warehouseName} ({w.location})</option>
                    ))}
                  </select>
                </div>

                {/* Source location */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Source Location Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New York East Hub"
                    value={newShipment.source}
                    onChange={(e) => setNewShipment({ ...newShipment, source: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Destination location */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Destination Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 104 Westwood Ave, LA"
                    value={newShipment.destination}
                    onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newShipment.weight}
                    onChange={(e) => setNewShipment({ ...newShipment, weight: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Package Type */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Package Type</label>
                  <select
                    value={newShipment.packageEntity.packageType}
                    onChange={(e) => setNewShipment({
                      ...newShipment,
                      packageEntity: { ...newShipment.packageEntity, packageType: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="DOCUMENT">DOCUMENT</option>
                    <option value="PARCEL">PARCEL</option>
                    <option value="FRAGILE">FRAGILE</option>
                    <option value="ELECTRONICS">ELECTRONICS</option>
                    <option value="FOOD">FOOD</option>
                    <option value="MEDICINE">MEDICINE</option>
                  </select>
                </div>
              </div>

              {/* Package Dimensions */}
              <div className="border-t border-slate-800/80 pt-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Package Dimensions & Fragility</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Length (cm)</label>
                    <input
                      type="number"
                      required
                      placeholder="10"
                      value={newShipment.packageEntity.dimension.length}
                      onChange={(e) => setNewShipment({
                        ...newShipment,
                        packageEntity: {
                          ...newShipment.packageEntity,
                          dimension: { ...newShipment.packageEntity.dimension, length: e.target.value }
                        }
                      })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Width (cm)</label>
                    <input
                      type="number"
                      required
                      placeholder="10"
                      value={newShipment.packageEntity.dimension.width}
                      onChange={(e) => setNewShipment({
                        ...newShipment,
                        packageEntity: {
                          ...newShipment.packageEntity,
                          dimension: { ...newShipment.packageEntity.dimension, width: e.target.value }
                        }
                      })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Height (cm)</label>
                    <input
                      type="number"
                      required
                      placeholder="10"
                      value={newShipment.packageEntity.dimension.height}
                      onChange={(e) => setNewShipment({
                        ...newShipment,
                        packageEntity: {
                          ...newShipment.packageEntity,
                          dimension: { ...newShipment.packageEntity.dimension, height: e.target.value }
                        }
                      })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="checkbox"
                    id="fragile-cb"
                    checked={newShipment.packageEntity.fragile}
                    onChange={(e) => setNewShipment({
                      ...newShipment,
                      packageEntity: { ...newShipment.packageEntity, fragile: e.target.checked }
                    })}
                    className="accent-indigo-600 rounded"
                  />
                  <label htmlFor="fragile-cb" className="text-xs text-slate-400 select-none">This package contains fragile materials (+10% tariff surcharge)</label>
                </div>
              </div>

              {/* Billing and Cost Estimation */}
              <div className="border-t border-slate-800/80 pt-4 bg-slate-900/30 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Payment Method</label>
                    <select
                      value={newShipment.payment.paymentMethod}
                      onChange={(e) => setNewShipment({
                        ...newShipment,
                        payment: { ...newShipment.payment, paymentMethod: e.target.value }
                      })}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="UPI">UPI</option>
                      <option value="CREDIT_CARD">CREDIT CARD</option>
                      <option value="DEBIT_CARD">DEBIT CARD</option>
                      <option value="NET_BANKING">NET BANKING</option>
                      <option value="WALLET">WALLET</option>
                      <option value="CASH_ON_DELIVERY">CASH ON DELIVERY</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 block mb-1">Prepaid Status</label>
                    <select
                      value={newShipment.payment.paymentStatus}
                      onChange={(e) => setNewShipment({
                        ...newShipment,
                        payment: { ...newShipment.payment, paymentStatus: e.target.value }
                      })}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="SUCCESS">SUCCESS</option>
                    </select>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">Estimated Logistics Tariff</span>
                  <span className="text-2xl font-black text-emerald-400">
                    ${calculateEstimate().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-bold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN AGENT MODAL */}
      {actionModal === 'agent' && activeShipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Truck size={18} className="text-indigo-400" />
              Assign Delivery Agent
            </h3>
            <p className="text-xs text-slate-400">Assign courier personnel to shipment #{activeShipment.trackingNumber}. Only active, available agents are listed.</p>
            
            <div className="space-y-3 py-2">
              <label className="text-xs font-semibold text-slate-400 block">Available Dispatch Agents</label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Delivery Agent</option>
                {agents.filter(a => a.availability).map(a => (
                  <option key={a.deliveryAgentId} value={a.deliveryAgentId}>
                    {a.deliveryAgentName} (Rating: {a.rating}★ | Vehicle: {a.vehicleNumber})
                  </option>
                ))}
              </select>
              {agents.filter(a => a.availability).length === 0 && (
                <p className="text-[10px] text-amber-400">Warning: No agents are currently registered as available.</p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignAgent}
                disabled={!selectedAgentId}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-xs font-bold text-white shadow-lg"
              >
                Assign Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN WAREHOUSE MODAL */}
      {actionModal === 'warehouse' && activeShipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <WarehouseIcon size={18} className="text-indigo-400" />
              Assign Cargo Warehouse
            </h3>
            <p className="text-xs text-slate-400">Transfer route storage of shipment #{activeShipment.trackingNumber} to selected warehouse.</p>
            
            <div className="space-y-3 py-2">
              <label className="text-xs font-semibold text-slate-400 block">Warehouses</label>
              <select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map(w => (
                  <option key={w.warehouseId} value={w.warehouseId}>
                    {w.warehouseName} (Location: {w.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignWarehouse}
                disabled={!selectedWarehouseId}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-xs font-bold text-white shadow-lg"
              >
                Transfer Cargo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {actionModal === 'status' && activeShipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Edit3 size={18} className="text-indigo-400" />
              Update Shipment Status
            </h3>
            <p className="text-xs text-slate-400">Modify transit and billing state of shipment #{activeShipment.trackingNumber}.</p>
            
            <div className="space-y-3 py-2">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Delivery Status</label>
                <select
                  value={statusUpdate.deliveryStatus}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, deliveryStatus: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="PENDING">PENDING (Booked)</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PREPARING">PREPARING (Packing)</option>
                  <option value="PACKED">PACKED</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Payment Status</label>
                <select
                  value={statusUpdate.paymentStatus}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, paymentStatus: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="FAILED">FAILED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg"
              >
                Apply Updates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHIPMENT DETAIL MODAL */}
      {actionModal === 'detail' && activeShipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-850 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <FileText size={18} className="text-indigo-400" />
                Shipment Bill Details
              </h3>
              <button onClick={() => setActionModal(null)} className="text-slate-500 hover:text-slate-300 text-lg">×</button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-slate-500">Tracking Code</span>
                  <p className="font-extrabold text-sm text-slate-200">#{activeShipment.trackingNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Booked Time</span>
                  <p className="font-medium text-slate-300">{new Date(activeShipment.shipmentTime).toLocaleString()}</p>
                </div>
              </div>

              {/* Customer */}
              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">Client / Recipient</h4>
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1">
                  <p className="font-bold text-slate-200">{activeShipment.customer?.customerName}</p>
                  <p className="text-slate-400">Email: {activeShipment.customer?.customerEmail}</p>
                  <p className="text-slate-400">Phone: {activeShipment.customer?.customerPhone}</p>
                  <p className="text-slate-400">Address: {activeShipment.customer?.customerAddress}</p>
                </div>
              </div>

              {/* Package Specs */}
              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">Package Description</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <span className="text-slate-500 block mb-0.5">Package Type</span>
                    <p className="font-bold text-slate-200">{activeShipment.packageEntity?.packageType || 'PARCEL'}</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <span className="text-slate-500 block mb-0.5">Fragile Checklist</span>
                    <p className="font-bold text-slate-200">{activeShipment.packageEntity?.fragile ? 'Yes, Fragile Handling' : 'Standard Handling'}</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <span className="text-slate-500 block mb-0.5">Weight</span>
                    <p className="font-bold text-slate-200">{activeShipment.weight} kg</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <span className="text-slate-500 block mb-0.5">Box Size (L x W x H)</span>
                    <p className="font-bold text-slate-200">
                      {activeShipment.packageEntity?.dimension?.length || 10} x {activeShipment.packageEntity?.dimension?.width || 10} x {activeShipment.packageEntity?.dimension?.height || 10} cm
                    </p>
                  </div>
                </div>
              </div>

              {/* Routing logistics */}
              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">Logistics Network Data</h4>
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1">
                  <p className="text-slate-300"><span className="text-slate-500">Route Origin:</span> {activeShipment.source}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Route Destination:</span> {activeShipment.destination}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Handling Depot:</span> {activeShipment.warehouse?.warehouseName || 'No depot assigned'}</p>
                  <p className="text-slate-300"><span className="text-slate-500">Courier Driver:</span> {activeShipment.deliveryAgent?.deliveryAgentName || 'No courier assigned'}</p>
                </div>
              </div>

              {/* Payment Receipt */}
              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2 text-[10px]">Payment Receipt</h4>
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 block">Method: {activeShipment.payment?.paymentMethod}</span>
                    <span className="text-[10px] text-slate-500">Time: {activeShipment.payment?.paymentTime ? new Date(activeShipment.payment.paymentTime).toLocaleString() : 'N/A'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 mb-1 inline-block">
                      {activeShipment.payment?.paymentStatus}
                    </span>
                    <p className="text-sm font-extrabold text-slate-200">${activeShipment.payment?.amount?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex justify-end">
              <button
                onClick={() => setActionModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
