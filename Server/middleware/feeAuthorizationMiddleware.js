import Staff from "../models/Staff.js";
import User from "../models/User.js";

export const feeReadAccess = async (req, res, next) => {
  try {
    if (req.user?.role === "Admin") {
      req.feeAccess = "write";
      return next();
    }

    if (req.user?.role !== "Staff") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Fee access denied",
      });
    }

    const user = await User.findById(req.user.id).lean();

    if (!user?.email) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Fee access denied",
      });
    }

    const staff = await Staff.findOne({
      email: user.email,
      isActive: true,
    }).lean();

    if (["Admin", "Accountant"].includes(staff?.erpRole)) {
      req.feeAccess = "write";
      return next();
    }

    if (staff?.erpRole === "Teacher") {
      req.feeAccess = "read";
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Forbidden: Fee access denied",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify fee access",
    });
  }
};

export const feeWriteAccess = (req, res, next) => {
  if (req.feeAccess === "write") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Forbidden: Fee write access denied",
  });
};
