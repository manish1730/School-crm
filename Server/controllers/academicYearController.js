import Academicyear from "../models/AcademicYear.js";

// Create Academic Year
export const createAcademicYear = async (
  req,
  res
) => {
  try {

    const {
      name,
      startDate,
      endDate,
    } = req.body;

    // Validation
    if (
      !name ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required",
      });
    }

    // Duplicate Check
    const existingYear =
      await Academicyear.findOne({
        name,
        isActive: true,
      });

    if (existingYear) {
      return res.status(400).json({
        success: false,
        message:
          "Academic Year already exists",
      });
    }

    // Date Validation
    if (
      new Date(startDate) >=
      new Date(endDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Start Date must be before End Date",
      });
    }

    const year =
      await Academicyear.create({
        name,
        startDate,
        endDate,
      });

    res.status(201).json({
      success: true,
      message:
        "Academic Year created successfully",
      data: year,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Get All Academic Years
export const getAcademicYear = async (
  req,
  res
) => {
  try {

    const years =
      await Academicyear.find({
        isActive: true,
      }).sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: years.length,
      data: years,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Update Academic Year
export const updateAcademicYear = async (
  req,
  res
) => {
  try {

    const { id } = req.params;
    const {
      name,
      startDate,
      endDate,
    } = req.body;

    if (
      startDate &&
      endDate &&
      new Date(startDate) >=
      new Date(endDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Start Date must be before End Date",
      });
    }

    if (name) {
      const existingYear =
        await Academicyear.findOne({
          _id: { $ne: id },
          name,
          isActive: true,
        });

      if (existingYear) {
        return res.status(400).json({
          success: false,
          message:
            "Academic Year already exists",
        });
      }
    }

    const updatedYear =
      await Academicyear.findByIdAndUpdate(
        id,
        req.body,
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!updatedYear) {
      return res.status(404).json({
        success: false,
        message:
          "Academic Year not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Academic Year updated successfully",
      data: updatedYear,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Soft Delete Academic Year
export const deleteAcademicYear = async (
  req,
  res
) => {
  try {

    const { id } = req.params;

    const deletedAcademicYear =
      await Academicyear.findByIdAndUpdate(
        id,
        {
          isActive: false,
        },
        {
          returnDocument: "after",
        }
      );

    if (!deletedAcademicYear) {
      return res.status(404).json({
        success: false,
        message:
          "Academic Year not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Academic Year deleted successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Set Current Academic Year
export const setCurrentAcademicYear = async (
  req,
  res
) => {
  try {

    const { id } = req.params;

    const year =
      await Academicyear.findOne({
        _id: id,
        isActive: true,
      });

    if (!year) {
      return res.status(404).json({
        success: false,
        message:
          "Academic Year not found",
      });
    }

    // Unset isCurrent on all other years
    await Academicyear.updateMany(
      { isActive: true },
      { isCurrent: false }
    );

    // Set isCurrent on selected year
    year.isCurrent = true;
    await year.save();

    res.status(200).json({
      success: true,
      message:
        "Current academic year updated successfully",
      data: year,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
