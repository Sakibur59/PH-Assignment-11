// client/src/app/dashboard/supporter/purchase-credit/page.jsx - COMPLETE FIX
"use client";

import { useState, useEffect } from "react";
import { CreditCard, Zap, Check, Loader, Shield } from "lucide-react";

export default function PurchaseCredit() {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    fetchCurrentCredits();
  }, []);

  const fetchCurrentCredits = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return;
      }

      console.log('Fetching credits...');
      const response = await fetch(`${SERVER_URL}/api/user/credits`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Credits response:', data);
      
      if (data.success) {
        setCredits(data.credits || 0);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      setError('Failed to load credits. Please try again.');
    }
  };

  const packages = [
    { id: 1, credits: 100, price: 10, label: '100 Credits', popular: false },
    { id: 2, credits: 300, price: 25, label: '300 Credits', popular: true },
    { id: 3, credits: 800, price: 60, label: '800 Credits', popular: false },
    { id: 4, credits: 1500, price: 110, label: '1500 Credits', popular: false },
  ];

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setProcessing(true);
    setSuccessMessage("");
    setError("");

    try {
      const pkg = packages.find(p => p.id === selectedPackage);
      const token = localStorage.getItem('access_token');
      
      console.log('Purchasing credits:', pkg);
      
      const response = await fetch(`${SERVER_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          credits: pkg.credits,
          amount: pkg.price * 100,
          packageId: pkg.id
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Payment failed');
      }

      const data = await response.json();
      console.log('Payment response:', data);
      
      if (data.success) {
        setSuccessMessage(`Successfully purchased ${pkg.credits} credits!`);
        setCredits(data.newCredits);
        setSelectedPackage(null);
        
        // Refresh credits after a moment
        setTimeout(() => {
          fetchCurrentCredits();
        }, 1000);
        
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      } else {
        setError(data.message || 'Failed to purchase credits');
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      setError('Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[#F3EFE4] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
        Purchase Credits
      </h2>

      {/* Error Message */}
      {error && (
        <div className="bg-[#E88A7E]/20 border border-[#E88A7E] text-[#E88A7E] rounded-lg p-4 mb-6">
          <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{error}</span>
        </div>
      )}

      {/* Current Credits */}
      <div className="bg-[#14171F] border border-white/5 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Your Current Balance
          </p>
          <p className="text-3xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
            {credits} <span className="text-lg text-[#9AA1AE]">credits</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            10 credits = $1.00
          </p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-[#4FAE7C]/20 border border-[#4FAE7C] text-[#4FAE7C] rounded-lg p-4 mb-6 flex items-center gap-3">
          <Check size={20} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{successMessage}</span>
        </div>
      )}

      {/* Credit Packages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg.id)}
            className={`bg-[#14171F] border-2 rounded-lg p-6 text-center cursor-pointer transition-all relative ${
              selectedPackage === pkg.id
                ? "border-[#D8A13B] shadow-lg shadow-[#D8A13B]/10"
                : "border-white/5 hover:border-[#D8A13B]/30"
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-2 right-4 bg-[#D8A13B] text-[#14171F] text-xs px-3 py-1 rounded-full font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Best Value
              </span>
            )}
            <div className="mt-2">
              <div className="text-4xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
                {pkg.credits}
              </div>
              <div className="text-[#9AA1AE] text-sm mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Credits
              </div>
              <div className="text-2xl font-bold text-[#D8A13B] mt-3" style={{ fontFamily: "'Fraunces', serif" }}>
                ${pkg.price}
              </div>
              <div className="text-xs text-[#9AA1AE] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                ${(pkg.price / pkg.credits * 10).toFixed(2)} per 10 credits
              </div>
              {selectedPackage === pkg.id && (
                <div className="mt-3 text-[#D8A13B]">
                  <Check size={20} className="mx-auto" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Purchase Button */}
      {selectedPackage && (
        <div className="bg-[#14171F] border border-white/5 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap size={24} className="text-[#D8A13B]" />
            <div>
              <p className="text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Ready to purchase {packages.find(p => p.id === selectedPackage)?.credits} credits?
              </p>
              <p className="text-[#9AA1AE] text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Total: ${packages.find(p => p.id === selectedPackage)?.price}
              </p>
            </div>
          </div>
          <button
            onClick={handlePurchase}
            disabled={processing}
            className="bg-[#D8A13B] text-[#14171F] px-6 py-2 rounded-sm hover:bg-[#c99530] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {processing ? (
              <>
                <Loader size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard size={16} />
                Pay Now
              </>
            )}
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#9AA1AE]">
        <Shield size={14} />
        <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Secure payment powered by Stripe
        </span>
      </div>
    </div>
  );
}