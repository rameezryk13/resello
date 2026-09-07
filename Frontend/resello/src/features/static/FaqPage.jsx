import { HelpCircle, Search } from "lucide-react";
import { useState } from "react";
import Header from "@/components/layout/Header/Header";
import AccountHero from "@/components/sections/AccountHero";
import "./FaqPage.css";

const FAQ_ITEMS = [
  {
    q: "How does reseller profit payout work?",
    a: "When you place a reseller order, you set your own retail price above the wholesale cost. Once the order is successfully delivered to your customer, your profit is credited to your Resello Wallet.",
  },
  {
    q: "How do I withdraw earnings from my wallet?",
    a: "Go to your Wallet or Profit Account page, link your Bank Account, JazzCash, or EasyPaisa, and submit a withdrawal request. Approvals are processed promptly to your linked account.",
  },
  {
    q: "Can I change my Shop Name or City Name after setting it?",
    a: "No. For security and brand integrity, Shop Name and City Name can be set ONCE when empty and become permanently locked afterwards.",
  },
  {
    q: "What payment methods are supported for customers?",
    a: "We support Cash on Delivery (COD), JazzCash, EasyPaisa, and direct Bank Transfers.",
  },
  {
    q: "How can customers leave reviews with photos?",
    a: "Once an order status reaches 'Delivered', a review notification is sent. Customers can rate products with 5 stars, write comments, and upload product photos.",
  },
];

const FaqPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) =>
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <Header />
      <AccountHero
        title="Help Center &amp; Frequently Asked Questions"
        subtitle="Find quick answers regarding reseller profits, order delivery, account safety, and payment methods."
      />
      <main className="container static-page-container">
        <div style={{ position: "relative", maxWidth: 600, margin: "0 auto 20px auto", width: "100%" }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: 14, color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", height: 46, paddingLeft: 42, paddingRight: 16, borderRadius: 8, border: "1px solid #cbd5e1" }}
          />
        </div>

        <div className="faq-list">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <div className="faq-question">❓ {faq.q}</div>
                <div className="faq-answer">{faq.a}</div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#64748b", padding: 30 }}>
              No matching questions found for "{searchTerm}".
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default FaqPage;
