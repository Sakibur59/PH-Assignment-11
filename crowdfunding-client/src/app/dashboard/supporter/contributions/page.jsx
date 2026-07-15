"use client";

import { useState, useEffect } from "react";
import { Heart, Calendar, DollarSign, Filter, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

export default function MyContributions() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${SERVER_URL}/api/supporter/contributions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contributions');
      }

      const data = await response.json();
      
      if (data.success) {
        setContributions(data.contributions || []);
        setTotalItems(data.contributions?.length || 0);
        setCurrentPage(1); // Reset to first page when data loads
      }
    } catch (error) {
      console.error('Error fetching contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'approved': { color: 'bg-[#4FAE7C]/20 text-[#4FAE7C]', icon: CheckCircle },
      'pending': { color: 'bg-[#D8A13B]/20 text-[#D8A13B]', icon: Clock },
      'rejected': { color: 'bg-[#E88A7E]/20 text-[#E88A7E]', icon: XCircle }
    };
    return configs[status] || configs['pending'];
  };

  // Get current page data
  const getCurrentPageData = () => {
    const filtered = contributions.filter(contribution => 
      filterStatus === "all" || contribution.status === filterStatus
    );
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      data: filtered.slice(startIndex, endIndex),
      total: filtered.length
    };
  };

  const { data: currentData, total: filteredTotal } = getCurrentPageData();
  const totalPages = Math.ceil(filteredTotal / itemsPerPage);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of the table
      document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#F3EFE4]">Loading contributions...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#F3EFE4] mb-6" style={{ fontFamily: "'Fraunces', serif" }}>
        My Contributions
      </h2>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Filter size={18} className="text-[#9AA1AE]" />
        <div className="flex flex-wrap gap-2">
          {['all', 'approved', 'pending', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-sm text-sm transition-colors ${
                filterStatus === status
                  ? 'bg-[#D8A13B] text-[#14171F]'
                  : 'bg-[#1B1F2A] text-[#9AA1AE] hover:text-[#F3EFE4]'
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-[#9AA1AE] text-sm ml-auto" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Total: {filteredTotal} contributions
        </span>
      </div>

      {filteredTotal === 0 ? (
        <div className="text-center py-12 bg-[#14171F] border border-white/5 rounded-lg">
          <Heart size={48} className="text-[#9AA1AE] mx-auto mb-3" />
          <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            No contributions found.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-[#14171F] border border-white/5 rounded-lg overflow-hidden table-container">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1B1F2A] border-b border-white/5">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Campaign
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-[#9AA1AE] uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Creator
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
                  {currentData.map((contribution) => {
                    const statusConfig = getStatusConfig(contribution.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={contribution._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm text-[#F3EFE4]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {contribution.campaignTitle}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#D8A13B]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          ${contribution.amount}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {contribution.creatorName || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {new Date(contribution.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full ${statusConfig.color}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            <StatusIcon size={14} />
                            {contribution.status.charAt(0).toUpperCase() + contribution.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-sm text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTotal)} of {filteredTotal} entries
              </div>
              
              <div className="flex items-center gap-1">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md transition-colors ${
                    currentPage === 1
                      ? 'text-[#9AA1AE]/30 cursor-not-allowed'
                      : 'text-[#9AA1AE] hover:text-[#F3EFE4] hover:bg-white/5'
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {getPageNumbers().map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        currentPage === page
                          ? 'bg-[#D8A13B] text-[#14171F] font-medium'
                          : 'text-[#9AA1AE] hover:text-[#F3EFE4] hover:bg-white/5'
                      }`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md transition-colors ${
                    currentPage === totalPages
                      ? 'text-[#9AA1AE]/30 cursor-not-allowed'
                      : 'text-[#9AA1AE] hover:text-[#F3EFE4] hover:bg-white/5'
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}