import React, { useState, useEffect } from 'react';
import { Search, MapPin, AlertCircle, Shield } from 'lucide-react';
import { api } from '../services/api';

export default function Tracking({ showToast }) {
  const [trackingHistories, setTrackingHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchText, setSearchText] = useState('');

  const fetchTracking = async () => {
    try {
      setLoading(true);
      // Fallback: load shipments that contain tracking histories
      const shipments = await api.request('/shipments');
      const histories = shipments
        .filter(s => s.trackingHistory)
        .map(s => ({
          ...s.trackingHistory,
          shipmentTrackingNumber: s.trackingNumber,
          shipmentId: s.shipmentId
        }));
      setTrackingHistories(histories);
    } catch (err) {
      console.error(err);
      try {
        const historiesList = await api.request('/tracking-history');
        setTrackingHistories(historiesList || []);
      } catch (e) {
        showToast('Failed to fetch tracking history logs', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    window.addEventListener('api-mode-changed', fetchTracking);
    return () => window.removeEventListener('api-mode-changed', fetchTracking);
  }, []);

  const filteredHistories = trackingHistories.filter(h => {
    const matchStatus = !filterStatus || h.deliveryStatus === filterStatus;
    const matchSearch = !searchText || 
      (h.shipmentTrackingNumber && h.shipmentTrackingNumber.toString().includes(searchText)) ||
      (h.currentLocation && h.currentLocation.toLowerCase().includes(searchText.toLowerCase())) ||
      (h.remark && h.remark.toLowerCase().includes(searchText.toLowerCase()));
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="text-slate-400 mt-4 text-sm">Synchronizing route telemetry logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Filter bar */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <Shield size={18} className="text-indigo-400" />
            Route Tracking Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1">Review active parcel transit checkpoints and telemetry updates.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 text-xs">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Delivery Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PREPARING">PREPARING</option>
            <option value="PACKED">PACKED</option>
            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="p-4">Log ID</th>
                <th className="p-4">Shipment Tracking Code</th>
                <th className="p-4">Current Checkpoint Location</th>
                <th className="p-4">Delivery Status Node</th>
                <th className="p-4">Transit Remark / Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredHistories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No matching checkpoint logs found.
                  </td>
                </tr>
              ) : (
                filteredHistories.map((h, idx) => {
                  let statusBadge = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                  if (h.deliveryStatus === 'DELIVERED') statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  if (['FAILED', 'CANCELLED'].includes(h.deliveryStatus)) statusBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  if (['OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(h.deliveryStatus)) statusBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                  return (
                    <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                      <td className="p-4 font-bold text-slate-500">#LOG-{h.trackingHistoryId || idx + 1}</td>
                      <td className="p-4 text-indigo-400 font-semibold">#{h.shipmentTrackingNumber || 'Unassigned'}</td>
                      <td className="p-4 font-medium text-slate-200">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-indigo-400" />
                          {h.currentLocation || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusBadge}`}>
                          {h.deliveryStatus}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">{h.remark}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
