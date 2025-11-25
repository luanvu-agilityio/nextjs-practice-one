'use client';

import {
  FAQSection,
  HeroSection,
  JoinUsSection,
  PortfolioPageContent,
  PricingPageContent,
  ServicePageContent,
} from '@/features';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <ServicePageContent />
      <PortfolioPageContent />
      <PricingPageContent />
      <FAQSection />
      <JoinUsSection />
    </>
  );
};

export default HomePage;
