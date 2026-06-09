// import express from "express";
// import authRoutes from "./routes/authRoutes.js";

// const app = express();

// // Middleware
// app.use(express.json());

// // Routes
// app.use("/api/auth", authRoutes);

// // Test Route
// app.get("/", (req, res) => {
//   res.send("School CRM Backend Running");
// });

// const PORT = 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import admissionRoutes from "./routes/admissionRoutes.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

mongoose
.connect(process.env.MONGO_URI)
.then(()=>{
   console.log("MongoDB Connected");
})
.catch(err=>{
   console.log(err);
});

app.use("/api/auth", authRoutes);

app.use(
  "/api/admission",
  admissionRoutes
);

app.get("/",(req,res)=>{
  res.send("School CRM Backend Running");
});

app.listen(5000,()=>{
  console.log("Server running on port 5000");
});
