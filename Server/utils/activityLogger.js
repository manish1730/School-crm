import ActivityLog from "../models/ActivityLog.js";
import User from "../models/User.js";

/**
 * Log an activity to the database.
 * @param {string} activityType - The category of the activity
 * @param {string} description - Description of the action
 * @param {object} req - Express request object to retrieve the user context
 */
export const logActivity = async (activityType, description, req) => {
  try {
    let userId = null;
    let userName = "System";

    if (req && req.user) {
      userId = req.user.id;
      // Fetch user name
      const user = await User.findById(userId).lean();
      if (user) {
        userName = user.name || user.email;
      }
    }

    await ActivityLog.create({
      activityType,
      description,
      userId,
      userName,
    });
  } catch (error) {
    console.error("Failed to write activity log:", error);
  }
};
