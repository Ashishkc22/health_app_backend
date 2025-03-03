module.exports = {
  STATUS_FLOW_MAPPER: {
    SUBMITTED: ["PRINTED", "DISCARDED"],
    PRINTED: ["RECEIVED", "REPRINT", "DISCARDED"],
    RECEIVED: ["DELIVERED", "DISCARDED"],
    DELIVERED: ["DISCARDED"],
    PENDING: ["SUBMITTED"],
    DISCARDED: ["DELIVERED", "REPRINT", "SUBMITTED"],
  },
  CARD_TYPE: {
    Single: "Single",
    Family: "Family",
  },
};
