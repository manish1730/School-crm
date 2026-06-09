import Admission from "../models/Admission.js";

export const createAdmission = async (req,res) => {
  try {

    const admission =
      await Admission.create(req.body);

    res.status(201).json(admission);

  } catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};