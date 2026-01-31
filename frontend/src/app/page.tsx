import { Hero } from "@/components/home/Hero";
import { AIAdvisor } from "@/components/home/AIAdvisor";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { MentorList } from "@/components/home/MentorList";
import { Testimonials } from "@/components/home/Testimonials";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <Hero />
      {/* AI Advisor removed by request */}
      <FeatureGrid />
      <MentorList />
      <Testimonials />
    </div>
  );
}
