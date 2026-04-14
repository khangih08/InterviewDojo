import { Separator } from "@/components/ui/separator";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import PricingSection from "@/components/landing/PricingSection";
import FaqSection from "@/components/landing/FaqSection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <Separator />
        <FeaturesSection />
        <Separator />
        <HowItWorksSection />
        <Separator />
        <TestimonialsSection />
        <Separator />
        <ComparisonSection />
        <Separator />
        <PricingSection />
        <Separator />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
