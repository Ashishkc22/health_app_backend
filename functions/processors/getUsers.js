const {
  RegexEnum: { userUIDRegex },
  ErrorEnums,
} = require("../Enums");

const { userSchema } = require("../models");
const { CustomError } = require("../utils/custom-errors");

function buildQuery({ query, role = "" }) {
  const qry = {};
  if (query.q != null) {
    const { q } = query;
    if (phoneRegex.test(q)) {
      qry.phone = { $regex: q, $options: "i" };
    } else if (userUIDRegex.test(q)) {
      qry.uid = { $regex: q, $options: "i" };
    } else {
      qry.name = { $regex: q, $options: "i" };
    }
  }

  if (role === "TL") qry.role = "TL";
  if (query.state) qry.state = query.state;
  if (query.district) qry.district = query.district;

  if (query.status) {
    qry.status = buildStatusQuery(req);
  }

  if (query.janPanchayat) qry.current_janpad = query.janPanchayat;

  if (query.duration) {
    qry.created_at = buildDurationQuery(query.duration, query.till_duration);
  }

  return qry;
}

// Function to build the status query
function buildStatusQuery(req) {
  const { status, mode } = req.query;
  if (mode !== "ADMIN") return status;

  const currentTime = Date.now();
  const fiveDaysAgo = currentTime - 5 * 24 * 60 * 60 * 1000;

  if (status === "Active") {
    return {
      $and: [{ last_fetch: { $gte: fiveDaysAgo } }, { status: "Verified" }],
    };
  } else if (status === "Inactive") {
    return {
      $and: [{ last_fetch: { $lt: fiveDaysAgo } }, { status: "Verified" }],
    };
  }
  return status;
}

// Function to build the duration query
function buildDurationQuery(duration, tillDuration) {
  const now = new Date();
  switch (duration) {
    case "TODAY":
      return {
        $gte: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        ).getTime(),
      };
    case "THIS WEEK":
      const weekStart = now.getDate() - now.getDay();
      return {
        $gte: new Date(now.getFullYear(), now.getMonth(), weekStart).getTime(),
      };
    case "THIS MONTH":
      return { $gte: new Date(now.getFullYear(), now.getMonth(), 1).getTime() };
    case "ALL":
      return {};
    default:
      const fromDate = parseInt(duration);
      const toDate = parseInt(tillDuration) || fromDate + 24 * 60 * 60 * 1000;
      return { $gte: fromDate, $lte: toDate };
  }
}

// Fetch basic user info for onlyInfo = true
async function fetchOnlyInfo(qry) {
  try {
    return await userSchema
      .find(qry)
      .select({ _id: 1, name: 1, uid: 1, tl_id: 1 });
  } catch (error) {
    throw new CustomError(ErrorEnums.FAILED_TO_GET_USER_LIST);
  }
}

// Fetch user data with pagination and sorting
async function fetchUserData(qry, req, isAdmin) {
  const sort =
    req.query.sortBy === "created_at"
      ? { created_at: -1 }
      : { score: -1, status: 1, name: 1 };
  const skip =
    parseInt(req.query.page || 0) * parseInt(req.query.limit || "40");
  const limit = parseInt(req.query.limit || "40");

  return await userSchema.find(qry).sort(sort).skip(skip).limit(limit);
}

// Process users for ADMIN mode
function processAdminUsers(users) {
  return users.map((user) => {
    const delivered = user.d_count || 0;
    const ratio = delivered === 0 ? 0 : (delivered / user.score) * 100;
    return { ...user.toObject(), ratio };
  });
}

// Process users for non-ADMIN mode
function processRegularUsers(users) {
  return users.map((user) => {
    const sanitizedUser = {
      ...user.toObject(),
      status: parseStatus(user.status),
    };
    sanitizedUser.password = "";
    return sanitizedUser;
  });
}

// Format the final response
function formatResponse(data, req, qry) {
  return {
    status: "success",
    page_number: req.query.page || "0",
    total_results: data.length,
    total: qry.length,
    data,
  };
}

async function fetchUsers({ query = {}, onlyInfo = false, role = "FE" }) {
  try {
    const qry = buildQuery({ query, role });

    if (onlyInfo) {
      return await fetchOnlyInfo(qry);
    }

    const isAdmin = role === "ADMIN";
    const users = await fetchUserData(qry, req, isAdmin);

    if (isAdmin) {
      const data = processAdminUsers(users);
      return res.status(200).json(formatResponse(data, req, qry));
    } else {
      const data = processRegularUsers(users);
      return res.status(200).json(formatResponse(data, req, qry));
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
}
