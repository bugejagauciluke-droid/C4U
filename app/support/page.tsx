import { readSiteConfig } from "@/lib/site-config";
import { getUserTier } from "@/lib/subscription";
import { SupportClient } from "./support-client";

export default async function SupportPage() {
  const { support } = readSiteConfig();
  const tier = await getUserTier();

  return (
    <SupportClient
      config={{
        pageHeadline: support.pageHeadline,
        pageSubtitle: support.pageSubtitle,
        situations: support.situations,
        pricingHeadline: support.pricingHeadline,
        price: support.price,
        pricingSubtext: support.pricingSubtext,
      }}
      userTier={tier}
    />
  );
}
