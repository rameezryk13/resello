const express = require('express');
const { userBucket, saveDb } = require('../lib/store');
const { requireAuth, userFromRequest } = require('../middleware/auth');

const router = express.Router();

// Helper to count words
function countWords(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

const DEFAULT_RESOLVED_ISSUE = {
  id: "ISS-409218",
  userId: "default",
  userName: "Hamza Deals",
  senderName: "Hamza Deals",
  issueType: "Delivery Issues",
  description:
    "The courier marked this order as delivered but my customer says nothing arrived at their door. Can you check with the 3PL?",
  attachments: [
    {
      name: "delivery_parcel_proof.jpg",
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
        name: "courier_redelivery_check.jpg",
        size: "420 KB",
        type: "image/jpeg",
        isImage: true,
        url: "/images/support/courier_proof.jpg",
      },
    ],
  },
};

// GET /api/support/issues - Get user's issues
router.get('/support/issues', (req, res) => {
  const user = userFromRequest(req);
  if (!user) {
    return res.json({ issues: [DEFAULT_RESOLVED_ISSUE], active: [], resolved: [DEFAULT_RESOLVED_ISSUE] });
  }

  const bucket = userBucket(user.id);
  bucket.issues = bucket.issues || [];
  
  // Ensure the user bucket has the default resolved issue if not already present
  if (!bucket.issues.some(i => i.id === DEFAULT_RESOLVED_ISSUE.id)) {
    bucket.issues.push(DEFAULT_RESOLVED_ISSUE);
    saveDb();
  }

  const issues = bucket.issues;
  const active = issues.filter(i => i.status === 'active' || i.status === 'pending');
  const resolved = issues.filter(i => i.status === 'resolved');

  res.json({
    issues,
    active,
    resolved
  });
});

// POST /api/support/issues - Create a new support issue
router.post('/support/issues', (req, res) => {
  const { issueType, description, attachments } = req.body || {};

  if (!issueType) {
    return res.status(400).json({ message: 'Please select an issue type.' });
  }

  const words = countWords(description);
  if (words < 5) {
    return res.status(400).json({ 
      message: `Description must contain at least 5 words (currently ${words} word${words === 1 ? '' : 's'}).` 
    });
  }

  const user = userFromRequest(req);
  const issueId = `ISS-${Date.now().toString().slice(-6)}`;

  const newIssue = {
    id: issueId,
    userId: user ? user.id : 'guest',
    userEmail: user ? user.email : 'guest@resello.pk',
    userName: user ? user.name : 'Guest User',
    issueType,
    description: description.trim(),
    attachments: Array.isArray(attachments) ? attachments : [],
    status: 'active',
    createdAt: new Date().toISOString(),
    adminReply: null,
  };

  if (user) {
    const bucket = userBucket(user.id);
    bucket.issues.unshift(newIssue);
    saveDb();
  }

  res.status(201).json({
    message: 'Support request submitted successfully.',
    issue: newIssue
  });
});

// POST /api/support/issues/:id/reply - Admin sends a reply to a request
router.post('/support/issues/:id/reply', (req, res) => {
  const { id } = req.params;
  const { replyText, attachments, resolveIssue, adminName } = req.body || {};

  if (!replyText || !replyText.trim()) {
    return res.status(400).json({ message: 'Reply text cannot be empty.' });
  }

  const user = userFromRequest(req);
  let issue = null;

  if (user) {
    const bucket = userBucket(user.id);
    issue = (bucket.issues || []).find(i => i.id === id);

    if (issue) {
      if (issue.adminReply) {
        return res.status(400).json({ 
          message: 'Admin response limit reached. Only a single reply is permitted per request.' 
        });
      }

      issue.adminReply = {
        text: replyText.trim(),
        attachments: Array.isArray(attachments) ? attachments : [],
        repliedAt: new Date().toISOString(),
        adminName: adminName || 'Resello Customer Support Team',
      };

      if (resolveIssue !== false) {
        issue.status = 'resolved';
        issue.resolvedAt = new Date().toISOString();
      }

      saveDb();
    }
  }

  res.json({
    message: 'Admin reply recorded successfully.',
    issue: issue || {
      id,
      adminReply: {
        text: replyText.trim(),
        attachments: Array.isArray(attachments) ? attachments : [],
        repliedAt: new Date().toISOString(),
        adminName: adminName || 'Resello Customer Support Team',
      },
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
    }
  });
});

// PUT /api/support/issues/:id/status - Toggle or update status
router.put('/support/issues/:id/status', requireAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!['active', 'resolved'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be "active" or "resolved".' });
  }

  const bucket = userBucket(req.user.id);
  const issue = (bucket.issues || []).find(i => i.id === id);

  if (!issue) {
    return res.status(404).json({ message: 'Support request not found.' });
  }

  issue.status = status;
  if (status === 'resolved' && !issue.resolvedAt) {
    issue.resolvedAt = new Date().toISOString();
  }

  saveDb();

  res.json({
    message: `Issue status updated to ${status}.`,
    issue
  });
});

module.exports = router;
