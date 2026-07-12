'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { campaignAPI, contributionAPI } from '@/services/api';
import { useAuth } from '@/components/providers/AuthProvider';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CampaignDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contributionAmount, setContributionAmount] = useState(0);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await campaignAPI.getById(id);
      setCampaign(response.data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast.error('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleContribution = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to contribute');
      router.push('/login');
      return;
    }

    if (user.role !== 'supporter') {
      toast.error('Only supporters can contribute');
      return;
    }

    if (contributionAmount < campaign.minimumContribution) {
      toast.error(`Minimum contribution is ${campaign.minimumContribution} credits`);
      return;
    }

    if (contributionAmount > user.credits) {
      toast.error('Insufficient credits. Please purchase more credits.');
      return;
    }

    try {
      setSubmitting(true);
      await contributionAPI.create({
        campaignId: id,
        amount: contributionAmount,
        message: message
      });
      toast.success('Contribution submitted! Waiting for approval.');
      setContributionAmount(0);
      setMessage('');
      fetchCampaign();
    } catch (error) {
      console.error('Contribution error:', error);
      toast.error(error.response?.data?.message || 'Failed to contribute');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Campaign not found</div>
      </div>
    );
  }

  const progress = Math.min((campaign.amountRaised / campaign.fundingGoal) * 100, 100);
  const daysLeft = Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-96">
            <img
              src={campaign.imageUrl || '/placeholder.jpg'}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {campaign.title}
                </h1>
                <p className="text-gray-600 mb-4">by {campaign.creatorName}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                    {campaign.category}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {campaign.status}
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                  </span>
                </div>

                <div className="prose max-w-none mb-6">
                  <h3 className="text-lg font-semibold mb-2">Story</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{campaign.story}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Rewards</h3>
                  <p className="text-gray-700">{campaign.rewardInfo}</p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Raised: ${campaign.amountRaised}</span>
                      <span>Goal: ${campaign.fundingGoal}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-indigo-600 h-3 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {campaign.totalSupporters} supporters
                    </p>
                  </div>

                  {/* Campaign Info */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><strong>Minimum Contribution:</strong> {campaign.minimumContribution} credits</p>
                    <p><strong>Deadline:</strong> {new Date(campaign.deadline).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {campaign.status}</p>
                  </div>

                  {/* Contribution Form */}
                  {campaign.status === 'approved' && new Date(campaign.deadline) > new Date() && (
                    <form onSubmit={handleContribution} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contribution Amount (credits)
                        </label>
                        <input
                          type="number"
                          min={campaign.minimumContribution}
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter amount"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum: {campaign.minimumContribution} credits
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message (optional)
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows="2"
                          placeholder="Leave a message for the creator..."
                        />
                      </div>

                      {isAuthenticated ? (
                        <button
                          type="submit"
                          disabled={submitting || !user.credits || user.credits < campaign.minimumContribution}
                          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? 'Processing...' : 'Contribute Now'}
                        </button>
                      ) : (
                        <Link
                          href="/login"
                          className="block w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Login to Contribute
                        </Link>
                      )}

                      {isAuthenticated && user.role === 'supporter' && (
                        <p className="text-xs text-gray-500 text-center">
                          Available credits: {user.credits}
                          <Link href="/dashboard/supporter/purchase-credit" className="text-indigo-600 ml-1 hover:underline">
                            Buy more credits
                          </Link>
                        </p>
                      )}
                    </form>
                  )}

                  {campaign.status !== 'approved' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                      This campaign is not currently accepting contributions.
                    </div>
                  )}

                  {new Date(campaign.deadline) < new Date() && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
                      This campaign deadline has passed.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}