import React, { useState, useEffect } from 'react';
import { Package, Search, AlertCircle, Eye, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function Packages({ showToast }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterFragile, setFilterFragile] = useState('');

  const fetchPackages = async () => {
    try {
      setLoading(true);
      // Backend does not have a bulk package service with full mapping,
      // so we load shipments which cascade contains all packages!
      const shipments = await api.request('/shipments');
      const pkgs = shipments
        .filter(s => s.packageEntity)
        .map(s => ({
          ...s.packageEntity,
          shipmentTrackingNumber: s.trackingNumber,
          shipmentId: s.shipmentId
        }));
      setPackages(pkgs);
    } catch (err) {
      console.error(err);
      // Fallback direct request
      try {
        const pkgsDirect = await api.request('/packages');
        setPackages(pkgsDirect || []);
      } catch (e) {
        showToast('Failed to fetch packages list', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
    window.addEventListener('api-mode-changed', fetchPackages);
    return () => window.removeEventListener('api-mode-changed', fetchPackages);
  }, []);

  const filteredPackages = packages.filter(p => {
    const matchType = !filterType || p.packageType === filterType;
    const matchFragile = !filterFragile || 
      (filterFragile === 'true' && p.fragile) || 
      (filterFragile === 'false' && !p.fragile);
    return matchType && matchFragile;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="text-slate-400 mt-4 text-sm">Loading package manifest registries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Filter bar */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <Package size={18} className="text-indigo-400" />
            Package Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">Verify package types, dimensions, and fragile checklists.</p>
        </div>

        <div className="flex gap-3 text-xs">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Package Types</option>
            <option value="DOCUMENT">DOCUMENT</option>
            <option value="PARCEL">PARCEL</option>
            <option value="FRAGILE">FRAGILE</option>
            <option value="ELECTRONICS">ELECTRONICS</option>
            <option value="FOOD">FOOD</option>
            <option value="MEDICINE">MEDICINE</option>
          </select>

          <select
            value={filterFragile}
            onChange={(e) => setFilterFragile(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Handling Type</option>
            <option value="true">Fragile Only</option>
            <option value="false">Standard Only</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.length === 0 ? (
          <div className="col-span-full glass-panel rounded-2xl p-12 text-center text-slate-500 border border-slate-850">
            <AlertCircle size={32} className="mx-auto mb-2 text-slate-600" />
            No package specifications found.
          </div>
        ) : (
          filteredPackages.map((p, idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 hover:border-slate-700 transition duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Package ID: PKG-{p.packageId || idx + 1}</span>
                  <h4 className="font-extrabold text-slate-200 text-sm mt-1">{p.packageType || 'PARCEL'}</h4>
                </div>
                {p.fragile && (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    <ShieldAlert size={10} />
                    FRAGILE
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Box Size</span>
                  <p className="font-bold text-slate-300">
                    {p.dimension?.length || 10} x {p.dimension?.width || 10} x {p.dimension?.height || 10} cm
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Routing ID</span>
                  <p className="font-bold text-indigo-400">
                    #{p.shipmentTrackingNumber || 'Unassigned'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
