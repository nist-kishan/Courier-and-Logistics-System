import React, { useState, useEffect } from 'react';
import { DollarSign, Search, AlertCircle, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function Payments({ showToast }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Fallback: load shipments that cascade payments
      const shipments = await api.request('/shipments');
      const pmts = shipments
        .filter(s => s.payment)
        .map(s => ({
          ...s.payment,
          shipmentTrackingNumber: s.trackingNumber,
          shipmentId: s.shipmentId
        }));
      setPayments(pmts);
    } catch (err) {
      console.error(err);
      try {
        const paymentsList = await api.request('/payments');
        setPayments(paymentsList || []);
      } catch (e) {
        showToast('Failed to fetch payments records', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    window.addEventListener('api-mode-changed', fetchPayments);
    return () => window.removeEventListener('api-mode-changed', fetchPayments);
  }, []);

  const handleUpdatePaymentStatus = async (paymentId, currentStatus) => {
    const nextStatus = currentStatus === 'PENDING' ? 'SUCCESS' : 'PENDING';
    try {
      setUpdatingId(paymentId);
      // Find the associated shipment ID to update via status patch
      const associatedPayment = payments.find(p => p.paymentId === paymentId);
      if (associatedPayment && associatedPayment.shipmentId) {
        await api.request(`/shipments/${associatedPayment.shipmentId}/status`, {
          method: 'PATCH',
          body: { paymentStatus: nextStatus }
        });
        showToast('Payment status updated successfully', 'success');
        fetchPayments();
        // Notify other pages
        window.dispatchEvent(new Event('shipment-updated'));
      } else {
        // Fallback direct payment route
        await api.request(`/payments/${paymentId}/status`, {
          method: 'PATCH',
          body: { paymentStatus: nextStatus }
        });
        showToast('Payment status updated successfully', 'success');
        fetchPayments();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update payment status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredPayments = payments.filter(p => {
    return !filterStatus || p.paymentStatus === filterStatus;
  });

  // Calculate quick payment KPIs
  const totalInvoiced = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const successRevenue = payments.filter(p => p.paymentStatus === 'SUCCESS').reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingRevenue = payments.filter(p => p.paymentStatus === 'PENDING').reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        <p className="text-slate-400 mt-4 text-sm">Aggregating transaction ledger profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Transaction stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Gross Billings</span>
          <h3 className="text-2xl font-black text-slate-100">${totalInvoiced.toFixed(2)}</h3>
        </div>
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Settled Revenue</span>
          <h3 className="text-2xl font-black text-emerald-400">${successRevenue.toFixed(2)}</h3>
        </div>
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Unsettled Invoices</span>
          <h3 className="text-2xl font-black text-amber-500">${pendingRevenue.toFixed(2)}</h3>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-200">Transaction Ledgers</h3>
            <p className="text-xs text-slate-400">Database receipts of customer shipping payments.</p>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Payment Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="FAILED">FAILED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="p-4">Payment Receipt ID</th>
                <th className="p-4">Tracking Code</th>
                <th className="p-4">Billing Date</th>
                <th className="p-4">Billing Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-center">Toggle Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No transaction entries match selected criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  let payBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  if (p.paymentStatus === 'SUCCESS') payBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  if (p.paymentStatus === 'PENDING') payBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                  return (
                    <tr key={p.paymentId} className="hover:bg-slate-900/20 transition-colors">
                      <td className="p-4 font-bold text-slate-200">#REC-{p.paymentId}</td>
                      <td className="p-4 text-indigo-400 font-semibold">#{p.shipmentTrackingNumber || 'Unassigned'}</td>
                      <td className="p-4 text-slate-400">
                        {p.paymentTime ? new Date(p.paymentTime).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-4 font-medium text-slate-300">{p.paymentMethod}</td>
                      <td className="p-4 font-bold text-slate-200">${p.amount?.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${payBadge}`}>
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          disabled={updatingId === p.paymentId}
                          onClick={() => handleUpdatePaymentStatus(p.paymentId, p.paymentStatus)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-400 font-semibold disabled:opacity-40"
                        >
                          {updatingId === p.paymentId ? 'Updating...' : p.paymentStatus === 'PENDING' ? 'Set Settled' : 'Set Pending'}
                        </button>
                      </td>
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
