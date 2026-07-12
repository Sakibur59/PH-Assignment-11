import HeroSection from "@/components/home/Herosection";
import HowItWorks from "@/components/home/Howitworks";
import Testimonials from "@/components/home/Testimonials";
import TopFundedCampaigns from "@/components/home/TopFundedCampaigns";


export default function Home() {
  return (
    <main>
      <HeroSection></HeroSection>
      <TopFundedCampaigns></TopFundedCampaigns>
      <Testimonials></Testimonials>
      <HowItWorks></HowItWorks>
    </main>
  );
}