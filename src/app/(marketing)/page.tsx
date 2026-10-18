import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { NewsRadarPreview } from "@/components/landing/news-radar-preview";
import { CommunityPreview } from "@/components/landing/community-preview";
import { Pricing } from "@/components/landing/pricing";
import { Faq, getFaq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { SiteFooter } from "@/components/landing/site-footer";
import { MobileStickyCta } from "@/components/landing/mobile-sticky-cta";
import { getSubscriptionPriceCents } from "@/lib/pricing";
import { site } from "@/lib/config/site";

export const revalidate = 3600;

export default async function LandingPage() {
  const priceCents = await getSubscriptionPriceCents();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: site.name, url: site.url, slogan: site.slogan },
      {
        "@type": "FAQPage",
        mainEntity: getFaq(priceCents).map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <SiteHeader priceCents={priceCents} />
      <main>
        <Hero priceCents={priceCents} />
        <Features />
        <NewsRadarPreview />
        <CommunityPreview />
        <Pricing priceCents={priceCents} demoMode={site.demoMode} />
        <Faq priceCents={priceCents} />
        <FinalCta />
      </main>
      <SiteFooter />
      <MobileStickyCta priceCents={priceCents} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
