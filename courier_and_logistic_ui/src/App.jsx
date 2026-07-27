import React, { useState, useEffect, lazy, Suspense } from 'react';
import { LayoutDashboard, Package, Users, Truck, Warehouse as WarehouseIcon, Database, Wifi, WifiOff, CheckCircle, AlertCircle, X, ShieldAlert, ChevronLeft, ChevronRight, CreditCard, ShieldCheck, Archive } from 'lucide-react';
import { api } from './services/api';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Shipments = lazy(() => import('./pages/Shipments'));
const Customers = lazy(() => import('./pages/Customers'));
const Agents = lazy(() => import('./pages/Agents'));
const Warehouses = lazy(() => import('./pages/Warehouses'));
const Packages = lazy(() => import('./pages/Packages'));
const Payments = lazy(() => import('./pages/Payments'));
const Tracking = lazy(() => import('./pages/Tracking'));

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [createShipmentModalOpen, setCreateShipmentModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Setup toast notifications helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const navigateToCreateShipment = () => {
    setPage('shipments');
    setCreateShipmentModalOpen(true);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'shipments', label: 'Shipment Routing', icon: Package },
    { id: 'customers', label: 'Customer Directory', icon: Users },
    { id: 'agents', label: 'Delivery Agents', icon: Truck },
    { id: 'warehouses', label: 'Depot Warehouses', icon: WarehouseIcon },
    { id: 'packages', label: 'Package Specifications', icon: Archive },
    { id: 'payments', label: 'Billing Receipts', icon: CreditCard },
    { id: 'tracking', label: 'Checkpoints Log', icon: ShieldCheck },
  ];

  // Auth render guard removed

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 antialiased font-sans">
      
      {/* Sidebar Navigation */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-slate-900/40 backdrop-blur-md border-r border-slate-900 hidden lg:flex flex-col z-20 transition-all duration-300`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-900/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
              <Package size={20} className="animate-pulse" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-extrabold tracking-tight text-slate-100 text-xs whitespace-nowrap">Courier & Logistic</span>
            )}
          </div>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 hidden lg:block"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setPage(item.id);
                  if (item.id !== 'shipments') setCreateShipmentModalOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 border border-transparent'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon size={16} className="flex-shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Desktop Logout Button Removed */}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Navbar */}
        <header className="h-16 bg-slate-950/60 backdrop-blur-md border-b border-slate-900/60 px-6 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-4 lg:gap-0">
            {/* Mobile Title */}
            <div className="flex items-center gap-2 lg:hidden">
              <Package size={16} className="text-indigo-400" />
              <span className="font-extrabold text-xs">Courier & Logistic</span>
            </div>
            
            <h2 className="text-sm font-bold text-slate-300 hidden lg:block">
              {menuItems.find((m) => m.id === page)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">

            {/* Mobile Navigation Toggle Bar */}
            <div className="flex items-center gap-1.5 lg:hidden">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = page === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setPage(item.id);
                      if (item.id !== 'shipments') setCreateShipmentModalOpen(false);
                    }}
                    className={`p-2 rounded-lg border transition ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                    title={item.label}
                  >
                    <Icon size={14} />
                  </button>
                );
              })}
              {/* Mobile Logout Button Removed */}
            </div>
          </div>
        </header>

        {/* Content Router */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-24">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
              <p className="text-slate-400 mt-4 text-xs font-semibold">Loading component...</p>
            </div>
          }>
            {page === 'dashboard' && (
              <Dashboard setPage={setPage} openCreateShipmentModal={navigateToCreateShipment} />
            )}
            {page === 'shipments' && (
              <Shipments
                createModalOpen={createShipmentModalOpen}
                setCreateModalOpen={setCreateShipmentModalOpen}
                showToast={showToast}
              />
            )}
            {page === 'customers' && <Customers showToast={showToast} />}
            {page === 'agents' && <Agents showToast={showToast} />}
            {page === 'warehouses' && <Warehouses showToast={showToast} />}
            {page === 'packages' && <Packages showToast={showToast} />}
            {page === 'payments' && <Payments showToast={showToast} />}
            {page === 'tracking' && <Tracking showToast={showToast} />}
          </Suspense>
        </main>
      </div>

      {/* TOAST ALERTS CONTAINER */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center justify-between p-4 rounded-xl border glass-panel shadow-2xl animate-slideIn text-xs font-semibold"
          >
            <div className="flex items-center gap-3">
              {toast.type === 'error' ? (
                <AlertCircle className="text-rose-500 flex-shrink-0" size={16} />
              ) : (
                <CheckCircle className="text-emerald-500 flex-shrink-0" size={16} />
              )}
              <span className="text-slate-200">{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-500 hover:text-slate-300 ml-4"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
