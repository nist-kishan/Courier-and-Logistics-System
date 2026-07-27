import React, { useEffect, useState } from 'react';
import { Package, Users, Truck, Warehouse as WarehouseIcon, DollarSign, Clock, CheckCircle, AlertTriangle, ArrowRight, Shield, Plus } from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard({ setPage, openCreateShipmentModal }) {
  const [stats, setStats] = useState({
    totalShipments: 0,
    totalRevenue: 0,
    activeAgents: 0,
    activeWarehouses: 0,
    pendingCount: 0,
    inTransitCount: 0,
    deliveredCount: 0,
    failedCount: 0,
  });
  const [recentShipments, setRecentShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const shipments = await api.request('/shipments');
      const agents = await api.request('/delivery-agents');
      const warehouses = await api.request('/warehouse');

      // Calculate Stats
      const totalShipments = shipments.length;
      const totalRevenue = shipments
        .filter(s => s.payment?.paymentStatus === 'SUCCESS')
        .reduce((sum, s) => sum + (s.payment?.amount || 0), 0);
      
      const activeAgents = agents.filter(a => a.availability).length;
      const activeWarehouses = warehouses.length;

      const pendingCount = shipments.filter(s => s.deliveryStatus === 'PENDING').length;
      const inTransitCount = shipments.filter(s => ['CONFIRMED', 'PREPARING', 'PACKED', 'OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(s.deliveryStatus)).length;
      const deliveredCount = shipments.filter(s => s.deliveryStatus === 'DELIVERED').length;
      const failedCount = shipments.filter(s => ['FAILED', 'CANCELLED'].includes(s.deliveryStatus)).length;

      setStats({
        totalShipments,
        totalRevenue,
        activeAgents,
        activeWarehouses,
        pendingCount,
        inTransitCount,
        deliveredCount,
        failedCount,
      });

      // Sort recent shipments by time
      const sorted = [...shipments].sort((a, b) => new Date(b.shipmentTime) - new Date(a.shipmentTime));
      setRecentShipments(sorted.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Listen for data refresh events
    window.addEventListener('api-mode-changed', fetchDashboardData);
    window.addEventListener('shipment-updated', fetchDashboardData);
    return () => {
      window.removeEventListener('api-mode-changed', fetchDashboardData);
      window.removeEventListener('shipment-updated', fetchDashboardData);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="text-slate-400 mt-4 text-sm font-medium">Assembling control tower intelligence...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Shipments',
      value: stats.totalShipments,
      icon: Package,
      color: 'from-blue-600 to-indigo-600',
      shadow: 'shadow-blue-500/10',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'from-emerald-600 to-teal-600',
      shadow: 'shadow-emerald-500/10',
    },
    {
      title: 'Active Agents',
      value: `${stats.activeAgents} Online`,
      icon: Truck,
      color: 'from-amber-600 to-orange-600',
      shadow: 'shadow-amber-500/10',
    },
    {
      title: 'Operational Hubs',
      value: stats.activeWarehouses,
      icon: WarehouseIcon,
      color: 'from-purple-600 to-pink-600',
      shadow: 'shadow-purple-500/10',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative glass-panel rounded-2xl p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Logistics Control Room
            </h1>
            <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
              Track global operations, manage delivery personnel, verify warehouse storage thresholds, and process billing entries in real-time.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openCreateShipmentModal}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/30"
            >
              <Plus size={16} />
              Book Shipment
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl glass-panel p-6 flex items-center justify-between border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-xl ${card.shadow}`}
          >
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <h3 className="text-2xl font-bold text-slate-100">{card.value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
              <card.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Operational Progress and Active Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Breakdown Panel */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Clock size={18} className="text-indigo-400" />
              Delivery Operations
            </h3>
            <p className="text-xs text-slate-400">Breakdown of shipments by transit status</p>
          </div>

          <div className="my-6 space-y-4">
            {/* Pending Progress */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-400">Pending Bookings</span>
                <span className="text-slate-200">{stats.pendingCount}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalShipments ? (stats.pendingCount / stats.totalShipments) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* In Transit Progress */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-400">In Dispatch / Transit</span>
                <span className="text-slate-200">{stats.inTransitCount}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalShipments ? (stats.inTransitCount / stats.totalShipments) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Delivered Progress */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-400">Delivered Successfully</span>
                <span className="text-slate-200">{stats.deliveredCount}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalShipments ? (stats.deliveredCount / stats.totalShipments) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Failed Progress */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-400">Cancelled / Failed</span>
                <span className="text-slate-200">{stats.failedCount}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalShipments ? (stats.failedCount / stats.totalShipments) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setPage('shipments')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800/80 text-xs font-semibold transition-all border border-slate-800 hover:border-slate-700"
          >
            Manage Shipments
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Recent Shipments Feed */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Shield size={18} className="text-emerald-400" />
                Live Dispatch Log
              </h3>
              <p className="text-xs text-slate-400">Most recent bookings and shipments registered</p>
            </div>
            <button
              onClick={() => setPage('shipments')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-800/60 overflow-hidden">
            {recentShipments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Package size={36} className="mb-2" />
                <p className="text-sm">No shipments loaded.</p>
              </div>
            ) : (
              recentShipments.map((shipment) => {
                let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                if (shipment.deliveryStatus === 'PENDING') badgeColor = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                if (shipment.deliveryStatus === 'DELIVERED') badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                if (['FAILED', 'CANCELLED'].includes(shipment.deliveryStatus)) badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                if (['OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(shipment.deliveryStatus)) badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                return (
                  <div key={shipment.shipmentId} className="py-4 flex items-center justify-between hover:bg-slate-900/30 px-2 rounded-lg transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
                        <Package size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-200">#{shipment.trackingNumber}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(shipment.shipmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {shipment.source} <span className="text-slate-600">→</span> {shipment.destination}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                        {shipment.customer?.customerName || 'Walk-in'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${badgeColor}`}>
                        {shipment.deliveryStatus}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
