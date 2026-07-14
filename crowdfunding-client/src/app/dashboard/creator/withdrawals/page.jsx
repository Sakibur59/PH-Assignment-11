"use client";

import { useState, useEffect } from "react";
import { 
  Wallet, 
  DollarSign, 
  CreditCard, 
  ArrowUpRight,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

export default function Withdrawals() {
  const [totalRaised, setTotalRaised] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [creditsToWithdraw, setCreditsToWithdraw] = useState("");
  const [paymentSystem, setPaymentSystem] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  const paymentSystems = ["Stripe", "Bkash", "Rocket", "Nagad", "Bank Transfer"];

  useEffect(() => {
    fetchCreatorData();
    fetchWithdrawals();
  }, []);

  const fetchCreatorData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${SERVER_URL}/api/creator/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setTotalRaised(data.stats.totalRaised || 0);
        setWithdrawalAmount(data.stats.totalRaised / 20); // 20 credits = 1 dollar
      }
    } catch (error) {
      console.error('Error fetching creator data:', error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${SERVER_URL}/api/creator/withdrawals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setWithdrawals(data.withdrawals || []);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const handleCreditsChange = (e) => {
    const value = e.target.value;
    setCreditsToWithdraw(value);
    if (value) {
      const amount = parseFloat(value) / 20;
      setWithdrawalAmount(amount);
    } else {
      setWithdrawalAmount(0);
    }
  };

  const handleWithdraw = async () => {
    if (!creditsToWithdraw || !paymentSystem || !accountNumber) {
      setMessage("Please fill all fields");
      setMessageType("error");
      return;
    }

    if (parseFloat(creditsToWithdraw) > totalRaised) {
      setMessage("Insufficient credits");
      setMessageType("error");
      return;
    }

    if (totalRaised < 200) {
      setMessage("Minimum 200 credits required for withdrawal");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${SERVER_URL}/api/creator/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          creditsToWithdraw: parseFloat(creditsToWithdraw),
          paymentSystem,
          accountNumber
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage("Withdrawal request submitted successfully!");
        setMessageType("success");
        setCreditsToWithdraw("");
        setWithdrawalAmount(0);
        setPaymentSystem("");
        setAccountNumber("");
        fetchWithdrawals();
        fetchCreatorData();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.message || "Failed to submit withdrawal");
        setMessageType("error");
      }
    } catch (error) {
      console.error('Error withdrawing:', error);
      setMessage("Failed to submit withdrawal");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      'approved': { color: 'bg-[#4FAE7C]/20 text-[#4FAE7C]', icon: CheckCircle },
      'pending': { color: 'bg-[#D8A13B]/20 text-[#D8A13B]', icon: Clock },
      'rejected': { color: 'bg-[#E88A7E]/20 text-[#E88A7E]', icon: XCircle }
    };
    const config = configs[status] || configs['pending'];
    const Icon = config.icon;
    return (
      <span className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full ${config.color}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const canWithdraw = totalRaised >= 200;

  return (
    <div>
      <h2 className="text-xl font-bold text-[#F3EFE4] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
        Withdrawals
      </h2>

      {/* Total Earnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#14171F] border border-white/5 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Wallet size={24} className="text-[#D8A13B]" />
          </div>
          <div className="text-2xl font-bold text-[#F3EFE4] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
            {totalRaised} credits
          </div>
          <div className="text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Total Raised Credits
          </div>
          <div className="text-xs text-[#9AA1AE] mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            20 credits = $1.00
          </div>
        </div>

        <div className="bg-[#14171F] border border-white/5 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign size={24} className="text-[#4FAE7C]" />
          </div>
          <div className="text-2xl font-bold text-[#F3EFE4] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
            ${(totalRaised / 20).toFixed(2)}
          </div>
          <div className="text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Withdrawal Amount
          </div>
          {!canWithdraw && (
            <div className="text-xs text-[#E88A7E] mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Need 200 credits minimum to withdraw
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-[#14171F] border border-white/5 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#F3EFE4] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Request Withdrawal
        </h3>

        {message && (
          <div className={`p-4 rounded-lg mb-4 ${
            messageType === "success" 
              ? "bg-[#4FAE7C]/20 border border-[#4FAE7C] text-[#4FAE7C]" 
              : "bg-[#E88A7E]/20 border border-[#E88A7E] text-[#E88A7E]"
          }`}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Credits To Withdraw
            </label>
            <input
              type="number"
              value={creditsToWithdraw}
              onChange={handleCreditsChange}
              min="0"
              max={totalRaised}
              className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              placeholder="Enter credits"
              disabled={!canWithdraw}
            />
            <p className="text-xs text-[#9AA1AE] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Available: {totalRaised} credits
            </p>
          </div>
          <div>
            <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Withdraw Amount ($)
            </label>
            <input
              type="text"
              value={`$${withdrawalAmount.toFixed(2)}`}
              className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] cursor-not-allowed"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              disabled
              readOnly
            />
            <p className="text-xs text-[#9AA1AE] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Auto-calculated (20 credits = $1)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Payment System *
            </label>
            <select
              value={paymentSystem}
              onChange={(e) => setPaymentSystem(e.target.value)}
              className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              disabled={!canWithdraw}
            >
              <option value="">Select payment system</option>
              {paymentSystems.map(system => (
                <option key={system} value={system}>{system}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#F3EFE4] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Account Number *
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-[#1B1F2A] border border-white/10 rounded-sm px-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              placeholder="Enter account number"
              disabled={!canWithdraw}
            />
          </div>
        </div>

        {canWithdraw ? (
          <button
            onClick={handleWithdraw}
            disabled={loading || !creditsToWithdraw || !paymentSystem || !accountNumber}
            className="w-full mt-4 bg-[#D8A13B] text-[#14171F] py-3 rounded-sm hover:bg-[#c99530] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {loading ? 'Processing...' : 'Withdraw Now'}
          </button>
        ) : (
          <div className="w-full mt-4 bg-[#E88A7E]/20 text-[#E88A7E] py-3 rounded-sm text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Insufficient credit. Need at least 200 credits raised.
          </div>
        )}
      </div>

      {/* Withdrawal History */}
      <div>
        <h3 className="text-lg font-semibold text-[#F3EFE4] mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Withdrawal History
        </h3>

        {withdrawals.length === 0 ? (
          <div className="text-center py-8 bg-[#14171F] border border-white/5 rounded-lg">
            <Clock size={48} className="text-[#9AA1AE] mx-auto mb-3" />
            <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              No withdrawal history yet.
            </p>
          </div>
        ) : (
          <div className="bg-[#14171F] border border-white/5 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1B1F2A] border-b border-white/5">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Credits
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Payment System
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
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {withdrawal.withdrawalCredits}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#D8A13B]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        ${withdrawal.withdrawalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {withdrawal.paymentSystem}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {new Date(withdrawal.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(withdrawal.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}