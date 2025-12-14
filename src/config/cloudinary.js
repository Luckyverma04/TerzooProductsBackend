import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "cloudinary";

// 🔥 FORCE env load HERE (ESM FIX)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// 🔥 CONFIG AFTER env is loaded
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary.v2;
