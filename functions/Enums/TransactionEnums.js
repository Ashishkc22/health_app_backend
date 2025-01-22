module.exports = {
  TRANSACTION_TYPE: {
    CREDIT: "credit",
    DEBIT: "debit",
    PAYMENT: "payment",
    P2P_SENT: "p2p_sent",
    P2P_RECEIVED: "p2p_received",
  },
  TRANSFER_TYPE: {
    WALLET_LOAD: "wallet_load",
    P2P_TRANSFER: "p2p_transfer",
    PLAN_PURCHASE: "plan_purchase",
    REFUND: "refund",
  },
  STATUS: {
    PENDING: "pending",
    PROCESSING: "processing",
    COMPLETED: "completed",
    FAILED: "failed",
    REVERSED: "reversed",
    CANCELLED: "cancelled",
  },
  METADATA: {
    source: {
      WEB: "web",
      MOBILE: "mobile",
      API: "api",
      SYSTEM: "system",
    },
  },
};
