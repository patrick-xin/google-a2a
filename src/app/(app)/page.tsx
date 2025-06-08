import A2ABenefitsSection from "@/components/landing/benefit";
import A2ACommunitySection from "@/components/landing/community";
import A2AGetStartedSection from "@/components/landing/get-started";
import A2AHeroSection from "@/components/landing/hero";
import A2AMCPSection from "@/components/landing/mcp";
import A2AProblemSection from "@/components/landing/problem";
import A2ATechnicalSection from "@/components/landing/technical";

function Page() {
  return (
    <>
      <A2AHeroSection />
      <A2AProblemSection />
      <A2ABenefitsSection />
      <A2AMCPSection />
      <A2ACommunitySection />
      <A2ATechnicalSection />
      <A2AGetStartedSection />
    </>
  );
}

export default Page;
