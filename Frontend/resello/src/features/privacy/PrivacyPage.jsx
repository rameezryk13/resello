import LegalSections from "@/components/sections/LegalSections";
import StaticPageHero from "@/components/sections/StaticPageHero";
import StaticPageLayout from "@/components/sections/StaticPageLayout";

const sections = [
  {
    title: "1. Information We Collect",
    prefix: "We collect the following types of information when you use Resello:",
    list: [
      "Account Information: Name, phone number, email, CNIC (for payment verification), and profile details provided during registration.",
      "Transaction Data: Order history, payment records, earnings, and delivery addresses.",
      "Device Information: Device type, operating system, app version, and unique device identifiers.",
      "Usage Data: Pages visited, features used, time spent, and search queries.",
      "Location Data: Approximate location for delivery logistics, with your permission.",
      "Communications: Customer support chats, feedback forms, and in-app messages."
    ]
  },
  {
    title: "2. How We Use Your Information",
    prefix: "We use your information to:",
    list: [
      "Create and manage your Resello account",
      "Process and fulfill orders placed through your account",
      "Transfer earnings to your bank, Easypaisa, or JazzCash account",
      "Send order updates, delivery notifications, and service alerts",
      "Improve our platform through analytics and user research",
      "Detect and prevent fraud or misuse of the platform",
      "Comply with legal obligations and regulatory requirements",
      "Send promotional content about new products or features (with your consent)"
    ]
  },
  {
    title: "3. Information Sharing",
    prefix: "We do not sell your personal data. We may share your information with:",
    list: [
      "Logistics Partners: TCS, Leopards, PostEx — for order delivery only.",
      "Payment Processors: For secure transfer of your earnings.",
      "Suppliers: Only your delivery address and order details when fulfilling an order.",
      "Legal Authorities: When required by Pakistani law or court order.",
      "Service Providers: Cloud hosting, analytics, and support tools — under strict data protection agreements."
    ]
  },
  {
    title: "4. Data Security",
    prefix: "We employ industry-standard security measures including:",
    list: [
      "SSL/TLS encryption for all data transmission",
      "Secure encrypted storage for sensitive account information",
      "Two-factor authentication options for account access",
      "Regular security audits and vulnerability testing",
      "Strict employee access controls on personal data"
    ],
    footer: "If you suspect unauthorized access, contact us immediately at security@resello.pk"
  },
  {
    title: "5. Cookies & Tracking",
    content: "Our website and app use cookies and similar tracking technologies to enhance your experience. You may disable cookies in your browser settings, though some features may not function correctly. We use analytics tools to understand how users interact with our platform."
  },
  {
    title: "6. Your Rights",
    prefix: "As a Resello user, you have the right to:",
    list: [
      "Access the personal data we hold about you",
      "Request correction of inaccurate information",
      "Request deletion of your account and associated data",
      "Opt out of promotional communications at any time",
      "Export your data in a portable format upon request"
    ],
    footer: "To exercise any of these rights, email us at privacy@resello.pk"
  },
  {
    title: "7. Data Retention",
    content: "We retain your personal data for as long as your account is active, plus up to 5 years after account closure for legal and financial compliance. Transaction records may be retained longer if required by tax or regulatory authorities."
  },
  {
    title: "8. Children's Privacy",
    content: "Resello is not intended for users under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has registered, we will promptly delete their account and associated data."
  },
  {
    title: "9. Third-Party Links",
    content: "Our platform may contain links to third-party websites or services. Resello is not responsible for the privacy practices of these external sites. We encourage you to review the privacy policy of any third-party site you visit."
  },
  {
    title: "10. Policy Updates",
    content: "We may update this Privacy Policy periodically. When we do, we will revise the Last Updated date and notify you via in-app alert or email. Continued use of Resello after changes means you accept the updated policy. Last Updated: May 26, 2025."
  }
];

const PrivacyPage = () => {
  return (
    <StaticPageLayout>
        <StaticPageHero
          tag="Privacy"
          title="Privacy Policy"
          description="Your privacy matters to us. Here is exactly how we collect, use, and protect your personal information on Resello. Last updated: May 2025."
        />

        <LegalSections sections={sections} />

        <div className="sp-cta-strip">
          <h3>Privacy Questions or Concerns?</h3>
          <p>Reach our privacy team at <a href="mailto:privacy@resello.pk">privacy@resello.pk</a> — we respond within 48 hours.</p>
        </div>

    </StaticPageLayout>
  );
};

export default PrivacyPage;
