import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import express from "express";

// Load server dependencies
import User from "../models/User.js";
import AcademicYear from "../models/AcademicYear.js";
import SchoolProfile from "../models/SchoolProfile.js";
import schoolProfileRoutes from "../routes/schoolProfileRoutes.js";
import authMiddleware from "../middleware/authMiddleware.js";

// Config environment
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}/api/school-profile`;

// Helper to sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log("=== STARTING SCHOOL PROFILE SETTINGS TEST SUITE ===");

  // 1. Connect to Database
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to database successfully.");

  // Clear existing test records if any to avoid contamination
  console.log("Cleaning up previous test data...");
  await User.deleteMany({ email: { $in: ["testadmin@test.com", "teststaff@test.com"] } });
  await AcademicYear.deleteMany({ name: "TEST-2026-27" });
  await SchoolProfile.deleteMany({ schoolName: "Test School Academy" });

  // 2. Setup Test Data
  console.log("Creating test users (Admin and Staff)...");
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const adminUser = await User.create({
    name: "Test Admin",
    email: "testadmin@test.com",
    password: hashedPassword,
    role: "Admin",
    isActive: true,
  });

  const staffUser = await User.create({
    name: "Test Staff",
    email: "teststaff@test.com",
    password: hashedPassword,
    role: "Staff",
    isActive: true,
  });

  console.log("Creating test Academic Year...");
  const academicYear = await AcademicYear.create({
    name: "TEST-2026-27",
    startDate: new Date("2026-06-01"),
    endDate: new Date("2027-05-31"),
    isCurrent: true,
    isActive: true,
  });

  // 3. Generate JWT Tokens
  const adminToken = jwt.sign(
    { id: adminUser._id, role: adminUser.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const staffToken = jwt.sign(
    { id: staffUser._id, role: staffUser.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const expiredToken = jwt.sign(
    { id: adminUser._id, role: adminUser.role },
    process.env.JWT_SECRET,
    { expiresIn: "-1h" }
  );

  // 4. Start Test server
  console.log("Initializing Test server...");
  const app = express();
  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
  app.use("/api/school-profile", schoolProfileRoutes);

  const server = app.listen(PORT);
  console.log(`Test server listening on port ${PORT}`);

  let passed = 0;
  let failed = 0;

  function assertEqual(actual, expected, message) {
    if (actual === expected) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message} (Expected: "${expected}", Got: "${actual}")`);
      failed++;
    }
  }

  function assertContains(actual, search, message) {
    if (String(actual).includes(search)) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message} (Expected to contain: "${search}", Got: "${actual}")`);
      failed++;
    }
  }

  try {
    // --- TEST CASE 1: JWT Protection (Missing & Invalid Token) ---
    console.log("\n--- Test Case 1: JWT Protection ---");
    
    // GET without token
    const resNoToken = await fetch(BASE_URL);
    assertEqual(resNoToken.status, 401, "GET without token rejects with 401");
    const jsonNoToken = await resNoToken.json();
    assertEqual(jsonNoToken.message, "No token provided", "GET without token message is 'No token provided'");

    // GET with expired token
    const resExpired = await fetch(BASE_URL, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assertEqual(resExpired.status, 401, "GET with expired token rejects with 401");
    const jsonExpired = await resExpired.json();
    assertEqual(jsonExpired.message, "Invalid token", "GET with expired token message is 'Invalid token'");

    // --- TEST CASE 2: Role Protection ---
    console.log("\n--- Test Case 2: Role Protection ---");
    
    // GET by Staff
    const resStaffGet = await fetch(BASE_URL, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assertEqual(resStaffGet.status, 403, "GET by Staff rejects with 403");
    const jsonStaffGet = await resStaffGet.json();
    assertEqual(jsonStaffGet.message, "Only Admin Can Access This Resource", "GET by Staff message is correct");

    // POST by Staff
    const resStaffPost = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${staffToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ schoolName: "Forbidden School" }),
    });
    assertEqual(resStaffPost.status, 403, "POST by Staff rejects with 403");

    // --- TEST CASE 3: Valid Profile Creation ---
    console.log("\n--- Test Case 3: Valid Profile Creation ---");
    
    const validProfileData = {
      schoolName: "Test School Academy",
      shortName: "tsa", // lowercase, should be converted to uppercase by backend
      establishedYear: 2020,
      boardAffiliation: "CBSE",
      schoolType: "Private",
      email: "info@testschool.com",
      phone: "9876543210",
      alternatePhone: "9876543211",
      website: "https://testschool.com",
      addressLine1: "123 Education Lane",
      city: "Campus City",
      state: "Punjab",
      country: "India",
      pincode: "141001",
      chairman: "Chairman John",
      principal: "Principal Jane",
      vicePrincipal: "Vice Principal Jack",
      adminHead: "Admin Head Jim",
      academicYearId: academicYear._id.toString(),
      sessionStatus: "Active",
      attendanceEnabled: true,
      feeManagementEnabled: true,
      examEnabled: true,
      transportEnabled: false,
      smsNotificationsEnabled: true,
      emailNotificationsEnabled: false,
    };

    const resCreate = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validProfileData),
    });

    assertEqual(resCreate.status, 201, "Admin creates profile with 201");
    const jsonCreate = await resCreate.json();
    assertEqual(jsonCreate.success, true, "Create response success is true");
    assertEqual(jsonCreate.message, "School Profile Created Successfully", "Success message is correct");
    assertEqual(jsonCreate.data.shortName, "TSA", "Short Name is uppercase in database");
    assertEqual(jsonCreate.data.createdBy, adminUser._id.toString(), "createdBy field set correctly");

    const createdProfileId = jsonCreate.data._id;

    // --- TEST CASE 4: Duplicate Profile Creation ---
    console.log("\n--- Test Case 4: Duplicate Profile Creation ---");
    
    const resCreateDuplicate = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validProfileData),
    });

    assertEqual(resCreateDuplicate.status, 400, "Create duplicate profile rejects with 400");
    const jsonDuplicate = await resCreateDuplicate.json();
    assertEqual(jsonDuplicate.success, false, "Duplicate success is false");
    assertEqual(jsonDuplicate.message, "School Profile Already Exists", "Duplicate message is correct");

    // --- TEST CASE 5: Validation Failures ---
    console.log("\n--- Test Case 5: Validation Failures ---");

    // 5.1 Invalid Email
    const resInvalidEmail = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...validProfileData,
        schoolName: "Invalid Email Academy",
        email: "invalid-email",
      }),
    });
    assertEqual(resInvalidEmail.status, 400, "Invalid email rejects with 400");
    const jsonInvalidEmail = await resInvalidEmail.json();
    assertEqual(jsonInvalidEmail.message, "Valid Email Is Required", "Email validation message is correct");

    // 5.2 Invalid Phone
    const resInvalidPhone = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...validProfileData,
        schoolName: "Invalid Phone Academy",
        phone: "12345",
      }),
    });
    assertEqual(resInvalidPhone.status, 400, "Invalid phone rejects with 400");
    const jsonInvalidPhone = await resInvalidPhone.json();
    assertEqual(jsonInvalidPhone.message, "Phone Number Must Be 10 Digits", "Phone validation message is correct");

    // 5.3 Future Established Year
    const resFutureYear = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...validProfileData,
        schoolName: "Future Year Academy",
        establishedYear: new Date().getFullYear() + 1,
      }),
    });
    assertEqual(resFutureYear.status, 400, "Future year rejects with 400");

    // 5.4 Invalid Pincode
    const resInvalidPincode = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...validProfileData,
        schoolName: "Invalid Pincode Academy",
        pincode: "12345", // must be 6
      }),
    });
    assertEqual(resInvalidPincode.status, 400, "Invalid pincode rejects with 400");

    // --- TEST CASE 6: Profile Update ---
    console.log("\n--- Test Case 6: Profile Update ---");
    
    const updateBody = {
      schoolName: "Test School Academy",
      shortName: "TSA",
      establishedYear: 2020,
      boardAffiliation: "CBSE",
      schoolType: "Private",
      email: "info@testschool.com",
      phone: "9876543210",
      addressLine1: "123 Education Lane Updated",
      city: "Campus City",
      state: "Punjab",
      country: "India",
      pincode: "141001",
      chairman: "Chairman John Updated",
      principal: "Principal Jane",
      adminHead: "Admin Head Jim",
      academicYearId: academicYear._id.toString(),
      sessionStatus: "Inactive",
    };

    const resUpdate = await fetch(`${BASE_URL}/${createdProfileId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateBody),
    });

    assertEqual(resUpdate.status, 200, "Update profile returns 200");
    const jsonUpdate = await resUpdate.json();
    assertEqual(jsonUpdate.success, true, "Update success is true");
    assertEqual(jsonUpdate.message, "School Profile Updated Successfully", "Success message is correct");
    assertEqual(jsonUpdate.data.chairman, "Chairman John Updated", "Chairman field updated correctly");
    assertEqual(jsonUpdate.data.sessionStatus, "Inactive", "sessionStatus field updated correctly");
    assertEqual(jsonUpdate.data.updatedBy, adminUser._id.toString(), "updatedBy field set correctly");

    // --- TEST CASE 7: Image Uploads ---
    console.log("\n--- Test Case 7: Image Uploads ---");

    // Create temp files for testing upload
    const uploadsTestDir = path.join(__dirname, "temp-uploads");
    if (!fs.existsSync(uploadsTestDir)) {
      fs.mkdirSync(uploadsTestDir);
    }
    
    const validImgPath = path.join(uploadsTestDir, "valid.png");
    const invalidDocPath = path.join(uploadsTestDir, "invalid.pdf");
    const largeImgPath = path.join(uploadsTestDir, "large.png");

    fs.writeFileSync(validImgPath, Buffer.alloc(1024)); // 1 KB PNG
    fs.writeFileSync(invalidDocPath, "PDF Header dummy content"); // PDF
    fs.writeFileSync(largeImgPath, Buffer.alloc(6 * 1024 * 1024)); // 6 MB (Limit is 5MB)

    // Helper to send multipart request
    const uploadFile = async (filePath, fieldname, mimeType, type = "logo") => {
      const form = new FormData();
      const fileBuffer = fs.readFileSync(filePath);
      const blob = new Blob([fileBuffer], { type: mimeType });
      form.append("image", blob, path.basename(filePath));
      form.append("type", type);

      return await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: form,
      });
    };

    // 7.1 Valid Upload
    console.log("Uploading valid image...");
    const resValidUpload = await uploadFile(validImgPath, "image", "image/png", "logo");
    assertEqual(resValidUpload.status, 200, "Valid image upload returns 200");
    const jsonValidUpload = await resValidUpload.json();
    assertEqual(jsonValidUpload.message, "Logo Uploaded Successfully", "Dynamic success message for logo works");
    assertContains(jsonValidUpload.data.url, "/uploads/image-", "Returns valid local uploads URL");

    // 7.2 Invalid Format Upload
    console.log("Uploading invalid format (PDF)...");
    const resInvalidUpload = await uploadFile(invalidDocPath, "image", "application/pdf", "logo");
    assertEqual(resInvalidUpload.status, 400, "Invalid format upload returns 400");
    const jsonInvalidUpload = await resInvalidUpload.json();
    assertEqual(jsonInvalidUpload.message, "Invalid file format", "Returns 'Invalid file format' error");

    // 7.3 Large File Upload (> 5MB)
    console.log("Uploading large image (> 5MB)...");
    const resLargeUpload = await uploadFile(largeImgPath, "image", "image/png", "banner");
    assertEqual(resLargeUpload.status, 400, "Large image upload returns 400");
    const jsonLargeUpload = await resLargeUpload.json();
    assertEqual(jsonLargeUpload.message, "File size must be less than 5MB", "Returns file size limit error");

    // Cleanup temp local test files
    fs.rmSync(uploadsTestDir, { recursive: true, force: true });
    
    // --- TEST CASE 8: Soft Delete ---
    console.log("\n--- Test Case 8: Soft Delete ---");
    const resDelete = await fetch(`${BASE_URL}/${createdProfileId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assertEqual(resDelete.status, 200, "Delete profile returns 200");
    
    // Verify in DB that it is inactive
    const deletedProfile = await SchoolProfile.findById(createdProfileId).lean();
    assertEqual(deletedProfile.isActive, false, "Profile isActive is false in database");

    // --- CLEANUP ---
    console.log("\nCleaning up test data from database...");
    await User.deleteMany({ email: { $in: ["testadmin@test.com", "teststaff@test.com"] } });
    await AcademicYear.deleteMany({ name: "TEST-2026-27" });
    await SchoolProfile.deleteMany({ schoolName: "Test School Academy" });

  } catch (error) {
    console.error("Test execution failed with error:", error);
    failed++;
  } finally {
    // Close Server
    server.close();
    mongoose.connection.close();
    console.log(`\n=== TEST SUITE COMPLETED ===`);
    console.log(`Passed: ${passed} | Failed: ${failed}`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runTests();
