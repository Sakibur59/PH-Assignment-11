'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter } from 'lucide-react';

export default function CampaignsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get category from URL
  const categoryFromUrl = searchParams.get('category') || '';
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
  const [error, setError] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

  const categories = [
    'all', 
    'Technology', 
    'Education', 
    'Environment', 
    'Health', 
    'Arts', 
    'Community',
    'Film',
    'Music',
    'Product',
    'Cause'
  ];

  // Debounce effect - 500ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update URL when category changes
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      router.push(`/campaigns?category=${encodeURIComponent(selectedCategory)}`, { scroll: false });
    } else if (selectedCategory === 'all') {
      router.push('/campaigns', { scroll: false });
    }
  }, [selectedCategory, router]);

  // Set category from URL on mount
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // Fetch campaigns when debouncedSearch or selectedCategory changes
  useEffect(() => {
    fetchCampaigns();
  }, [debouncedSearch, selectedCategory]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      let url = `${SERVER_URL}/api/campaigns/approved`;
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.campaigns || []);
      } else {
        setError(data.message || 'Failed to load campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load campaigns. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (raised, goal) => {
    if (!raised || !goal) return 0;
    return Math.min((raised / goal) * 100, 100);
  };

  const formatDate = (date) => {
    if (!date) return 'No deadline';
    const d = new Date(date);
    const daysLeft = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return 'Ended';
    if (daysLeft === 0) return 'Today';
    if (daysLeft === 1) return '1 day left';
    return `${daysLeft} days left`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Technology': 'bg-blue-500/10 text-blue-600 border-blue-200',
      'Education': 'bg-green-500/10 text-green-600 border-green-200',
      'Environment': 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      'Health': 'bg-red-500/10 text-red-600 border-red-200',
      'Arts': 'bg-purple-500/10 text-purple-600 border-purple-200',
      'Community': 'bg-orange-500/10 text-orange-600 border-orange-200',
      'Film': 'bg-pink-500/10 text-pink-600 border-pink-200',
      'Music': 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
      'Product': 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
      'Cause': 'bg-rose-500/10 text-rose-600 border-rose-200',
    };
    return colors[category] || 'bg-gray-500/10 text-gray-600 border-gray-200';
  };

  // Clear filter
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    router.push('/campaigns', { scroll: false });
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D8A13B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Loading campaigns...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-[#0B0D14] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#F3EFE4]" style={{ fontFamily: "'Fraunces', serif" }}>
            Explore Campaigns
          </h1>
          <p className="mt-2 text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Discover amazing projects and support creators
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[#14171F] border border-white/5 rounded-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA1AE]" />
              <input
                type="text"
                placeholder="Search campaigns by title or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1B1F2A] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              />
              {loading && searchTerm !== debouncedSearch && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-[#D8A13B] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="md:w-48 relative">
              <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA1AE]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#1B1F2A] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[#F3EFE4] focus:border-[#D8A13B] focus:outline-none transition-colors appearance-none"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {(selectedCategory !== 'all' || searchTerm) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-[#D8A13B] hover:text-[#c99530] transition-colors text-sm whitespace-nowrap"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Clear Filters ✕
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <div className="text-[#9AA1AE] text-sm mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Found {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-[#E88A7E]/20 border border-[#E88A7E] text-[#E88A7E] rounded-lg p-4 mb-6">
            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{error}</p>
          </div>
        )}

        {/* Campaigns Grid */}
        {campaigns.length === 0 && !loading ? (
          <div className="text-center py-12 bg-[#14171F] border border-white/5 rounded-lg">
            <Search size={48} className="text-[#9AA1AE] mx-auto mb-3" />
            <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              No campaigns found matching your criteria.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-[#D8A13B] hover:text-[#c99530] transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const progress = calculateProgress(campaign.raised, campaign.goal);
              const daysLeft = formatDate(campaign.deadline);
              const isEnded = daysLeft === 'Ended';
              
              return (
                <div 
                  key={campaign._id} 
                  className="bg-[#14171F] border border-white/5 rounded-lg overflow-hidden hover:border-[#D8A13B]/30 transition-all hover:shadow-xl hover:shadow-[#D8A13B]/5 group"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={campaign.imageUrl || 'https://picsum.photos/seed/' + campaign._id + '/400/300'}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://picsum.photos/seed/' + campaign._id + '/400/300';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(campaign.category)}`}>
                        {campaign.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isEnded 
                          ? 'bg-[#E88A7E]/20 text-[#E88A7E] border border-[#E88A7E]' 
                          : 'bg-[#4FAE7C]/20 text-[#4FAE7C] border border-[#4FAE7C]'
                      }`}>
                        {isEnded ? 'Ended' : daysLeft}
                      </span>
                    </div>
                    {campaign.raised > 0 && (
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="w-full bg-[#1B1F2A]/80 backdrop-blur rounded-full h-2">
                          <div
                            className="bg-[#D8A13B] h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-[#F3EFE4] mb-1 line-clamp-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {campaign.title}
                    </h3>
                    <p className="text-[#9AA1AE] text-sm mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      by {campaign.creatorName}
                    </p>
                    <p className="text-[#9AA1AE] text-sm mb-4 line-clamp-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {campaign.story}
                    </p>
                    
                    <div className="flex justify-between text-sm mb-4">
                      <div>
                        <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          Raised
                        </p>
                        <p className="text-[#F3EFE4] font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
                          ${campaign.raised || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          Goal
                        </p>
                        <p className="text-[#F3EFE4] font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
                          ${campaign.goal}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#9AA1AE] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          Supporters
                        </p>
                        <p className="text-[#F3EFE4] font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
                          {campaign.contributors || 0}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/campaigns/${campaign._id}`)}
                      className="w-full bg-[#D8A13B] text-[#14171F] py-2.5 rounded-lg hover:bg-[#c99530] transition-colors font-medium text-sm"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}