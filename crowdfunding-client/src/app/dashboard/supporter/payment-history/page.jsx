// client/src/app/dashboard/supporter/payment-history/page.jsx
"use client";

import { useState, useEffect } from "react";
import { History, ArrowDownRight, ArrowUpRight, Filter, Download } from "lucide-react";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${SERVER_URL}/api/supporter/payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      
      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = (type) => {
    if (type === 'purchase') return <CreditCard size={16} className="text-[#4FAE7C]" />;
    return <DollarSign size={16} className="text-[#E88A7E]" />;
  };

  const filteredPayments = payments.filter(payment => 
    filterType === "all" || payment.type === filterType
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#F3EFE4]">Loading payment history...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#F3EFE4] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
        Payment History
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Filter size={18} className="text-[#9AA1AE]" />
        <div className="flex flex-wrap gap-2">
          {['all', 'purchase', 'contribution'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-sm text-sm transition-colors ${
                filterType === type
                  ? 'bg-[#D8A13B] text-[#14171F]'
                  : 'bg-[#1B1F2A] text-[#9AA1AE] hover:text-[#F3EFE4]'
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <button className="ml-auto flex items-center gap-2 bg-[#1B1F2A] px-3 py-1.5 rounded-sm text-[#9AA1AE] hover:text-[#F3EFE4] transition-colors text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <Download size={16} />
          Export
        </button>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="text-center py-12 bg-[#14171F] border border-white/5 rounded-lg">
          <History size={48} className="text-[#9AA1AE] mx-auto mb-3" />
          <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            No payment history found.
          </p>
        </div>
      ) : (
        <div className="bg-[#14171F] border border-white/5 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1B1F2A] border-b border-white/5">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Credits
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Campaign
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 text-sm">
                        {payment.type === "purchase" ? (
                          <ArrowDownRight size={16} className="text-[#4FAE7C]" />
                        ) : (
                          <ArrowUpRight size={16} className="text-[#E88A7E]" />
                        )}
                        <span className="text-[#F3EFE4] capitalize" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {payment.type}
                        </span>
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${
                      payment.type === "purchase" ? "text-[#4FAE7C]" : "text-[#E88A7E]"
                    }`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {payment.type === "purchase" ? `+${payment.credits}` : payment.credits}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {payment.campaignTitle || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        payment.status === "completed" || payment.status === "approved"
                          ? "bg-[#4FAE7C]/20 text-[#4FAE7C]"
                          : payment.status === "pending"
                          ? "bg-[#D8A13B]/20 text-[#D8A13B]"
                          : "bg-[#E88A7E]/20 text-[#E88A7E]"
                      }`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}