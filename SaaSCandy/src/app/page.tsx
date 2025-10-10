'use client';

import HeroSection from '@/components/HeroSection';
import ServicePage from '@/components/ServicePage';
import PortfolioPage from '@/components/PortfolioPage';
import PricingPage from '@/components/PricingPage';
import FAQSection from '@/components/FAQSection';
import JoinUsSection from '@/components/JoinUsSection';

function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicePage />
      <PortfolioPage />
      <PricingPage />
      <FAQSection />
      <JoinUsSection />
    </>
  );
}

export default HomePage;
