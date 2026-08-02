import LegalSections from "@/components/sections/LegalSections";
import StaticPageHero from "@/components/sections/StaticPageHero";
import StaticPageLayout from "@/components/sections/StaticPageLayout";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: "By downloading, registering, or using the Resello application or website (\"Platform\"), you agree to be bound by these Terms and Conditions (\"Terms\"). If you do not agree, you may not use our Platform. These Terms form a legally binding agreement between you and Resello Pakistan (\"Company\", \"we\", \"us\")."
  },
  {
    title: "2. Eligibility",
    list: [
      "Be at least 18 years of age, or have parental/guardian consent",
      "Be a resident of Pakistan or an authorized user in your region",
      "Provide accurate and complete registration information",
      "Not have been previously suspended or removed from our Platform"
    ],
    prefix: "To use Resello, you must:"
  },
  {
    title: "3. Reseller & Dropshipper Obligations",
    list: [
      "Accurately represent products to customers without misleading claims",
      "Set fair and honest prices — you may charge any markup above the wholesale price",
      "Not engage in fraudulent orders, fake reviews, or deceptive practices",
      "Not copy or redistribute Resello's product catalog on competing platforms",
      "Maintain professional conduct with customers and respect our community guidelines",
      "Promptly communicate order or delivery issues to our support team"
    ],
    prefix: "As a reseller or dropshipper on Resello, you agree to:"
  },
  {
    title: "4. Orders, Payments & Refunds",
    content: "All orders placed through Resello are subject to product availability. Resello reserves the right to cancel orders due to pricing errors, stock unavailability, or suspected fraud. Cash-on-delivery (COD) is our primary payment method. Resellers' profits are credited after successful delivery and payment collection. In the event of a returned order, the applicable return fee may be deducted from the reseller's earnings. Customers are entitled to a full refund if a product does not match its description or arrives damaged. Refund requests must be submitted within 3 days of delivery."
  },
  {
    title: "5. Prohibited Activities",
    list: [
      "Selling counterfeit, illegal, or prohibited goods",
      "Creating multiple accounts to exploit referral or promotional programs",
      "Unauthorized access or hacking of any part of our Platform",
      "Harassing, threatening, or abusing other users or our staff",
      "Uploading malicious software or harmful content",
      "Any activity that violates Pakistani law"
    ],
    prefix: "The following are strictly prohibited on Resello:"
  },
  {
    title: "6. Intellectual Property",
    content: "All content on the Resello Platform — including logos, product images, text, and software — is the intellectual property of Resello or its licensors. You may not reproduce, distribute, or create derivative works without our explicit written consent."
  },
  {
    title: "7. Limitation of Liability",
    content: "Resello shall not be liable for indirect, incidental, or consequential damages arising from use of the Platform, including lost profits or data. Our total liability in any matter is limited to the transaction value of the specific order in dispute."
  },
  {
    title: "8. Termination",
    content: "We reserve the right to suspend or permanently terminate your account for violation of these Terms, without prior notice. Upon termination, your access to the Platform will be immediately revoked, and any pending earnings will be reviewed on a case-by-case basis."
  },
  {
    title: "9. Governing Law",
    content: "These Terms shall be governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Any disputes shall be subject to the exclusive jurisdiction of the courts of Lahore, Punjab, Pakistan."
  },
  {
    title: "10. Changes to Terms",
    content: "Resello reserves the right to update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the revised Terms. We will notify registered users of material changes via email or in-app notification."
  }
];

const TermsPage = () => {
  return (
    <StaticPageLayout>
        <StaticPageHero
          tag="Legal"
          title="Terms & Conditions"
          description="Please read these terms carefully before using Resello's platform, app, or services. Last updated: May 2025."
        />

        <LegalSections sections={sections} />

        <div className="sp-cta-strip">
          <h3>Questions About Our Terms?</h3>
          <p>Contact our legal team at <a href="mailto:legal@resello.pk">legal@resello.pk</a></p>
        </div>

    </StaticPageLayout>
  );
};

export default TermsPage;
