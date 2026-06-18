import Enquiry from "../models/Enquiry.js";

const sources = [
  "Walk In",
  "Referral",
  "Website",
  "Social Media",
  "Campaign",
  "Other",
];

const statuses = [
  "New",
  "Follow Up",
  "Converted",
  "Closed",
];

const validateEnquiry = ({
  studentName,
  phoneNumber,
  source,
  counsellor,
  status,
}) => {
  if (!studentName || studentName.trim().length < 3) {
    return "Student Name must be at least 3 characters";
  }
  if (!/^\d{10}$/.test(phoneNumber || "")) {
    return "Phone Number must be exactly 10 digits";
  }
  if (!sources.includes(source)) {
    return "Source is required";
  }
  if (!counsellor) {
    return "Counsellor is required";
  }
  if (status && !statuses.includes(status)) {
    return "Status is required";
  }
  return null;
};

export const getEnquiries = async (req, res) => {
  try {
    const {
      search = "",
      status,
      source,
    } = req.query;

    const query = { isActive: true };

    if (status) query.status = status;
    if (source) query.source = source;
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { counsellor: { $regex: search, $options: "i" } },
      ];
    }

    const enquiries = await Enquiry.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "Enquiries fetched successfully",
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries",
    });
  }
};

export const getEnquiryStats = async (req, res) => {
  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const [
      total,
      newThisWeek,
      converted,
      pendingFollowUp,
    ] = await Promise.all([
      Enquiry.countDocuments({ isActive: true }),
      Enquiry.countDocuments({ isActive: true, createdAt: { $gte: weekStart } }),
      Enquiry.countDocuments({ isActive: true, status: "Converted" }),
      Enquiry.countDocuments({ isActive: true, status: "Follow Up" }),
    ]);

    res.status(200).json({
      success: true,
      message: "Enquiry stats fetched successfully",
      data: {
        total,
        newThisWeek,
        converted,
        pendingFollowUp,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiry stats",
    });
  }
};

export const createEnquiry = async (req, res) => {
  try {
    const validationMessage = validateEnquiry(req.body);

    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    const enquiry = await Enquiry.create({
      ...req.body,
      createdBy: req.user?.id,
      updatedBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Enquiry created successfully",
      data: enquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create enquiry",
    });
  }
};

export const updateEnquiry = async (req, res) => {
  try {
    const current = await Enquiry.findById(req.params.id);

    if (!current || !current.isActive) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    if (current.status === "Converted") {
      return res.status(400).json({
        success: false,
        message: "Converted enquiry cannot be edited",
      });
    }

    const validationMessage = validateEnquiry(req.body);

    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage,
      });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user?.id,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Enquiry updated successfully",
      data: enquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update enquiry",
    });
  }
};

export const convertEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry || !enquiry.isActive) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    if (enquiry.status === "Converted") {
      return res.status(400).json({
        success: false,
        message: "Converted enquiry cannot be converted again",
      });
    }

    enquiry.status = "Converted";
    enquiry.updatedBy = req.user?.id;
    await enquiry.save();

    res.status(200).json({
      success: true,
      message: "Enquiry converted successfully",
      data: enquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to convert enquiry",
    });
  }
};

export const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        updatedBy: req.user?.id,
      },
      { returnDocument: "after" }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully",
      data: enquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete enquiry",
    });
  }
};
