import SchoolProfile from "../models/SchoolProfile.js";
import AcademicYear from "../models/AcademicYear.js";

/**
 * Get the active school profile.
 * Per rules, only one profile should exist.
 * Uses lean() for performance.
 */
export const getSchoolProfile = async () => {
  return await SchoolProfile.findOne({ isActive: true })
    .populate("academicYearId")
    .lean();
};

/**
 * Create a new school profile.
 * Only allowed if no active profile exists.
 */
export const createSchoolProfile = async (profileData, userId) => {
  // 1. Check if an active profile already exists
  const existing = await SchoolProfile.findOne({ isActive: true }).lean();
  if (existing) {
    throw new Error("School Profile Already Exists");
  }

  // 2. Validate Academic Year
  const academicYear = await AcademicYear.findOne({
    _id: profileData.academicYearId,
    isActive: true,
  }).lean();
  if (!academicYear) {
    throw new Error("Academic Year Not Found");
  }

  // 3. Set audit fields
  const dataToSave = {
    ...profileData,
    createdBy: userId,
    updatedBy: userId,
    isActive: true,
  };

  const newProfile = await SchoolProfile.create(dataToSave);
  return await SchoolProfile.findById(newProfile._id)
    .populate("academicYearId")
    .lean();
};

/**
 * Update the existing school profile.
 */
export const updateSchoolProfile = async (id, updateData, userId) => {
  // 1. Find the profile
  const profile = await SchoolProfile.findOne({ _id: id, isActive: true });
  if (!profile) {
    throw new Error("School Profile not found");
  }

  // 2. Validate Academic Year if it's being updated
  if (updateData.academicYearId) {
    const academicYear = await AcademicYear.findOne({
      _id: updateData.academicYearId,
      isActive: true,
    }).lean();
    if (!academicYear) {
      throw new Error("Academic Year Not Found");
    }
  }

  // 3. Set update audit fields
  const dataToUpdate = {
    ...updateData,
    updatedBy: userId,
  };

  const updatedProfile = await SchoolProfile.findByIdAndUpdate(
    id,
    dataToUpdate,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("academicYearId")
    .lean();

  return updatedProfile;
};

/**
 * Soft delete the school profile (sets isActive to false).
 */
export const deleteSchoolProfile = async (id) => {
  const profile = await SchoolProfile.findOne({ _id: id, isActive: true });
  if (!profile) {
    throw new Error("School Profile not found");
  }

  await SchoolProfile.findByIdAndUpdate(id, { isActive: false });
  return { success: true };
};
