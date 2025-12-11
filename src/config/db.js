import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("===============================================");
    console.log("✔ MongoDB Connected Successfully");
    console.log("===============================================\n");
  } catch (error) {
    console.log("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
