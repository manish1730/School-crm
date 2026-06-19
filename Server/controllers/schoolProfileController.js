import * as schoolProfileService from "../services/schoolProfileService.js";

// Helper to validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper to validate URL format
const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i;

// Helper to validate letters and spaces only
const lettersOnlyRegex = /^[A-Za-z\s]+$/;

// Validator function for School Profile
const validateSchoolProfile = (data, isUpdate = false) => {
  const {
    schoolName,
    shortName,
    establishedYear,
    boardAffiliation,
    schoolType,
    email,
    phone,
    alternatePhone,
    website,
    addressLine1,
    city,
    state,
    country,
    pincode,
    chairman,
    principal,
    vicePrincipal,
    adminHead,
    academicYearId,
    sessionStatus,
  } = data;

  // For update, if no fields are provided, we might skip, but we should validate what is provided.
  // For creation, all these are required.
  if (!isUpdate) {
    if (!schoolName) return "School Name is required";
    if (!shortName) return "Short Name is required";
    if (establishedYear === undefined || establishedYear === null) return "Established Year is required";
    if (!boardAffiliation) return "Board Affiliation is required";
    if (!schoolType) return "School Type is required";
    if (!email) return "Valid Email Is Required"; // Exactly matching PDF: "Valid Email Is Required"
    if (!phone) return "Phone Number Must Be 10 Digits"; // Match PDF
    if (!addressLine1) return "Address Line 1 is required";
    if (!city) return "City is required";
    if (!state) return "State is required";
    if (!country) return "Country is required";
    if (!pincode) return "Pincode is required";
    if (!chairman) return "Chairman Name is required";
    if (!principal) return "Principal Name is required";
    if (!adminHead) return "Admin Head Name is required";
    if (!academicYearId) return "Current Academic Year is required";
    if (!sessionStatus) return "Session Status is required";
  }

  // School Name length (3 - 100)
  if (schoolName !== undefined) {
    if (schoolName.trim().length < 3 || schoolName.trim().length > 100) {
      return "School Name must be between 3 and 100 characters";
    }
  }

  // Short Name length (2 - 20)
  if (shortName !== undefined) {
    if (shortName.trim().length < 2 || shortName.trim().length > 20) {
      return "Short Name must be between 2 and 20 characters";
    }
  }

  // Established Year range (1900 - current year)
  if (establishedYear !== undefined) {
    const numericYear = Number(establishedYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(numericYear)) {
      return "Established Year must be numeric";
    }
    if (numericYear < 1900 || numericYear > currentYear) {
      return "Established Year must be between 1900 and current year";
    }
  }

  // Board Affiliation enum check
  if (boardAffiliation !== undefined) {
    const allowedBoards = ["CBSE", "ICSE", "PSEB", "State Board", "IB", "Cambridge"];
    if (!allowedBoards.includes(boardAffiliation)) {
      return "Invalid Board Affiliation";
    }
  }

  // School Type enum check
  if (schoolType !== undefined) {
    const allowedTypes = ["Government", "Private", "Semi-Government", "International"];
    if (!allowedTypes.includes(schoolType)) {
      return "Invalid School Type";
    }
  }

  // Email validation
  if (email !== undefined) {
    if (!email || !emailRegex.test(email)) {
      return "Valid Email Is Required";
    }
  }

  // Phone validation
  if (phone !== undefined) {
    if (!phone || !/^\d{10}$/.test(phone)) {
      return "Phone Number Must Be 10 Digits";
    }
  }

  // Alternate Phone validation (optional)
  if (alternatePhone) {
    if (!/^\d{10}$/.test(alternatePhone)) {
      return "Phone Number Must Be 10 Digits";
    }
  }

  // Website URL validation (optional)
  if (website) {
    if (!urlRegex.test(website)) {
      return "Invalid Website URL";
    }
  }

  // City, State, Country letters-only validation
  if (city !== undefined && !lettersOnlyRegex.test(city)) {
    return "City must contain letters only";
  }
  if (state !== undefined && !lettersOnlyRegex.test(state)) {
    return "State must contain letters only";
  }
  if (country !== undefined && !lettersOnlyRegex.test(country)) {
    return "Country must contain letters only";
  }

  // Pincode validation (6 digits)
  if (pincode !== undefined) {
    if (!/^\d{6}$/.test(pincode)) {
      return "Pincode must be exactly 6 digits";
    }
  }

  // Chairman validation (3 - 100)
  if (chairman !== undefined) {
    if (chairman.trim().length < 3 || chairman.trim().length > 100) {
      return "Chairman Name must be between 3 and 100 characters";
    }
  }

  // Principal validation (3 - 100)
  if (principal !== undefined) {
    if (principal.trim().length < 3 || principal.trim().length > 100) {
      return "Principal Name must be between 3 and 100 characters";
    }
  }

  // Vice Principal validation (optional, 3 - 100)
  if (vicePrincipal) {
    if (vicePrincipal.trim().length < 3 || vicePrincipal.trim().length > 100) {
      return "Vice Principal Name must be between 3 and 100 characters";
    }
  }

  // Admin Head validation (3 - 100)
  if (adminHead !== undefined) {
    if (adminHead.trim().length < 3 || adminHead.trim().length > 100) {
      return "Admin Head Name must be between 3 and 100 characters";
    }
  }

  // Session Status enum check
  if (sessionStatus !== undefined) {
    const allowedStatuses = ["Active", "Inactive"];
    if (!allowedStatuses.includes(sessionStatus)) {
      return "Session Status must be either Active or Inactive";
    }
  }

  return null;
};

// Check for Admin access helper
const verifyAdmin = (req, res) => {
  if (req.user?.role !== "Admin") {
    res.status(403).json({
      success: false,
      message: "Only Admin Can Access This Resource",
    });
    return false;
  }
  return true;
};

// Check for Admin or Staff read access helper
const verifyReadAccess = (req, res) => {
  if (!["Admin", "Staff"].includes(req.user?.role)) {
    res.status(403).json({
      success: false,
      message: "Only Admin Can Access This Resource",
    });
    return false;
  }
  return true;
};

// 1. Get School Profile
export const getSchoolProfile = async (req, res) => {
  try {
    if (!verifyReadAccess(req, res)) return;

    const profile = await schoolProfileService.getSchoolProfile();
    
    // Per PDF, return 200 with success: true and data (empty object or profile)
    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: profile || {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch profile",
    });
  }
};

// 2. Create School Profile
export const createSchoolProfile = async (req, res) => {
  try {
    if (!verifyAdmin(req, res)) return;

    // Frontend handles converting Short Name to Uppercase, but backend enforces/does it too
    if (req.body.shortName) {
      req.body.shortName = req.body.shortName.trim().toUpperCase();
    }

    if (req.body.website) {
      let web = req.body.website.trim();
      if (web && !/^https?:\/\//i.test(web)) {
        web = `https://${web}`;
      }
      req.body.website = web;
    }

    const validationError = validateSchoolProfile(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const newProfile = await schoolProfileService.createSchoolProfile(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: "School Profile Created Successfully",
      data: newProfile,
    });
  } catch (error) {
    // Return meaningful error messages
    const message = error.message;
    if (message === "School Profile Already Exists" || message === "Academic Year Not Found") {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    // Handle Mongo duplicate key errors (like phone, email, name unique indexes)
    if (error.code === 11000) {
      let dupField = "Field";
      if (error.keyPattern?.schoolName) dupField = "School Name";
      if (error.keyPattern?.email) dupField = "Email";
      if (error.keyPattern?.phone) dupField = "Phone Number";
      
      return res.status(400).json({
        success: false,
        message: `${dupField} Already Exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create profile",
    });
  }
};

// 3. Update School Profile
export const updateSchoolProfile = async (req, res) => {
  try {
    if (!verifyAdmin(req, res)) return;

    const { id } = req.params;

    if (req.body.shortName) {
      req.body.shortName = req.body.shortName.trim().toUpperCase();
    }

    if (req.body.website) {
      let web = req.body.website.trim();
      if (web && !/^https?:\/\//i.test(web)) {
        web = `https://${web}`;
      }
      req.body.website = web;
    }

    const validationError = validateSchoolProfile(req.body, true);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const updatedProfile = await schoolProfileService.updateSchoolProfile(
      id,
      req.body,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "School Profile Updated Successfully",
      data: updatedProfile,
    });
  } catch (error) {
    const message = error.message;
    if (message === "School Profile not found" || message === "Academic Year Not Found") {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    if (error.code === 11000) {
      let dupField = "Field";
      if (error.keyPattern?.schoolName) dupField = "School Name";
      if (error.keyPattern?.email) dupField = "Email";
      if (error.keyPattern?.phone) dupField = "Phone Number";
      
      return res.status(400).json({
        success: false,
        message: `${dupField} Already Exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

// 4. Delete School Profile
export const deleteSchoolProfile = async (req, res) => {
  try {
    if (!verifyAdmin(req, res)) return;

    const { id } = req.params;
    await schoolProfileService.deleteSchoolProfile(id);

    res.status(200).json({
      success: true,
      message: "School Profile Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete profile",
    });
  }
};
