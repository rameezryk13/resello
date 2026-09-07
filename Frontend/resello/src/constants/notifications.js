// Sample feed for the header notification panel. There is no notifications
// endpoint yet, so this is the shape the real feed will use: `type` drives the
// icon and accent colour, `unread` drives the dot and the bell badge count.
export const SAMPLE_NOTIFICATIONS = [
  {
    id: "n1",
    type: "promo",
    title: "Eid Sale is live",
    message: "Up to 50% off across Fashion and Electronics. Resell at your own margin till Sunday.",
    time: "Just now",
    unread: true,
  },
  {
    id: "n2",
    type: "order",
    title: "Order has been placed",
    message: "ORD-4821 from Alpha Traders is confirmed. Items from other suppliers were placed as separate orders.",
    time: "12 minutes ago",
    unread: true,
  },
  {
    id: "n3",
    type: "shipping",
    title: "Order shipped",
    message: "ORD-4817 left the warehouse and is on the way to your customer in Lahore.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "n4",
    type: "wallet",
    title: "Profit credited",
    message: "PKR 3,450 profit from 6 delivered orders was added to your wallet.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "n5",
    type: "order",
    title: "Order delivered",
    message: "ORD-4790 was delivered and marked complete. Your profit is now unlocked.",
    time: "2 days ago",
    unread: false,
  },
  {
    id: "n6",
    type: "promo",
    title: "New supplier in Electronics",
    message: "Bright Gadgets joined with 120 products and free shipping over PKR 5,000.",
    time: "3 days ago",
    unread: false,
  },
];
