import { useState, useEffect } from "react";
import Header from "@/components/layout/Header/Header";
import AccountHero from "@/components/sections/AccountHero";
import { useToast } from "@/context/ToastContext";
import { get, post } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import ContactHeaderBar from "./components/ContactHeaderBar";
import ContactTabsNav from "./components/ContactTabsNav";
import ContactNewRequestForm from "./components/ContactNewRequestForm";
import ContactIssuesList from "./components/ContactIssuesList";
import "./ContactPage.css";

// Issue Type Options matching exact dropdown menu in mockup
const ISSUE_OPTIONS = [
  "Delivery Issues",
  "Payment Issues",
  "Return Issues",
  "App/OTP",
  "Other",
];

// Initial mock issues for demonstration with rich chat history and admin picture attachments
const INITIAL_ISSUES = [
  {
    id: "ISS-982341",
    issueType: "Delivery Issues",
    description: "My order #RES-4029 was supposed to arrive yesterday, but courier has not updated the tracking status yet. Please check with the delivery partner.",
    attachments: [
      {
        name: "tracking_screenshot.png",
        size: "245 KB",
        type: "image/png",
        isImage: true,
        url: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80",
      },
    ],
    status: "active",
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    adminReply: null, // Pending reply
  },
  {
    id: "ISS-409218",
    issueType: "Delivery Issues",
    senderName: "Hamza Deals",
    description:
      "The courier marked this order as delivered but my customer says nothing arrived at their door. Can you check with the 3PL?",
    attachments: [
      {
        name: "parcel_proof.jpg",
        size: "340 KB",
        type: "image/jpeg",
        isImage: true,
        url: "/images/support/parcel_proof.jpg",
      },
    ],
    status: "resolved",
    createdAt: "2026-08-02T10:00:00.000Z",
    resolvedAt: "2026-08-02T11:45:00.000Z",
    adminReply: {
      text:
        "Checked with TCS — the parcel was delivered to a neighboring unit by mistake. We've asked the courier to recover and redeliver within 24 hours. Let us know if it isn't resolved by tomorrow.",
      repliedAt: "2026-08-02T11:45:00.000Z",
      adminName: "Admin",
      attachments: [
        {
          name: "courier_proof.jpg",
          size: "420 KB",
          type: "image/jpeg",
          isImage: true,
          url: "/images/support/courier_proof.jpg",
        },
      ],
    },
  },
  {
    id: "ISS-553018",
    issueType: "Return Issues",
    description: "Customer received a defective smartwatch (screen flickering). Return requested for order #RES-3912.",
    attachments: [
      {
        name: "defective_watch_photo.jpg",
        size: "520 KB",
        type: "image/jpeg",
        isImage: true,
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
      },
    ],
    status: "resolved",
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    resolvedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    adminReply: {
      text: "We have reviewed the defective unit report and approved a full replacement order #REP-8821. The replacement has already been dispatched via express courier with 0 delivery charge. Attached is your replacement invoice and courier dispatch slip.",
      repliedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      adminName: "Resello Quality & Returns Team",
      attachments: [
        {
          name: "replacement_dispatch_slip.jpg",
          size: "340 KB",
          type: "image/jpeg",
          isImage: true,
          url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80",
        },
      ],
    },
  },
];

// Quick Admin Proof Preset Templates for easy demonstration
const DEMO_ADMIN_PROOFS = [
  {
    label: "Bank Transfer Voucher",
    name: "official_bank_voucher_proof.png",
    size: "380 KB",
    type: "image/png",
    isImage: true,
    url: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&q=80",
  },
  {
    label: "Courier Dispatch Slip",
    name: "courier_dispatch_slip.jpg",
    size: "420 KB",
    type: "image/jpeg",
    isImage: true,
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80",
  },
  {
    label: "Settlement Invoice",
    name: "account_settlement_receipt.png",
    size: "290 KB",
    type: "image/png",
    isImage: true,
    url: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&q=80",
  },
];

const ContactPage = () => {
  const toast = useToast();

  // Tab State: "new" | "active" | "resolved"
  const [activeTab, setActiveTab] = useState("new");

  // Form State
  const [selectedIssueType, setSelectedIssueType] = useState("Delivery Issues");
  const [customIssueType, setCustomIssueType] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".issue-dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Issues List State
  const [issues, setIssues] = useState(() => {
    const saved = localStorage.getItem("resello_support_issues");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // use initial
      }
    }
    return INITIAL_ISSUES;
  });

  const [expandedIssueId, setExpandedIssueId] = useState("ISS-409218");

  // Demo Admin Reply Form State per issue (Text & Attachments)
  const [replyInput, setReplyInput] = useState({});
  const [adminAttachmentsInput, setAdminAttachmentsInput] = useState({});

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("resello_support_issues", JSON.stringify(issues));
  }, [issues]);

  // Fetch real issues from backend if available
  useEffect(() => {
    async function fetchIssues() {
      try {
        const data = await get(endpoints.support.issues);
        if (data && Array.isArray(data.issues) && data.issues.length > 0) {
          setIssues(data.issues);
        }
      } catch {
        // Fallback to local storage/mock state if unauthenticated or offline
      }
    }
    fetchIssues();
  }, []);

  // Helper to count words
  const countWords = (str) => {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  const wordCount = countWords(description);
  const isDescriptionValid = wordCount >= 5;

  // File upload handler for customer request
  const handleFileSelect = (files) => {
    const fileList = Array.from(files);
    const newAttachments = fileList.map((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const previewUrl = isImage || isVideo ? URL.createObjectURL(file) : null;

      // format file size
      let sizeStr = `${(file.size / 1024).toFixed(0)} KB`;
      if (file.size > 1024 * 1024) {
        sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        type: file.type,
        size: sizeStr,
        isImage,
        isVideo,
        url: previewUrl,
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  // Submit New Request
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (countWords(description) < 5) {
      toast.error("Description must contain at least 5 words.");
      return;
    }

    if (selectedIssueType === "Other" && !customIssueType.trim()) {
      toast.error("Please specify your issue type.");
      return;
    }

    setSubmitting(true);

    const finalIssueType =
      selectedIssueType === "Other"
        ? customIssueType.trim() || "Other Issue"
        : selectedIssueType;

    const payload = {
      issueType: finalIssueType,
      description: description.trim(),
      attachments: attachments.map((a) => ({
        name: a.name,
        type: a.type,
        size: a.size,
        isImage: a.isImage,
        isVideo: a.isVideo,
        url: a.url,
      })),
    };

    try {
      const res = await post(endpoints.support.issues, payload);
      if (res && res.issue) {
        setIssues((prev) => [res.issue, ...prev]);
        setExpandedIssueId(res.issue.id);
      } else {
        throw new Error("Local save");
      }
    } catch {
      // Fallback local issue creation
      const localIssue = {
        id: `ISS-${Math.floor(100000 + Math.random() * 900000)}`,
        issueType: finalIssueType,
        description: description.trim(),
        attachments: payload.attachments,
        status: "active",
        createdAt: new Date().toISOString(),
        adminReply: null,
      };
      setIssues((prev) => [localIssue, ...prev]);
      setExpandedIssueId(localIssue.id);
    }

    toast.success("Support request submitted successfully! Support team will reply shortly in chat.");
    setDescription("");
    setCustomIssueType("");
    setSelectedIssueType("Delivery Issues");
    setAttachments([]);
    setSubmitting(false);
    setActiveTab("active");
  };

  // Admin reply attachment handling for simulator
  const handleAdminFileUpload = (issueId, files) => {
    const fileList = Array.from(files);
    const newItems = fileList.map((file) => {
      const isImage = file.type.startsWith("image/");
      return {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        isImage,
        url: isImage ? URL.createObjectURL(file) : null,
      };
    });

    setAdminAttachmentsInput((prev) => ({
      ...prev,
      [issueId]: [...(prev[issueId] || []), ...newItems],
    }));
  };

  const addPresetAdminProof = (issueId, preset) => {
    setAdminAttachmentsInput((prev) => ({
      ...prev,
      [issueId]: [...(prev[issueId] || []), preset],
    }));
    toast.success(`Attached "${preset.label}" image proof!`);
  };

  const removeAdminAttachment = (issueId, index) => {
    setAdminAttachmentsInput((prev) => ({
      ...prev,
      [issueId]: (prev[issueId] || []).filter((_, idx) => idx !== index),
    }));
  };

  // Demo Admin Reply Submission with Pictures and Chat
  const handleAdminReplySubmit = async (issueId) => {
    const text = replyInput[issueId]?.trim();
    if (!text) {
      toast.error("Please enter an admin reply message.");
      return;
    }

    const targetIssue = issues.find((i) => i.id === issueId);
    if (targetIssue && targetIssue.adminReply) {
      toast.error("Admin response limit reached! Only a single reply is allowed per request.");
      return;
    }

    const attachedPhotos = adminAttachmentsInput[issueId] || [];

    const replyPayload = {
      replyText: text,
      attachments: attachedPhotos,
      resolveIssue: true,
      adminName: "Resello Customer Support Team",
    };

    try {
      await post(endpoints.support.reply(issueId), replyPayload);
    } catch {
      // Fallback local update
    }

    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === issueId) {
          return {
            ...item,
            status: "resolved",
            resolvedAt: new Date().toISOString(),
            adminReply: {
              text,
              attachments: attachedPhotos,
              repliedAt: new Date().toISOString(),
              adminName: "Resello Support Specialist",
            },
          };
        }
        return item;
      })
    );

    toast.success("Admin reply & pictures sent! Ticket resolved and updated in Chat Box.");
    setReplyInput((prev) => ({ ...prev, [issueId]: "" }));
    setAdminAttachmentsInput((prev) => ({ ...prev, [issueId]: [] }));
    setActiveTab("resolved");
    setExpandedIssueId(issueId);
  };

  // Filter Issues
  const activeIssues = issues.filter((i) => i.status === "active" || i.status === "pending");
  const resolvedIssues = issues.filter((i) => i.status === "resolved");

  return (
    <div className="animate-fade-in">
      <Header />
      <AccountHero
        title="Contact & Customer Support Center"
        subtitle="Submit inquiries, view admin chat replies, inspect shared proofs & pictures, and track resolutions."
      />

      <main className="container static-page-container">
        {/* Contact Info Header Bar */}
        <ContactHeaderBar />

        {/* 3 OPTIONS TAB NAVIGATION BAR */}
        <ContactTabsNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeIssuesCount={activeIssues.length}
          resolvedIssuesCount={resolvedIssues.length}
        />

        {/* TAB 1: NEW REQUEST */}
        {activeTab === "new" && (
          <ContactNewRequestForm
            onSubmit={handleSubmit}
            selectedIssueType={selectedIssueType}
            setSelectedIssueType={setSelectedIssueType}
            customIssueType={customIssueType}
            setCustomIssueType={setCustomIssueType}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
            issueOptions={ISSUE_OPTIONS}
            description={description}
            setDescription={setDescription}
            isDescriptionValid={isDescriptionValid}
            wordCount={wordCount}
            attachments={attachments}
            handleFileSelect={handleFileSelect}
            removeAttachment={removeAttachment}
            isDragActive={isDragActive}
            setIsDragActive={setIsDragActive}
            submitting={submitting}
          />
        )}

        {/* TAB 2: ACTIVE ISSUES */}
        {activeTab === "active" && (
          <ContactIssuesList
            type="active"
            issues={activeIssues}
            expandedIssueId={expandedIssueId}
            setExpandedIssueId={setExpandedIssueId}
            onSwitchToNew={() => setActiveTab("new")}
            replyInput={replyInput}
            setReplyInput={setReplyInput}
            adminAttachmentsInput={adminAttachmentsInput}
            demoAdminProofs={DEMO_ADMIN_PROOFS}
            addPresetAdminProof={addPresetAdminProof}
            handleAdminFileUpload={handleAdminFileUpload}
            removeAdminAttachment={removeAdminAttachment}
            handleAdminReplySubmit={handleAdminReplySubmit}
          />
        )}

        {/* TAB 3: RESOLVED ISSUES */}
        {activeTab === "resolved" && (
          <ContactIssuesList
            type="resolved"
            issues={resolvedIssues}
            expandedIssueId={expandedIssueId}
            setExpandedIssueId={setExpandedIssueId}
          />
        )}
      </main>
    </div>
  );
};

export default ContactPage;
