import { Suspense } from "react";
import CampaignsContent from "./CampaignsContent";

export default function CampaignsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D8A13B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9AA1AE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Loading campaigns...
          </p>
        </div>
      </div>
    }>
      <CampaignsContent />
    </Suspense>
  );
}