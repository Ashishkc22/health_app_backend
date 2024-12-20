const { userSchema } = require("../../models");

const suspendUser = async (req, res) => {
  try {
    if (!["Suspended", "Verified"].includes(req.body.status)) {
      return res.status(200).json({
        status: "failed",
        message: "Invalid status",
      });
    }
    const fields = {};
    const status = req.body.status;
    fields.status = status;
    if (status === "Suspended") {
      fields.suspension_reason = req.body.suspension_reason;
    }
    const us = await userSchema.findByIdAndUpdate(req.body.id, fields, {
      new: true,
    });
    return res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: us,
    });
  } catch (error) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
};

module.exports = suspendUser;
