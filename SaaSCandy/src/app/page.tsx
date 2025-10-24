'use client';

import {
  PortfolioPageContent,
  PricingPageContent,
  ServicePageContent,
} from '@/components/pages';

import HeroSection from '@/components/HeroSection';
import { FAQSection, JoinUsSection } from '@/components';

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
