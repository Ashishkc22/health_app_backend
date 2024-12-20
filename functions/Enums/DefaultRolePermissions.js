// Regular permissions
const CardsPermission = [
  {
    name: "VIEW_CARDS",
    description: "Allows viewing the details of all cards.",
  },
  {
    name: "EDIT_CARDS",
    description: "Grants permission to modify existing card details.",
  },
  {
    name: "ADD_CARDS",
    description: "Enables adding new cards to the system.",
  },
];

const UsersPermission = [
  {
    name: "VIEW_USERS",
    description: "Allows viewing the details of all users.",
  },
  {
    name: "EDIT_USERS",
    description: "Grants permission to modify user information.",
  },
  {
    name: "ADD_USERS",
    description: "Enables the addition of new users to the system.",
  },
  {
    name: "USER_DETAILS_BY_ID",
    description: "Get user details by it's ID.",
  },
];

const HospitalsPermission = [
  {
    name: "VIEW_HOSPITALS",
    description: "Allows viewing the details of all hospitals.",
  },
  {
    name: "EDIT_HOSPITALS",
    description: "Grants permission to modify hospital information.",
  },
  {
    name: "ADD_HOSPITALS",
    description: "Enables adding new hospitals to the system.",
  },
];

const AddressPermissions = [
  {
    name: "VIEW_ADDRESS",
    description: "Allows viewing address details in the system.",
  },
  {
    name: "EDIT_ADDRESS",
    description: "Grants permission to modify existing address details.",
  },
  {
    name: "ADD_ADDRESS",
    description: "Enables adding new addresses to the system.",
  },
];

module.exports = {
  FE: {
    name: "FE",
    description:
      "Field Executives (FE) are agents responsible for adding cards on behalf of users.",
    permissions: [
      "ADD_CARDS",
      "EDIT_CARDS",
      "VIEW_CARDS",
      "VIEW_ADDRESS",
      "USER_DETAILS_BY_ID",
    ],
  },
  ADMIN: {
    name: "ADMIN",
    description:
      "Admins have the authority to manage and control information across the system.",
    permissions: [
      "VIEW_CARDS",
      "EDIT_CARDS",
      "VIEW_USERS",
      "EDIT_USERS",
      "ADD_USERS",
      "VIEW_HOSPITALS",
      "EDIT_HOSPITALS",
      "ADD_HOSPITALS",
      "VIEW_ADDRESS",
      "EDIT_ADDRESS",
      "ADD_ADDRESS",
    ],
  },
  TL: {
    name: "TL",
    description:
      "Team Leaders (TL) are responsible for reviewing and approving cards submitted by agents.",
    permissions: [
      "ADD_CARDS",
      "EDIT_CARDS",
      "VIEW_CARDS",
      "VIEW_ADDRESS",
      "USER_DETAILS_BY_ID",
    ],
  },
  SUBADMIN: {
    name: "SUBADMIN",
    description:
      "Sub Admin (TL) are responsible for reviewing and submitting hopitals for admin.",
    permissions: ["VIEW_HOSPITALS", "EDIT_HOSPITALS", "ADD_HOSPITALS"],
  },
  SERVICES: {
    ADMIN: {
      name: "ADMIN",
      description:
        "Admins have full access to manage the platform, users, and system settings.",
    },
    AGENT: {
      name: "AGENT",
      description:
        "Agents are responsible for assisting customers and managing their requests.",
    },
    CUSTOMER: {
      name: "CUSTOMER",
      description:
        "Customers can access the platform to avail services and manage their accounts.",
    },
  },
  PERMISSIONS: {
    CardsPermission,
    UsersPermission,
    HospitalsPermission,
    AddressPermissions,
  },
};
