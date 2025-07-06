module.exports = {
  // Auth routes
  "/auth/login": {
    name: "login",
    isPublic: true,
    services: [],
    permissions: [],
  },
  "/auth/register": {
    name: "register",
    isPublic: true,
    services: [],
    permissions: [],
  },
  "/auth/submitPassword": {
    name: "reset-password",
    isPublic: true,
    services: [],
    permissions: [],
  },
  "/auth/verifyCode": {
    name: "verify-otp",
    isPublic: true,
    services: [],
    permissions: [],
  },
  "/auth/sendCode": {
    name: "send-otp",
    isPublic: true,
    services: [],
    permissions: [],
  },
  "/auth/get-login-otp": {
    name: "get-login-otp",
    isPublic: true,
    services: [],
    permissions: [],
  },
  "/auth/verify-login-otp": {
    name: "verify-login-otp",
    isPublic: true,
    services: [],
    permissions: [],
  },
  "/auth/user-exists": {
    name: "verify-user-exists",
    isPublic: true,
    services: [],
    permissions: [],
  },
  // Users routes
  "/user/get-my-details": {
    name: "get-user-details",
    services: ["AGENT"],
    permissions: ["GET_MY_DETAILS"],
  },
  "/user/get-user-by-id": {
    name: "get-user-details",
    services: ["AGENT", "ADMIN"],
    permissions: ["USER_DETAILS_BY_ID"],
  },
  "/user/get-users": {
    name: "get-user-details",
    services: ["ADMIN"],
    permissions: ["VIEW_USERS"],
  },
  "/user/update-user-by-id": {
    name: "update-user-byid",
    services: ["ADMIN"],
    permissions: ["EDIT_USERS"],
  },
  "/user/update-profile": {
    name: "update-agent-profile",
    services: ["AGENT"],
    permissions: ["UPDATE_PROFILE"],
  },
  "/user/update-my-location": {
    name: "update-my-location",
    services: ["AGENT"],
    permissions: ["UPDATE_MY_LOCATION"],
    // Agent can update their location
  },
  "/user/add-tl": {
    name: "add-new-tl",
    services: ["ADMIN"],
    permissions: ["ADD_TL_USERS"],
  },
  "/user/suspend": {
    name: "change-user-status-to-suspend",
    services: ["ADMIN"],
    permissions: ["SUSPEND_USERS"],
  },
  "/user/get-team-member-stats": {
    name: "get-team-member-stats",
    services: ["AGENT"],
    permissions: ["VIEW_TEAM_MEMBER_STATS"],
  },
  "/user/update-user-profile": {
    name: "update-user-profile",
    services: ["USER"], //Need to check if this is correct
    permissions: ["UPDATE_USER_PROFILE"],
  },
  "/user/get-customer": {
    name: "get-customer",
    services: ["ADMIN"],
    permissions: ["GET_CUSTOMER"],
  },
  "/user/verify-customer": {
    name: "verify-customer",
    services: ["ADMIN"],
    permissions: ["VERIFY_CUSTOMER"],
  },
  "/user/get-team-member-status": {
    name: "get-team-member-status",
    services: ["AGENT"],
    permissions: ["GET_TEAM_MEMBER_STATUS"],
  },
  "/user/set-my-password": {
    name: "set-my-password",
    services: ["USER", "AGENT"],
    permissions: ["SET_MY_PASSWORD"],
  },
  "/user/get-agent-details-by-uid": {
    name: "get-agent-details-by-uid",
    services: ["ADMIN"],
    permissions: ["GET_AGENT_DETAILS_BY_UID"],
  },

  // Address
  "/address/add-address": {
    name: "add-address",
    services: ["ADMIN"],
    permissions: ["ADD_ADDRESS"],
  },
  "/address/get-address-by-type": {
    name: "get-address-by-tyoe",
    services: ["ADMIN", "AGENT"],
    permissions: ["VIEW_ADDRESS"],
  },
  "/address/all-get-janpanchyat": {
    name: "get-all-janpanchyat",
    services: ["ADMIN", "AGENT"],
    permissions: ["VIEW_ADDRESS_JANPANCHYAT"],
  },
  "/address/update-address": {
    name: "update-address-by-type",
    services: ["ADMIN"],
    permissions: ["EDIT_ADDRESS"],
  },
  // BIN routes
  "/bin/card": {
    name: "delete-card-by-id",
    services: ["ADMIN"],
    permissions: ["DELETE_CARD"],
  },
  "/bin/hospital": {
    name: "delete-hospital-by-id",
    services: ["ADMIN"],
    permissions: ["DELETE_HOSPITAL"],
  },
  "/bin": {
    name: "delete-hospital-by-id",
    services: ["ADMIN"],
    permissions: ["VIEW_DELETE_DATA"],
  },
  "/bin/restore": {
    name: "restore-deleted-data",
    services: ["ADMIN"],
    permissions: ["RESTORE_DATA"],
  },
  // Cards route
  "/cards/add-card": {
    name: "create-new-card",
    services: ["ADMIN", "AGENT"],
    permissions: ["ADD_CARDS"],
  },
  "/cards/mark-cards-as-printed": {
    name: "changes-list-of-card-status-to-Printed",
    services: ["ADMIN"],
    permissions: ["UPDATE_CARDS_STATUS_PRINTED"],
  },
  "/cards/update-card-status-by-id": {
    name: "update-card-status",
    services: ["AGENT", "ADMIN"],
    permissions: ["UPDATE_CARDS_STATUS_BY_ID"],
    //UPDATE_CARDS_STATUS
  },
  "/cards/update-card-by-id": {
    name: "update-card-by-id",
    services: ["AGENT", "ADMIN"],
    permissions: ["EDIT_CARDS"],
  },
  "/cards/update-user-card": {
    name: "update-card-by-id",
    services: ["USER"],
    permissions: ["UPPDATE_USER_CARD"],
  },
  "/cards/get-cards": {
    name: "get-all-cards",
    services: ["AGENT", "ADMIN"],
    permissions: ["VIEW_USER_CARDS"],
  },
  "/cards/to-be-printed": {
    name: "Get-all-cards-that-are-ready-to-printed",
    services: ["ADMIN"],
    permissions: ["VIEW_READY_TO_PRINT_CARDS"],
  },
  "/cards/get-card-by-id": {
    name: "get-card-by-id",
    services: ["ADMIN", "AGENT"],
    permissions: ["VIEW_CARD_DETAILS"],
  },
  "/cards/card-users": {
    name: "get-card-users",
    services: ["ADMIN"],
    permissions: ["VIEW_CARDS_USER_LIST"],
  },
  "/cards/get-my-cards": {
    name: "get-users-cards",
    services: ["AGENT"],
    permissions: ["VIEW_MY_CARDS"],
  },
  "/cards/get-my-card": {
    name: "get-users-card",
    services: ["USER"],
    permissions: ["GET_MY_CARD"],
  },
  "/cards/get-card-by-userid": {
    name: "get-card-by-userid",
    services: ["ADMIN"],
    permissions: ["GET_CARD_BY_USERID"],
  },
  "/cards/get-available-card-locations": {
    name: "get-available-card-locations",
    services: ["ADMIN"],
    permissions: ["GET_AVAILABLE_CARD_LOCATIONS"],
  },
  "/cards/get-cards-data-by-location": {
    name: "get-cards-data-by-location",
    services: ["ADMIN"],
    permissions: ["GET_CARDS_DATA_BY_LOCATION"],
  },
  "/cards/get-my-team-cards": {
    name: "get-my-team-members-cards",
    services: ["AGENT"],
    permissions: ["GET_MY_TEAM_CARDS"],
  },
  "/cards/get-card-counts": {
    name: "get-card-counts",
    services: ["ADMIN"],
    permissions: ["GET_CARD_COUNTS"],
  },
  "/cards/get-cards-data": {
    name: "get-cards-data",
    services: ["ADMIN"],
    permissions: ["GET_CARDS_DATA"],
    // Used to get card for to-be-printed
  },
  // Dashboard
  "/dashboard": {
    name: "get-dashboard-details",
    services: ["ADMIN", "AGENT"],
    permissions: ["GET_DASHBOARD_DETAILS"],
  },
  "/dashboard/get-my-leaderboard": {
    name: "get-my-leaderboard",
    services: ["AGENT"],
    permissions: ["GET_MY_LEADERBOARD"],
  },
  // Hospitals
  "/hospitals/add-hospital": {
    name: "create-new-hospital",
    services: ["ADMIN"],
    permissions: ["ADD_HOSPITALS"],
  },
  "/hospitals/get-hospital-by-id": {
    name: "get-hospital-by-id",
    services: ["ADMIN"],
    permissions: ["VIEW_HOSPITALS_DETAILS"],
  },
  "/hospitals/get-hospitals": {
    name: "get-hospitals",
    // isPublic: true,
    services: ["ADMIN", "AgENT"],
    permissions: ["VIEW_HOSPITALS"],
  },
  "/hospitals/update-hospital-by-id": {
    name: "get-hospitals",
    services: ["ADMIN"],
    permissions: ["EDIT_HOSPITALS"],
  },
  // settings
  "/settings/add-setting": {
    name: "get-hospitals",
    services: ["ADMIN"],
    permissions: ["ADD_SETTINGS"],
  },
  "/settings/get-settings": {
    name: "get-hospitals",
    services: ["ADMIN"],
    permissions: ["GET_SETTINGS"],
  },
  // Payment
  "/payment/get-plans": {
    name: "get-plans",
    isPublic: true,
    services: [],
    permissions: [],
  },
  "/payment/purchase-plan": {
    name: "purchase-plan",
    services: ["USER", "AGENT"],
    permissions: ["PURCHASE_PLAN"],
  },
  "/payment/plan-checkout": {
    name: "plan-checkout",
    services: ["USER", "AGENT"],
    permissions: ["PLAN_CHECKOUT"],
  },
  "/payment/p2p-coin": {
    name: "p2p-coin",
    services: ["AGENT"],
    permissions: ["P2P_COIN"],
  },
  //plans
  "/plans/get-plans": {
    name: "get-plans",
    isPublic: true,
    services: [],
    permissions: [],
  },
  "/plans/get-my-plan": {
    name: "get-my-plan",
    services: ["USER"],
    permissions: ["GET_MY_PLAN"],
  },
  "/cards/add-user-card": {
    name: "add-user-card",
    // isPublic: true,
    services: ["USER"],
    permissions: ["ADD_USER_CARD"],
  },
  // wallet
  "/wallet/get-my-wallet-details": {
    name: "get-my-wallet-details",
    services: ["AGENT"],
    permissions: ["GET_MY_WALLET_DETAILS"],
  },
  // Other
  "/other/add-hospital": {
    name: "add-hospital",
    isPublic: true,
    services: [],
    permissions: [],
  },
  "/upload/gallery-upload": {
    name: "upload-gallery",
    services: ["ADMIN"],
    permissions: ["UPLOAD_GALLERY_IMAGE"],
  },
  "/upload/delete": {
    name: "delete-gallery",
    services: ["ADMIN"],
    permissions: ["DELETE_GALLERY_IMAGE"],
  },
  "/upload/get-images": {
    name: "get-gallery",
    isPublic: true,
    services: [],
    permissions: [],
  },
  "/testimonial-videos/upload-video": {
    name: "testimonial-upload-video",
    services: ["ADMIN"],
    permissions: ["UPLOAD_TESTIMONIAL_VIDEO"],
  },
  "/testimonial-videos/get-videos": {
    name: "testimonial-get-videos",
    isPublic: true,
    services: [],
    permissions: [],
  },
  "/testimonial-videos/delete-video": {
    name: "testimonial-delete-video",
    services: ["ADMIN"],
    permissions: ["DELETE_TESTIMONIAL_VIDEO"],
  },
  "/faq/allFAQ": {
    name: "get-all-faqs",
    services: ["ADMIN"],
    permissions: ["GET_ALL_FAQS_ALL_DETAILS"],
  },
  "/faq/faq": {
    name: "get-faq-by-id",
    services: ["ADMIN"],
    permissions: ["GET_FAQ_BY_ID"],
  },
  "/faq": {
    name: "Get-all-faqs",
    isPublic: true,
    services: ["User"],
    permissions: [],
  },
  "/faq/addFaq": {
    name: "add-faq",
    services: ["ADMIN"],
    permissions: ["ADD_FAQ"],
  },
  "/faq/update-faq-by-id": {
    name: "update-faq",
    services: ["ADMIN"],
    permissions: ["UPDATE_FAQ"],
  },
  "/faq/delete-faq-by-id": {
    name: "delete-faq",
    services: ["ADMIN"],
    permissions: ["DELETE_FAQ"],
  },
  "/faq/disable-faq": {
    name: "disable-faq",
    services: ["ADMIN"],
    permissions: ["DISABLE_FAQ"],
  },
};
